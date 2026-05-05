-- This file runs automatically when the PostgreSQL container starts for the first time.
-- GORM handles migrations too, but this ensures clean initial state.

-- No need to CREATE DATABASE — Docker POSTGRES_DB does that.

-- Optional: Create indexes that GORM might not auto-create
-- (GORM handles basic indexes via struct tags, but we add extras here)

-- Full-text search support (optional enhancement over ILIKE)
-- Uncomment if you want tsvector-based search later:
--
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector;
-- CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(search_vector);
