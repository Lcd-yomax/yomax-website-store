-- Expression indexes to speed up the brands and categories list queries.
--
-- The BrandList and CategoryList handlers join products to brands/categories
-- using LOWER(TRIM(...)) on both sides, and filter/group by TRIM(name).
-- Without expression indexes PostgreSQL falls back to sequential scans,
-- resulting in 300-400ms query times.
--
-- These partial expression indexes mirror the exact expressions used in
-- the queries so the planner can use index scans instead.

-- brands: index on normalised name for GROUP BY / ORDER BY / WHERE
CREATE INDEX IF NOT EXISTS idx_brands_name_normalized
    ON brands (LOWER(TRIM(name)));

-- categories: same
CREATE INDEX IF NOT EXISTS idx_categories_name_normalized
    ON categories (LOWER(TRIM(name)));

-- products: index on normalised brand_name, restricted to active rows
-- (the JOIN already filters AND p.is_active = true)
CREATE INDEX IF NOT EXISTS idx_products_brand_name_active
    ON products (LOWER(TRIM(brand_name)))
    WHERE is_active = true;

-- products: index on normalised category_name, restricted to active rows
CREATE INDEX IF NOT EXISTS idx_products_category_name_active
    ON products (LOWER(TRIM(category_name)))
    WHERE is_active = true;
