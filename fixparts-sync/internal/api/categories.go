package api

import (
	"net/http"

	"github.com/fixparts/sync/internal/database"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CategoryList handles GET /api/categories.
//
// Odoo exposes internal taxonomy (root "All", "All / Deliveries",
// "All / Expenses", "All / Saleable / PoS", etc.) that shouldn't be
// shown to customers. We filter those out by excluding any name that
// starts with "All" or contains the path separator " / ", and dedupe
// the customer-facing names by trimming whitespace.
func CategoryList(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var categories []database.CategoryWithCount

		err := db.Raw(`
			SELECT
				MIN(c.id) AS id,
				TRIM(c.name) AS name,
				COUNT(DISTINCT p.id) AS product_count
			FROM categories c
			LEFT JOIN products p
				ON LOWER(TRIM(p.category_name)) = LOWER(TRIM(c.name))
				AND p.is_active = true
			WHERE TRIM(c.name) <> ''
			  AND TRIM(c.name) NOT ILIKE 'All'
			  AND TRIM(c.name) NOT ILIKE 'All %'
			  AND TRIM(c.name) NOT ILIKE '% / %'
			  AND TRIM(c.name) NOT IN ('Deliveries', 'Expenses', 'Saleable', 'PoS')
			GROUP BY TRIM(c.name)
			HAVING COUNT(DISTINCT p.id) > 0
			ORDER BY TRIM(c.name) ASC
		`).Scan(&categories).Error

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"data":  categories,
			"total": len(categories),
		})
	}
}
