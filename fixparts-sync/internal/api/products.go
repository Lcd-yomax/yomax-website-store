package api

import (
	"math"
	"net/http"
	"strconv"

	"github.com/fixparts/sync/internal/database"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ProductList handles GET /api/products with filtering, search, and pagination.
func ProductList(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Parse pagination
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
		if page < 1 {
			page = 1
		}
		if limit < 1 || limit > 100 {
			limit = 20
		}
		offset := (page - 1) * limit

		// Build query
		query := db.Model(&database.Product{}).Where("is_active = ?", true)

		// Filter by brand. The brands API dedupes duplicate-name brand
		// records to one canonical id per name, so when the client
		// passes brand_id we resolve it to the brand name and match
		// across every duplicate id sharing that name.
		if brandID := c.Query("brand_id"); brandID != "" {
			var brand database.Brand
			if err := db.First(&brand, "id = ?", brandID).Error; err == nil && brand.Name != "" {
				query = query.Where("LOWER(TRIM(brand_name)) = LOWER(TRIM(?))", brand.Name)
			} else {
				query = query.Where("brand_id = ?", brandID)
			}
		}

		// Filter by category — same rationale as brand.
		if categoryID := c.Query("category_id"); categoryID != "" {
			var cat database.Category
			if err := db.First(&cat, "id = ?", categoryID).Error; err == nil && cat.Name != "" {
				query = query.Where("LOWER(TRIM(category_name)) = LOWER(TRIM(?))", cat.Name)
			} else {
				query = query.Where("category_id = ?", categoryID)
			}
		}

		// Full-text search on name and default_code
		if search := c.Query("search"); search != "" {
			query = query.Where(
				"name ILIKE ? OR default_code ILIKE ?",
				"%"+search+"%", "%"+search+"%",
			)
		}

		// Get total count (before pagination)
		var total int64
		query.Count(&total)

		// Sorting
		switch c.DefaultQuery("sort", "newest") {
		case "name_asc":
			query = query.Order("name ASC")
		case "name_desc":
			query = query.Order("name DESC")
		case "price_asc":
			query = query.Order("price ASC NULLS LAST")
		case "price_desc":
			query = query.Order("price DESC NULLS LAST")
		default: // "newest"
			query = query.Order("synced_at DESC")
		}

		// Fetch paginated results
		var products []database.Product
		if err := query.Offset(offset).Limit(limit).Find(&products).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
			return
		}

		totalPages := int(math.Ceil(float64(total) / float64(limit)))

		c.JSON(http.StatusOK, gin.H{
			"data": products,
			"pagination": gin.H{
				"page":        page,
				"limit":       limit,
				"total":       total,
				"total_pages": totalPages,
			},
		})
	}
}

// ProductDetail handles GET /api/products/:id
func ProductDetail(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		var product database.Product
		if err := db.First(&product, id).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"data": product})
	}
}
