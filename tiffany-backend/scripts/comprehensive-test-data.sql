-- ============================================================================
-- TIFFANY E-MENU PLATFORM - LARGE SCALE TEST DATA
-- ============================================================================
-- DEFAULT PASSWORD FOR ALL USERS: 88889999
-- Password Hash (bcrypt): $2a$12$C3nxQcF8f1rHHOJnyE0ZFOHOYXTn4/pCvUNBkhNPrS40WrnQ9gZ36
-- PLACEHOLDER IMAGE URL: https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce
--
-- Users: 60,003 total
--   - 20,000 ADMIN users (UserType: OWNER, UserRole: ADMIN)
--     - phatmenghor19@gmail.com (ADMIN)
--     - phatmenghor20@gmail.com (OWNER with ADMIN role)
--     - 19,998 additional ADMIN users
--   - 20,000 STAFF users (UserType: OWNER, UserRole: STAFF)
--   - 20,003 CUSTOMER users (UserType: CUSTOMER, UserRole: CUSTOMER)
-- Products: 100,000 with detailed descriptions and varying sizes (5-10 per product)
-- Product Images: 1-5 per product
-- Categories: 200
-- Banners: 20
-- Carts: All 20,001 customers
-- Orders: 20,000 for phatmenghor21@gmail.com
-- ============================================================================

-- ============================================================================
-- 0. CLEANUP - DELETE ALL EXISTING DATA (Foreign Key Order)
-- ============================================================================
DELETE FROM product_favorites;
DELETE FROM order_status_history;
DELETE FROM order_items;
DELETE FROM cart_items;
DELETE FROM order_delivery_addresses;
DELETE FROM orders;
DELETE FROM carts;
DELETE FROM product_images;
DELETE FROM product_sizes;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM banners;
DELETE FROM images;
DELETE FROM social_media;
DELETE FROM business_hours;
DELETE FROM system_settings;
DELETE FROM refresh_tokens;
DELETE FROM blacklisted_tokens;
DELETE FROM user_profiles;
DELETE FROM users;
DELETE FROM reference_counters;
DELETE FROM order_counters;

-- Reset sequences/auto-increment
ALTER SEQUENCE reference_counters_id_seq RESTART WITH 1;

-- ============================================================================
-- 1. SYSTEM SETTINGS (Must be first - referenced by other tables)
-- ============================================================================
INSERT INTO system_settings (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, tax_percentage, system_name, logo_system_url, primary_color, contact_address, contact_phone, contact_email)
VALUES
('550e8400-e29b-41d4-a716-446655990001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 10.0, 'Tiffany E-Menu Platform', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', '#57823D', 'Phnom Penh, Cambodia', '+855 23 888 9999', 'contact@tiffany.com');

-- ============================================================================
-- 2. USERS (60,003 total)
-- ============================================================================

-- Insert main admin user (phatmenghor19@gmail.com)
INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, password, user_type, account_status, user_role)
VALUES
('550e8400-e29b-41d4-a716-446655550001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'phatmenghor19@gmail.com', '$2a$12$C3nxQcF8f1rHHOJnyE0ZFOHOYXTn4/pCvUNBkhNPrS40WrnQ9gZ36', 'OWNER', 'ACTIVE', 'ADMIN');

-- Insert owner user with ADMIN role (phatmenghor20@gmail.com)
INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, password, user_type, account_status, user_role)
VALUES
('550e8400-e29b-41d4-a716-446655550003', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'phatmenghor20@gmail.com', '$2a$12$C3nxQcF8f1rHHOJnyE0ZFOHOYXTn4/pCvUNBkhNPrS40WrnQ9gZ36', 'OWNER', 'ACTIVE', 'ADMIN');

-- Insert 19,998 additional ADMIN users (OWNER type with ADMIN role)
INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, password, user_type, account_status, user_role)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'admin' || i || '@tiffany.com',
    '$2a$12$C3nxQcF8f1rHHOJnyE0ZFOHOYXTn4/pCvUNBkhNPrS40WrnQ9gZ36',
    'OWNER', 'ACTIVE', 'ADMIN'
FROM generate_series(1, 19998) AS t(i);

