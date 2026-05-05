package api

import (
	"net/http"

	"github.com/fixparts/sync/internal/database"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// BrandList handles GET /api/brands.
//
// Odoo has duplicate brand records (same name, different IDs). We group
// by trimmed name and pick the lowest id as canonical, summing product
// counts across all duplicate ids. Filtering products by this canonical
// id is handled in ProductList by switching to a brand_name match.
func BrandList(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var brands []database.BrandWithCount

		err := db.Raw(`
			SELECT
				MIN(b.id) AS id,
				TRIM(b.name) AS name,
				COUNT(DISTINCT p.id) AS product_count
			FROM brands b
			LEFT JOIN products p
				ON LOWER(TRIM(p.brand_name)) = LOWER(TRIM(b.name))
				AND p.is_active = true
			WHERE TRIM(b.name) <> ''
			GROUP BY TRIM(b.name)
			HAVING COUNT(DISTINCT p.id) > 0
			ORDER BY TRIM(b.name) ASC
		`).Scan(&brands).Error

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch brands"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"data":  brands,
			"total": len(brands),
		})
	}
}
