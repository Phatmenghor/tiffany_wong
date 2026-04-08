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
-- Products: 100,000 with 70% having sizes (70,000 sizes)
-- Product Images: 1-5 per product
-- Categories: 200
-- Banners: 20
-- Carts: All 20,001 customers
-- Orders: 20,000 for phatmenghor21@gmail.com
-- ============================================================================

-- ============================================================================
-- 0. DROP ALL TABLES (Foreign Key Order)
-- ============================================================================
DROP TABLE IF EXISTS product_favorites;
DROP TABLE IF EXISTS order_status_history;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS order_delivery_addresses;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS product_sizes;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS banners;
DROP TABLE IF EXISTS social_media;
DROP TABLE IF EXISTS business_hours;
DROP TABLE IF EXISTS system_settings;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS blacklisted_tokens;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS reference_counters;
DROP TABLE IF EXISTS order_counters;

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
-- 3. USER PROFILES (Complete for all users)
-- ============================================================================
INSERT INTO user_profiles (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id, first_name, last_name, nickname, gender, date_of_birth, phone_number, email, profile_image_url)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    u.id,
    CASE 
        WHEN u.user_role = 'ADMIN' THEN 'Admin'
        WHEN u.user_role = 'STAFF' THEN 'Staff'
        ELSE 'Customer'
    END || ' ' || (row_number() OVER (PARTITION BY u.user_role ORDER BY u.id)),
    CASE 
        WHEN u.user_role = 'ADMIN' THEN 'Administrator'
        WHEN u.user_role = 'STAFF' THEN 'Manager'
        ELSE 'User'
    END,
    CASE 
        WHEN u.user_role = 'ADMIN' THEN 'Admin' || (row_number() OVER (PARTITION BY u.user_role ORDER BY u.id))
        WHEN u.user_role = 'STAFF' THEN 'Staff' || (row_number() OVER (PARTITION BY u.user_role ORDER BY u.id))
        ELSE 'Cust' || (row_number() OVER (PARTITION BY u.user_role ORDER BY u.id))
    END,
    CASE WHEN (random() * 100)::int > 50 THEN 'MALE' ELSE 'FEMALE' END,
    NOW()::date - (random() * 15000)::int,
    '+855 ' || LPAD((random() * 999999)::int::text, 9, '0'),
    u.user_identifier,
    'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce'
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM user_profiles up WHERE up.user_id = u.id);

-- ============================================================================
-- 4. CATEGORIES (200 categories)
-- ============================================================================
INSERT INTO categories (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, name, image_url, status)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'Category ' || i,
    'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
    'ACTIVE'
FROM generate_series(1, 200) AS t(i);

-- ============================================================================
-- 5. PRODUCTS (100,000 products)
-- ============================================================================
INSERT INTO products (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, name, description, sku, barcode, price, category_id, status, view_count, favorite_count)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'Product ' || i,
    'High-quality product ' || i || ' with detailed description',
    'SKU-' || LPAD(i::text, 7, '0'),
    'BARCODE-' || LPAD(i::text, 10, '0'),
    (10 + random() * 500)::numeric(10,2),
    (SELECT id FROM categories ORDER BY RANDOM() LIMIT 1),
    'ACTIVE',
    0,
    0
FROM generate_series(1, 100000) AS t(i);

-- ============================================================================
-- 6. PRODUCT SIZES (70% of products = 70,000 sizes)
-- ============================================================================
INSERT INTO product_sizes (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, product_id, name, price, sku, barcode)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    p.id,
    CASE ((random() * 3)::int) WHEN 0 THEN 'Small' WHEN 1 THEN 'Medium' WHEN 2 THEN 'Large' ELSE 'Extra Large' END,
    (p.price * (0.9 + random() * 0.2))::numeric(10,2),
    p.sku || '-' || CASE ((random() * 3)::int) WHEN 0 THEN 'S' WHEN 1 THEN 'M' WHEN 2 THEN 'L' ELSE 'XL' END,
    p.barcode || '-' || CASE ((random() * 3)::int) WHEN 0 THEN 'S' WHEN 1 THEN 'M' WHEN 2 THEN 'L' ELSE 'XL' END