-- Insert 20,000 STAFF users (OWNER type with STAFF role)
INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, password, user_type, account_status, user_role)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'staff' || i || '@tiffany.com',
    '$2a$12$C3nxQcF8f1rHHOJnyE0ZFOHOYXTn4/pCvUNBkhNPrS40WrnQ9gZ36',
    'OWNER', 'ACTIVE', 'STAFF'
FROM generate_series(1, 20000) AS t(i);

-- Insert 20,001 CUSTOMER users (CUSTOMER type with CUSTOMER role)
INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, password, user_type, account_status, user_role)
VALUES
('550e8400-e29b-41d4-a716-446655550002', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'phatmenghor21@gmail.com', '$2a$12$C3nxQcF8f1rHHOJnyE0ZFOHOYXTn4/pCvUNBkhNPrS40WrnQ9gZ36', 'CUSTOMER', 'ACTIVE', 'CUSTOMER');

INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, password, user_type, account_status, user_role)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'customer' || i || '@test.com',
    '$2a$12$C3nxQcF8f1rHHOJnyE0ZFOHOYXTn4/pCvUNBkhNPrS40WrnQ9gZ36',
    'CUSTOMER', 'ACTIVE', 'CUSTOMER'
FROM generate_series(1, 20000) AS t(i);

-- ============================================================================
-- 3. CATEGORIES (200 categories)
-- ============================================================================
INSERT INTO categories (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, name, image_url, status)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'Category ' || i,
    'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
    'ACTIVE'
FROM generate_series(1, 200) AS t(i);

-- ============================================================================
-- 5. PRODUCTS (100,000 with detailed descriptions)
-- ============================================================================
INSERT INTO products (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, name, description, sku, barcode, price, main_image_url, category_id, status, view_count, favorite_count, promotion_type, promotion_value, promotion_from_date, promotion_to_date)
WITH category_list AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) as cat_num FROM categories
),
descriptions AS (
    SELECT 1 as desc_id, 'A high-quality wireless Bluetooth mouse designed with an ergonomic shape for maximum comfort, offering smooth and precise tracking, long-lasting battery life, and seamless compatibility with multiple devices, making it ideal for office work, travel, and everyday use.
This premium wireless mouse delivers reliable performance with fast Bluetooth connectivity, a comfortable grip for extended use, energy-efficient battery consumption, and wide compatibility across laptops, tablets, and desktops, ensuring a smooth and productive user experience anywhere.
Designed for both style and functionality, this wireless mouse features a sleek modern look, responsive controls, stable connection, and durable build quality, making it perfect for professionals, students, and anyone who needs precision and convenience in daily computing tasks.
Experience effortless navigation with this advanced wireless mouse that combines ergonomic comfort, high-precision tracking, long battery life, and universal compatibility, providing a reliable and efficient solution for work, study, and entertainment needs.
This versatile Bluetooth mouse is built to enhance productivity with its lightweight design, smooth cursor control, strong wireless connection, and extended battery performance, making it an excellent choice for users who demand both performance and portability in one device.' as description_text
    UNION ALL
    SELECT 2 as desc_id, 'Premium quality product engineered for excellence, combining innovative technology with elegant design. Features advanced ergonomic construction, superior durability, and seamless integration with modern systems.
This exceptional product delivers outstanding performance across various environments, providing reliable functionality and consistent quality. Built with premium materials and precision engineering, it ensures longevity and user satisfaction.
Experience superior comfort and functionality with this thoughtfully designed product. Perfect for professionals and everyday users alike, offering reliable performance that exceeds expectations.
Engineered for maximum efficiency and user convenience, this product combines cutting-edge technology with practical design. Delivers exceptional value with outstanding build quality and performance.
Invest in this premium product for reliable, long-lasting performance. Combines modern innovation with user-friendly design, making it the ideal choice for discerning customers.' as description_text
    UNION ALL
    SELECT 3 as desc_id, 'Discover excellence with this high-performance product designed for modern users. Features innovative technology, superior materials, and exceptional craftsmanship throughout.
Built to deliver outstanding results in any situation, this product combines reliability with advanced functionality. Perfect for users seeking quality and performance in equal measure.
Experience the difference that premium design and engineering make. This product offers exceptional value, combining cutting-edge features with intuitive usability.
Crafted with precision and attention to detail, this product represents the pinnacle of quality manufacturing. Ideal for users who demand the best in performance and reliability.
Transform your daily experience with this innovative product. Combines smart design with powerful functionality, providing reliable performance for all your needs.' as description_text
)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'Product ' || i,
    (SELECT description_text FROM descriptions WHERE desc_id = ((i - 1) % 3) + 1),
    'SKU-' || LPAD(i::text, 7, '0'),
    'BARCODE-' || LPAD(i::text, 10, '0'),
    (10 + random() * 500)::numeric(10,2),
    'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
    (SELECT id FROM category_list WHERE cat_num = ((i - 1) % 200) + 1),
    'ACTIVE',
    (random() * 10000)::int,  -- Random view count 0-10000
    (random() * 1000)::int,   -- Random favorite count 0-1000
    CASE
        WHEN random() < 0.4 THEN 'PERCENTAGE'       -- 40% PERCENTAGE
        WHEN random() < 0.8 THEN 'FIXED_AMOUNT'     -- 40% FIXED_AMOUNT
        ELSE NULL                                    -- 20% no promotion
    END,
    CASE
        WHEN random() < 0.4 THEN (5 + random() * 45)::numeric(10,2)    -- PERCENTAGE: 5-50%
        WHEN random() < 0.8 THEN (1 + random() * 100)::numeric(10,2)   -- FIXED_AMOUNT: 1-100 discount
        ELSE NULL
    END,
    NOW(),
    NOW() + INTERVAL '30 days'
