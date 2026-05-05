package api

import (
	"net/http"

	"github.com/fixparts/sync/internal/config"
	"github.com/fixparts/sync/internal/database"
	syncpkg "github.com/fixparts/sync/internal/sync"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// SyncTrigger handles POST /api/sync/trigger — manually triggers a sync.
// Protected by X-API-Key header.
func SyncTrigger(cfg *config.Config, syncEngine *syncpkg.Engine) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Verify API key
		apiKey := c.GetHeader("X-API-Key")
		if apiKey != cfg.APIKey {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid API key"})
			return
		}

		if syncEngine.IsRunning() {
			c.JSON(http.StatusConflict, gin.H{"error": "Sync is already running"})
			return
		}

		// Run sync in a goroutine so the API returns immediately
		go syncEngine.Run()

		c.JSON(http.StatusAccepted, gin.H{
			"status":  "started",
			"message": "Sync has been triggered. Check /api/stats for progress.",
		})
	}
}

// Stats handles GET /api/stats — returns sync status and counts.
func Stats(db *gorm.DB, syncEngine *syncpkg.Engine) gin.HandlerFunc {
	return func(c *gin.Context) {
		var productCount, brandCount, categoryCount int64
		db.Model(&database.Product{}).Where("is_active = ?", true).Count(&productCount)
		db.Model(&database.Brand{}).Count(&brandCount)
		db.Model(&database.Category{}).Count(&categoryCount)

		stats := gin.H{
			"total_products":   productCount,
			"total_brands":     brandCount,
			"total_categories": categoryCount,
			"sync_running":     syncEngine.IsRunning(),
			"last_sync":        nil,
			"last_result":      nil,
		}

		if lastSync := syncEngine.LastSync(); !lastSync.IsZero() {
			stats["last_sync"] = lastSync
		}
		if lastResult := syncEngine.LastResult(); lastResult != nil {
			stats["last_result"] = lastResult
		}

		c.JSON(http.StatusOK, stats)
	}
}