FROM (
    SELECT * FROM products ORDER BY RANDOM() LIMIT (100000 * 0.7)::int
) p;

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
    CASE ((random() * 3)::int) WHEN 0 THEN 'PENDING' WHEN 1 THEN 'CONFIRMED' WHEN 2 THEN 'COMPLETED' ELSE 'CANCELLED' END,
    'PUBLIC',
    'CUSTOMER',
    CASE ((random() * 1)::int) WHEN 0 THEN 'CASH' ELSE 'BANK' END,
    'UNPAID',
    (40 + random() * 450)::numeric(10,2),
    (5 + random() * 20)::numeric(10,2),
    (0 + random() * 50)::numeric(10,2),
    5.00,
    (40 + random() * 450)::numeric(10,2) + 5.00 + (5 + random() * 20)::numeric(10,2) - (0 + random() * 50)::numeric(10,2),
    'Customer Phatmenghor',
    '+855 10 100 0001',
    'phatmenghor21@gmail.com',
    'Order history ' || i
FROM generate_series(1, 20000) AS t(i);

-- ============================================================================
-- 11. ORDER ITEMS (3-10 items per order = 60,000-200,000 items)
-- ============================================================================
INSERT INTO order_items (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_id, product_id, product_size_id, product_name, quantity, unit_price, final_price, total_price)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    o.id,
    p.id,
    CASE WHEN random() > 0.3 THEN ps.id ELSE NULL END,
    p.name,
    (1 + (random() * 5)::int) AS qty,
    p.price,
    (p.price * (0.9 + random() * 0.1))::numeric(10,2) AS final_price,
    ((p.price * (0.9 + random() * 0.1)) * (1 + (random() * 5)::int))::numeric(10,2) AS total_price
FROM orders o
CROSS JOIN (SELECT * FROM products ORDER BY RANDOM() LIMIT (3 + (random() * 8)::int)) p
LEFT JOIN product_sizes ps ON ps.product_id = p.id;

-- ============================================================================
-- 12. ORDER DELIVERY ADDRESSES (1 per order)
-- ============================================================================
INSERT INTO order_delivery_addresses (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_id, village, commune, district, province, street_number, house_number, latitude, longitude, note)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    o.id,
    CASE ((random() * 4)::int) WHEN 0 THEN 'Village 1' WHEN 1 THEN 'Village 2' WHEN 2 THEN 'Village 3' ELSE 'Village 4' END,
    CASE ((random() * 4)::int) WHEN 0 THEN 'Sangkat 1' WHEN 1 THEN 'Sangkat 2' WHEN 2 THEN 'Sangkat 3' ELSE 'Sangkat 4' END,
    CASE ((random() * 3)::int) WHEN 0 THEN 'Khan 1' WHEN 1 THEN 'Khan 2' ELSE 'Khan 3' END,
    'Phnom Penh',
    CASE ((random() * 2)::int) WHEN 0 THEN 'Street 123' WHEN 1 THEN 'Avenue 456' ELSE 'Road 789' END,
    LPAD((random() * 999)::int::text, 3, '0'),
    11.5564 + (random() - 0.5) * 0.1,
    104.9282 + (random() - 0.5) * 0.1,
    'Delivery instruction ' || row_number() OVER (ORDER BY o.id)
FROM orders o;

-- ============================================================================
-- 13. ORDER STATUS HISTORY (1-3 status changes per order)
-- ============================================================================
INSERT INTO order_status_history (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_id, order_status, changed_by_name, note)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    o.id,
    CASE ((random() * 3)::int) WHEN 0 THEN 'CONFIRMED' WHEN 1 THEN 'COMPLETED' ELSE 'CANCELLED' END,
    'System Admin',
    CASE ((random() * 3)::int) WHEN 0 THEN 'Order confirmed by admin' WHEN 1 THEN 'Order completed' ELSE 'Order cancelled' END
FROM orders o
WHERE ((random() * 100)::int > 20);

INSERT INTO order_status_history (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_id, order_status, changed_by_name, note)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    o.id,
    'COMPLETED',
    'System Admin',
    'Order completed and delivered'
FROM orders o
WHERE o.order_status = 'COMPLETED'
AND ((random() * 100)::int > 30);

-- ============================================================================
-- 14. BUSINESS HOURS (7 days)
-- ============================================================================
INSERT INTO business_hours (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, system_setting_id, day, opening_time, closing_time)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    ss.id,
    CASE day WHEN 0 THEN 'Monday' WHEN 1 THEN 'Tuesday' WHEN 2 THEN 'Wednesday' WHEN 3 THEN 'Thursday' WHEN 4 THEN 'Friday' WHEN 5 THEN 'Saturday' ELSE 'Sunday' END,
    '09:00:00',
    '22:00:00'
