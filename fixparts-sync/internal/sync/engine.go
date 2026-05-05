package sync

import (
	"fmt"
	"log"
	"sync/atomic"
	"time"

	"github.com/fixparts/sync/internal/database"
	"github.com/fixparts/sync/internal/images"
	"github.com/fixparts/sync/internal/odoo"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// Engine orchestrates the Odoo → PostgreSQL sync process.
type Engine struct {
	db        *gorm.DB
	odoo      *odoo.Client
	images    *images.Processor
	batchSize int

	// Sync state (thread-safe)
	running    atomic.Bool
	lastSync   atomic.Value // time.Time
	lastResult atomic.Value // *Result
}

// Result holds the outcome of a sync run.
type Result struct {
	Status      string    `json:"status"`
	Synced      int       `json:"synced"`
	Errors      int       `json:"errors"`
	Skipped     int       `json:"skipped"`
	Total       int       `json:"total"`
	Duration    string    `json:"duration"`
	StartedAt   time.Time `json:"started_at"`
	CompletedAt time.Time `json:"completed_at"`
	ErrorList   []string  `json:"error_list,omitempty"`
}

// NewEngine creates a new sync engine.
func NewEngine(db *gorm.DB, odooClient *odoo.Client, imgProcessor *images.Processor, batchSize int) *Engine {
	e := &Engine{
		db:        db,
		odoo:      odooClient,
		images:    imgProcessor,
		batchSize: batchSize,
	}
	e.lastSync.Store(time.Time{})
	return e
}

// IsRunning returns whether a sync is currently in progress.
func (e *Engine) IsRunning() bool {
	return e.running.Load()
}

// LastSync returns the time of the last completed sync.
func (e *Engine) LastSync() time.Time {
	if t, ok := e.lastSync.Load().(time.Time); ok {
		return t
	}
	return time.Time{}
}

// LastResult returns the result of the last sync run.
func (e *Engine) LastResult() *Result {
	if r, ok := e.lastResult.Load().(*Result); ok {
		return r
	}
	return nil
}

// Run executes a full sync from Odoo to PostgreSQL.
func (e *Engine) Run() *Result {
	// Prevent concurrent syncs
	if !e.running.CompareAndSwap(false, true) {
		log.Println("⚠️  Sync already running, skipping")
		return &Result{Status: "skipped", Duration: "0s"}
	}
	defer e.running.Store(false)

	startedAt := time.Now()
	log.Println("🚀 Starting product sync from Odoo...")

	result := &Result{
		Status:    "running",
		StartedAt: startedAt,
	}

	// Step 1: Get total count
	total, err := e.odoo.SearchCount()
	if err != nil {
		log.Printf("❌ Failed to get product count: %v", err)
		result.Status = "failed"
		result.ErrorList = append(result.ErrorList, fmt.Sprintf("SearchCount: %v", err))
		result.CompletedAt = time.Now()
		result.Duration = time.Since(startedAt).Round(time.Second).String()
		e.lastResult.Store(result)
		return result
	}

	result.Total = total
	totalBatches := (total + e.batchSize - 1) / e.batchSize
	log.Printf("📦 Total products to sync: %d (%d batches of %d)", total, totalBatches, e.batchSize)

	// Step 2: Process in batches
	offset := 0
	for batch := 1; batch <= totalBatches; batch++ {
		log.Printf("🔄 Batch %d/%d (offset: %d)...", batch, totalBatches, offset)

		products, err := e.odoo.SearchRead(offset, e.batchSize)
		if err != nil {
			errMsg := fmt.Sprintf("Batch %d fetch error: %v", batch, err)
			log.Printf("❌ %s", errMsg)
			result.ErrorList = append(result.ErrorList, errMsg)
			result.Errors++

			// Retry once
			log.Printf("🔁 Retrying batch %d...", batch)
			time.Sleep(2 * time.Second)
			products, err = e.odoo.SearchRead(offset, e.batchSize)
			if err != nil {
				log.Printf("❌ Retry failed, skipping batch %d", batch)
				offset += e.batchSize
				continue
			}
		}

		if len(products) == 0 {
			log.Println("⚠️  No more products returned, stopping")
			break
		}

		synced, errors, skipped := e.processBatch(products, result)
		result.Synced += synced
		result.Errors += errors
		result.Skipped += skipped

		log.Printf("✅ Batch %d: synced=%d, errors=%d, skipped=%d", batch, synced, errors, skipped)
		offset += e.batchSize
	}

	// Done
	result.Status = "completed"
	result.CompletedAt = time.Now()
	result.Duration = time.Since(startedAt).Round(time.Second).String()

	// Cap error list to avoid huge responses
	if len(result.ErrorList) > 20 {
		result.ErrorList = result.ErrorList[:20]
	}

	e.lastSync.Store(time.Now())
	e.lastResult.Store(result)

	log.Printf("🏁 Sync complete: %d synced, %d errors, %d skipped in %s",
		result.Synced, result.Errors, result.Skipped, result.Duration)

	return result
}

// processBatch handles a single batch of products.
func (e *Engine) processBatch(products []odoo.OdooProduct, result *Result) (synced, errors, skipped int) {
	// Collect unique brands and categories
	brandsMap := make(map[int64]string)
	categoriesMap := make(map[int64]string)

	for _, p := range products {
		if brandID, brandName := p.GetBrandID(); brandID > 0 {
			brandsMap[brandID] = brandName
		}
		if categID, categName := p.GetCategID(); categID > 0 {
			categoriesMap[categID] = categName
		}
	}

	// Upsert brands
	if len(brandsMap) > 0 {
		var brands []database.Brand
		for id, name := range brandsMap {
			brands = append(brands, database.Brand{ID: id, Name: name})
		}
		if err := e.db.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "id"}},
			DoUpdates: clause.AssignmentColumns([]string{"name"}),
		}).Create(&brands).Error; err != nil {
			log.Printf("⚠️  Brand upsert error: %v", err)
		}
	}

	// Upsert categories
	if len(categoriesMap) > 0 {
		var categories []database.Category
		for id, name := range categoriesMap {
			categories = append(categories, database.Category{ID: id, Name: name})
		}
		if err := e.db.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "id"}},
			DoUpdates: clause.AssignmentColumns([]string{"name"}),
		}).Create(&categories).Error; err != nil {
			log.Printf("⚠️  Category upsert error: %v", err)
		}
	}

	// Process each product
	now := time.Now()
	for _, p := range products {
		if p.Name == "" {
			skipped++
			continue
		}

		// Process image
		var imageURL *string
		if imgData := p.GetImage(); imgData != "" {
			url, err := e.images.Process(p.ID, imgData)
			if err != nil {
				log.Printf("⚠️  Image error for product %d: %v", p.ID, err)
				// Don't fail the product — just skip the image
			} else if url != "" {
				imageURL = &url
			}
		}

		// Build product record
		defaultCode := p.GetDefaultCode()
		categID, categName := p.GetCategID()
		brandID, brandName := p.GetBrandID()

		product := database.Product{
			ID:       p.ID,
			Name:     p.Name,
			IsActive: true,
			SyncedAt: &now,
		}

		if defaultCode != "" {
			product.DefaultCode = &defaultCode
		}
		if categID > 0 {
			product.CategoryID = &categID
			product.CategoryName = &categName
		}
		if brandID > 0 {
			product.BrandID = &brandID
			product.BrandName = &brandName
		}
		if imageURL != nil {
			product.ImageURL = imageURL
		}
		if p.ListPrice > 0 {
			product.Price = &p.ListPrice
		}

		// Upsert product
		if err := e.db.Clauses(clause.OnConflict{
			Columns: []clause.Column{{Name: "id"}},
			DoUpdates: clause.AssignmentColumns([]string{
				"name", "default_code", "category_id", "category_name",
				"brand_id", "brand_name", "image_url", "price",
				"is_active", "synced_at",
			}),
		}).Create(&product).Error; err != nil {
			errMsg := fmt.Sprintf("Product %d (%s): %v", p.ID, p.Name, err)
			log.Printf("❌ %s", errMsg)
			result.ErrorList = append(result.ErrorList, errMsg)
			errors++
			continue
		}

		synced++
	}

	return synced, errors, skipped
}
