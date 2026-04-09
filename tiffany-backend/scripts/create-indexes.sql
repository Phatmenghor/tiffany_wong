-- ============================================
-- CRITICAL INDEXES FOR PRODUCT FILTERS
-- ============================================
-- Run this in pgAdmin to speed up all filters

-- MOST IMPORTANT: ProductSize filter (hasSizes)
CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id_deleted ON product_sizes(product_id, is_deleted);

-- Category filter
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Status filter
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- Price filter
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- Promotion filter
CREATE INDEX IF NOT EXISTS idx_products_promotion_type_value ON products(promotion_type, promotion_value);
CREATE INDEX IF NOT EXISTS idx_products_promotion_dates ON products(promotion_from_date, promotion_to_date);

-- Soft delete
CREATE INDEX IF NOT EXISTS idx_products_is_deleted ON products(is_deleted);

-- Search
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING GIN(to_tsvector('english', name));

-- Analyze for query optimization
ANALYZE products;
ANALYZE product_sizes;
