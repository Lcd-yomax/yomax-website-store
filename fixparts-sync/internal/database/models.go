package database

import (
	"time"
)

// Brand represents a product brand from Odoo.
type Brand struct {
	ID        int64     `gorm:"primaryKey;autoIncrement:false" json:"id"`
	Name      string    `gorm:"type:varchar(255);not null" json:"name"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}

// Category represents a product category from Odoo.
type Category struct {
	ID        int64     `gorm:"primaryKey;autoIncrement:false" json:"id"`
	Name      string    `gorm:"type:varchar(255);not null" json:"name"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}

// Product represents a product synced from Odoo.
type Product struct {
	ID           int64      `gorm:"primaryKey;autoIncrement:false" json:"id"`
	Name         string     `gorm:"type:text;not null" json:"name"`
	DefaultCode  *string    `gorm:"type:varchar(100);index" json:"default_code"`
	CategoryID   *int64     `gorm:"index" json:"category_id"`
	CategoryName *string    `gorm:"type:varchar(255)" json:"category_name"`
	BrandID      *int64     `gorm:"index" json:"brand_id"`
	BrandName    *string    `gorm:"type:varchar(255)" json:"brand_name"`
	ImageURL     *string    `gorm:"type:text" json:"image_url"`
	Price        *float64   `gorm:"type:decimal(12,2)" json:"price"`
	IsActive     bool       `gorm:"default:true;index" json:"is_active"`
	SyncedAt     *time.Time `json:"synced_at"`
	CreatedAt    time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
}

// BrandWithCount is used for the brands API response with product counts.
type BrandWithCount struct {
	ID           int64  `json:"id"`
	Name         string `json:"name"`
	ProductCount int64  `json:"product_count"`
}

// CategoryWithCount is used for the categories API response with product counts.
type CategoryWithCount struct {
	ID           int64  `json:"id"`
	Name         string `json:"name"`
	ProductCount int64  `json:"product_count"`
}