FROM generate_series(1, 100000) AS t(i);

-- ============================================================================
-- 6. PRODUCT SIZES (70% of products = 70,000 with 5-10 sizes each)
-- ============================================================================
INSERT INTO product_sizes (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, product_id, name, price, sku, barcode, promotion_type, promotion_value, promotion_from_date, promotion_to_date)
WITH product_with_sizes AS (
    SELECT * FROM products ORDER BY RANDOM() LIMIT (100000 * 0.7)::int
),
size_names AS (
    SELECT 1 as size_id, 'Extra Small' as name UNION ALL
    SELECT 2, 'Small' UNION ALL
    SELECT 3, 'Medium' UNION ALL
    SELECT 4, 'Large' UNION ALL
    SELECT 5, 'Extra Large' UNION ALL
    SELECT 6, 'XXL' UNION ALL
    SELECT 7, 'XXXL' UNION ALL
    SELECT 8, 'Standard' UNION ALL
    SELECT 9, 'Premium' UNION ALL
    SELECT 10, 'Deluxe'
)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    p.id,
    sn.name,
    (p.price * (0.8 + random() * 0.4))::numeric(10,2),
    p.sku || '-' || LPAD(sn.size_id::text, 2, '0'),
    p.barcode || '-' || LPAD(sn.size_id::text, 2, '0'),
    CASE
        WHEN random() < 0.4 THEN 'PERCENTAGE'       -- 40% PERCENTAGE
        WHEN random() < 0.8 THEN 'FIXED_AMOUNT'     -- 40% FIXED_AMOUNT
        ELSE NULL                                    -- 20% no promotion
    END,
    CASE
        WHEN random() < 0.4 THEN (5 + random() * 45)::numeric(10,2)    -- PERCENTAGE: 5-50%
        WHEN random() < 0.8 THEN (1 + random() * 50)::numeric(10,2)    -- FIXED_AMOUNT: 1-50 discount
        ELSE NULL
    END,
    NOW(),
    NOW() + INTERVAL '30 days'
FROM product_with_sizes p
CROSS JOIN size_names sn
WHERE sn.size_id <= (5 + ((ABS(hashtext(p.id::text))::numeric % 6))::int);  -- 5-10 sizes per product

-- ============================================================================
-- 7. PRODUCT IMAGES (1-5 per product)
-- ============================================================================
INSERT INTO product_images (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, product_id, image_url)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    p.id,
    'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce'
