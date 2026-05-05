package database

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Connect opens a PostgreSQL connection and runs auto-migrations.
func Connect(dsn string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}
	sqlDB.SetMaxOpenConns(10)
	sqlDB.SetMaxIdleConns(5)

	// Auto-migrate tables
	log.Println("📦 Running database migrations...")
	if err := db.AutoMigrate(&Brand{}, &Category{}, &Product{}); err != nil {
		return nil, fmt.Errorf("migration failed: %w", err)
	}

	// Expression indexes for the brands/categories list queries.
	// LOWER(TRIM(...)) calls on JOIN columns prevent index usage without these.
	// IF NOT EXISTS makes all statements idempotent.
	indexes := []string{
		`CREATE INDEX IF NOT EXISTS idx_brands_name_normalized
		    ON brands (LOWER(TRIM(name)))`,
		`CREATE INDEX IF NOT EXISTS idx_categories_name_normalized
		    ON categories (LOWER(TRIM(name)))`,
		`CREATE INDEX IF NOT EXISTS idx_products_brand_name_active
		    ON products (LOWER(TRIM(brand_name)))
		    WHERE is_active = true`,
		`CREATE INDEX IF NOT EXISTS idx_products_category_name_active
		    ON products (LOWER(TRIM(category_name)))
		    WHERE is_active = true`,
	}
	for _, stmt := range indexes {
		if err := db.Exec(stmt).Error; err != nil {
			return nil, fmt.Errorf("index creation failed: %w", err)
		}
	}

	log.Println("✅ Database connected and migrated")
	return db, nil
}
