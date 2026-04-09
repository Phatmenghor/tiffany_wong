-- ============================================
-- Product Filter Optimization - Index Creation
-- ============================================
-- This script creates indexes for all product filtering queries
-- Run in pgAdmin or psql before using product filters
-- ============================================

-- 1. ProductSize Indexes (for hasSizes filter)
CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id
ON product_sizes(product_id);

CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id_deleted
ON product_sizes(product_id, is_deleted);

-- 2. Product Category Filter
CREATE INDEX IF NOT EXISTS idx_products_category_id
ON products(category_id);

-- 3. Product Status Filter
CREATE INDEX IF NOT EXISTS idx_products_status
ON products(status);

-- 4. Product Price Range Filter
CREATE INDEX IF NOT EXISTS idx_products_price
ON products(price);

-- 5. Product Promotion Filter (Active Promotions)
CREATE INDEX IF NOT EXISTS idx_products_promotion_type_value
ON products(promotion_type, promotion_value);

CREATE INDEX IF NOT EXISTS idx_products_promotion_dates
ON products(promotion_from_date, promotion_to_date);

-- 6. Product Soft Delete (used in all queries)
CREATE INDEX IF NOT EXISTS idx_products_is_deleted
ON products(is_deleted);

CREATE INDEX IF NOT EXISTS idx_product_sizes_is_deleted
ON product_sizes(is_deleted);

-- 7. Product Search (name and description)
CREATE INDEX IF NOT EXISTS idx_products_name_search
ON products USING GIN(to_tsvector('english', name));

CREATE INDEX IF NOT EXISTS idx_products_description_search
ON products USING GIN(to_tsvector('english', description));

-- 8. Composite Indexes for Common Filter Combinations
-- These speed up queries with multiple filter conditions
CREATE INDEX IF NOT EXISTS idx_products_category_status_deleted
ON products(category_id, status, is_deleted);

CREATE INDEX IF NOT EXISTS idx_products_price_status_deleted
ON products(price, status, is_deleted);

CREATE INDEX IF NOT EXISTS idx_products_promotion_status_deleted
ON products(promotion_type, promotion_value, status, is_deleted);

-- 9. Category and Brand Indexes (for dropdown filters)
CREATE INDEX IF NOT EXISTS idx_categories_is_deleted
ON categories(is_deleted);

CREATE INDEX IF NOT EXISTS idx_brands_is_deleted
ON brands(is_deleted);

-- 10. Analyze tables to update statistics for query planner
ANALYZE products;
ANALYZE product_sizes;
ANALYZE categories;
ANALYZE brands;

-- ============================================
-- Index Summary
-- ============================================
-- Total: 18 indexes created
--
-- Usage:
-- 1. Open pgAdmin
-- 2. Select your database
-- 3. Tools → Query Tool
-- 4. Copy and paste this entire script
-- 5. Execute (F5 or Run button)
--
-- Verify indexes were created:
-- SELECT * FROM pg_indexes
-- WHERE tablename IN ('products', 'product_sizes', 'categories', 'brands');
--
-- ============================================
