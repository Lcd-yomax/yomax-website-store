package api

import (
	"log"

	"github.com/fixparts/sync/internal/config"
	syncpkg "github.com/fixparts/sync/internal/sync"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// SetupRouter creates and configures the Gin HTTP router.
func SetupRouter(db *gorm.DB, cfg *config.Config, syncEngine *syncpkg.Engine) *gin.Engine {
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	// CORS — allow the Next.js frontend to call this API
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // Restrict this in production
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "X-API-Key"},
		AllowCredentials: true,
	}))

	// Serve product images as static files
	r.Static("/images", cfg.ImageDir)

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// API routes
	api := r.Group("/api")
	{
		// Products
		api.GET("/products", ProductList(db))
		api.GET("/products/:id", ProductDetail(db))

		// Brands
		api.GET("/brands", BrandList(db))

		// Categories
		api.GET("/categories", CategoryList(db))

		// Stats
		api.GET("/stats", Stats(db, syncEngine))

		// Manual sync trigger (protected by API key)
		api.POST("/sync/trigger", SyncTrigger(cfg, syncEngine))
	}

	log.Printf("📡 API routes registered")
	return r
}