FROM products p
CROSS JOIN generate_series(1, (1 + (random() * 4)::int)) AS img_num;

-- ============================================================================
-- 8. BANNERS (20 banners)
-- ============================================================================
INSERT INTO banners (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, description, image_url, link_url, status)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'Promotional banner ' || i,
    'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
    '/promo/' || i,
    'ACTIVE'
FROM generate_series(1, 20) AS t(i);

-- ============================================================================
-- 9. CARTS (All 20,001 customers)
-- ============================================================================
INSERT INTO carts (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    u.id
FROM users u
WHERE u.user_type = 'CUSTOMER'
AND NOT EXISTS (SELECT 1 FROM carts c WHERE c.user_id = u.id);

-- ============================================================================
-- 10. ORDERS (20,000 orders for phatmenghor21@gmail.com)
-- ============================================================================
INSERT INTO orders (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_number, customer_id, order_status, source, order_from, payment_method, payment_status, subtotal, tax_amount, discount_amount, delivery_fee, total_amount, customer_name, customer_phone, customer_email, customer_note)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(i::text, 6, '0'),
    '550e8400-e29b-41d4-a716-446655550002',
    CASE ((i - 1) % 4) WHEN 0 THEN 'PENDING' WHEN 1 THEN 'CONFIRMED' WHEN 2 THEN 'COMPLETED' ELSE 'CANCELLED' END,
    'PUBLIC',
    'CUSTOMER',
    CASE ((i - 1) % 3) WHEN 0 THEN 'CREDIT_CARD' WHEN 1 THEN 'DEBIT_CARD' ELSE 'CASH' END,
    CASE ((i - 1) % 3) WHEN 0 THEN 'COMPLETED' WHEN 1 THEN 'PENDING' ELSE 'FAILED' END,
    (50 + random() * 500)::numeric(10,2),
    ((50 + random() * 500) * 0.1)::numeric(10,2),
    (random() * 50)::numeric(10,2),
    5.00,
    ((50 + random() * 500) * 1.1 + 5)::numeric(10,2),
    'Customer ' || i,
    '+855 98 123 456' || i,
    'customer' || i || '@test.com',
    'Please deliver quickly'
FROM generate_series(1, 20000) AS t(i);

-- ============================================================================
-- 11. ORDER ITEMS (Multiple items per order)
-- ============================================================================
INSERT INTO order_items (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_id, product_id, quantity, unit_price, total_price, product_size_id)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    o.id,
    (SELECT id FROM products ORDER BY RANDOM() LIMIT 1),
    (1 + (random() * 5)::int),
    (10 + random() * 500)::numeric(10,2),
    ((1 + (random() * 5)::int) * (10 + random() * 500))::numeric(10,2),
    (SELECT id FROM product_sizes ORDER BY RANDOM() LIMIT 1)
FROM orders o
CROSS JOIN generate_series(1, (1 + (random() * 3)::int)) AS item_num;

-- ============================================================================
-- 12. ORDER DELIVERY ADDRESSES
-- ============================================================================
INSERT INTO order_delivery_addresses (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_id, street, ward, district, province, country, postal_code, latitude, longitude, address_type, is_default)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    o.id,
    'Street ' || (random() * 1000)::int,
    'Ward ' || (random() * 100)::int,
    'District ' || (random() * 50)::int,
    'Province',
    'Cambodia',
    '12345',
    11.5564 + (random() - 0.5) * 0.1,
    104.9282 + (random() - 0.5) * 0.1,
    'DELIVERY',
    true
FROM orders o;

-- ============================================================================
-- 13. ORDER STATUS HISTORY
-- ============================================================================
INSERT INTO order_status_history (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_id, old_status, new_status, changed_at, changed_by, reason)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    o.id,
    'PENDING',
    o.order_status,
    NOW() + INTERVAL '1 hour',
    'system',
    'Status updated'
FROM orders o;

-- ============================================================================
-- Final Statistics
-- ============================================================================
SELECT 'Data generation completed!' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as total_sizes FROM product_sizes;
SELECT COUNT(*) as total_orders FROM orders;
SELECT COUNT(*) as total_order_items FROM order_items;