FROM (SELECT id FROM system_settings LIMIT 1) ss
CROSS JOIN generate_series(0, 6) AS t(day);

-- ============================================================================
-- 15. SOCIAL MEDIA
-- ============================================================================
INSERT INTO social_media (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, system_setting_id, name, link_url)
VALUES
    (gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, (SELECT id FROM system_settings LIMIT 1), 'Facebook', 'https://facebook.com/tiffany'),
    (gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, (SELECT id FROM system_settings LIMIT 1), 'Instagram', 'https://instagram.com/tiffany'),
    (gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, (SELECT id FROM system_settings LIMIT 1), 'Telegram', 'https://t.me/tiffany'),
    (gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, (SELECT id FROM system_settings LIMIT 1), 'TikTok', 'https://tiktok.com/@tiffany');

-- ============================================================================
-- 16. PRODUCT FAVORITES (For phatmenghor21@gmail.com user - 50 favorites)
-- ============================================================================
INSERT INTO product_favorites (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id, product_id)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    '550e8400-e29b-41d4-a716-446655550002',
    p.id
FROM (
    SELECT id FROM products ORDER BY RANDOM() LIMIT 50
) p
WHERE NOT EXISTS (
    SELECT 1 FROM product_favorites pf
    WHERE pf.user_id = '550e8400-e29b-41d4-a716-446655550002'
    AND pf.product_id = p.id
);

-- ============================================================================
-- 17. REFERENCE COUNTERS
-- ============================================================================
INSERT INTO reference_counters (entity_type, counter_date, counter_value)
VALUES
('ORDER', NOW()::date, 20000),
('INVOICE', NOW()::date, 20000);

-- ============================================================================
-- SUMMARY OF INSERTED DATA (System Settings inserted at beginning - step 1)
-- ============================================================================
-- Users: 60,003
--   - phatmenghor19@gmail.com (OWNER/ADMIN)
--   - phatmenghor20@gmail.com (OWNER/ADMIN)
-- User Profiles: 60,003
-- Categories: 200
-- Products: 100,000
-- Product Sizes: ~70,000
-- Product Images: ~280,000-350,000
-- Banners: 20
-- Carts: 20,001
-- Orders: 20,000
-- Order Items: ~60,000-200,000
-- Order Delivery Addresses: 20,000
-- Order Status History: ~30,000-40,000
-- Product Favorites: 50 (for phatmenghor21@gmail.com)
-- Business Hours: 7
-- Social Media: 4
-- Reference Counters: 2
-- System Settings: 1
-- TOTAL RECORDS: ~610,000-770,070
-- ============================================================================
-- END OF LARGE SCALE TEST DATA
-- ============================================================================

-- Count all records in every table
SELECT 'banners' as table_name, COUNT(*) as record_count FROM banners
UNION ALL SELECT 'blacklisted_tokens', COUNT(*) FROM blacklisted_tokens
UNION ALL SELECT 'business_hours', COUNT(*) FROM business_hours
UNION ALL SELECT 'cart_items', COUNT(*) FROM cart_items
UNION ALL SELECT 'carts', COUNT(*) FROM carts
UNION ALL SELECT 'categories', COUNT(*) FROM categories
UNION ALL SELECT 'images', COUNT(*) FROM images
UNION ALL SELECT 'order_counters', COUNT(*) FROM order_counters
UNION ALL SELECT 'order_delivery_addresses', COUNT(*) FROM order_delivery_addresses
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL SELECT 'order_status_history', COUNT(*) FROM order_status_history
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'product_favorites', COUNT(*) FROM product_favorites
UNION ALL SELECT 'product_images', COUNT(*) FROM product_images
UNION ALL SELECT 'product_sizes', COUNT(*) FROM product_sizes
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'reference_counters', COUNT(*) FROM reference_counters
UNION ALL SELECT 'refresh_tokens', COUNT(*) FROM refresh_tokens
UNION ALL SELECT 'social_media', COUNT(*) FROM social_media
UNION ALL SELECT 'system_settings', COUNT(*) FROM system_settings
UNION ALL SELECT 'user_profiles', COUNT(*) FROM user_profiles
UNION ALL SELECT 'users', COUNT(*) FROM users
ORDER BY table_name;
