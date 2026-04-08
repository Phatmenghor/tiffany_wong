-- ============================================================================
-- TIFFANY E-MENU PLATFORM - LARGE SCALE TEST DATA
-- ============================================================================
-- Users: 1000 (1 ADMIN + 1 STAFF + 20,000 CUSTOMER) = 20,002 users
-- Products: 100,000 with 70% having sizes (70,000 sizes)
-- Product Images: 1-5 per product
-- Categories: 200
-- Banners: 20
-- Carts: All 20,000 customers
-- Orders: 20,000 for phatmenghor21@gmail.com
-- ============================================================================

-- Clear existing data
TRUNCATE TABLE user_roles CASCADE;
TRUNCATE TABLE roles CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE user_profiles CASCADE;
TRUNCATE TABLE refresh_tokens CASCADE;
TRUNCATE TABLE blacklisted_tokens CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE order_items CASCADE;
TRUNCATE TABLE order_delivery_addresses CASCADE;
TRUNCATE TABLE order_status_history CASCADE;
TRUNCATE TABLE order_counters CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE product_sizes CASCADE;
TRUNCATE TABLE product_images CASCADE;
TRUNCATE TABLE product_favorites CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE carts CASCADE;
TRUNCATE TABLE cart_items CASCADE;
TRUNCATE TABLE banners CASCADE;
TRUNCATE TABLE images CASCADE;
TRUNCATE TABLE business_hours CASCADE;
TRUNCATE TABLE reference_counters CASCADE;
TRUNCATE TABLE social_media CASCADE;
TRUNCATE TABLE system_settings CASCADE;

-- ============================================================================
-- 1. ROLES
-- ============================================================================
INSERT INTO roles (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, name, description)
VALUES
('550e8400-e29b-41d4-a716-446655440000', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'ADMIN', 'Full system access - platform administrator'),
('550e8400-e29b-41d4-a716-446655440001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'STAFF', 'Staff member access - can manage orders and products'),
('550e8400-e29b-41d4-a716-446655440003', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'CUSTOMER', 'Customer access - can browse and purchase products');

-- ============================================================================
-- 2. USERS (1000 total: 1 ADMIN + 1 STAFF + 20,000 CUSTOMER)
-- ============================================================================
INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, password, user_type, status, account_status)
VALUES
('550e8400-e29b-41d4-a716-446655550000', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'phatmenghor19@gmail.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'PLATFORM_USER', 'ACTIVE', 'ACTIVE'),
('550e8400-e29b-41d4-a716-446655550001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'phatmenghor20@gmail.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'BUSINESS_USER', 'ACTIVE', 'ACTIVE'),
('550e8400-e29b-41d4-a716-446655550002', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'phatmenghor21@gmail.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'CUSTOMER', 'ACTIVE', 'ACTIVE');

-- Insert 20,000 CUSTOMER users
INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, password, user_type, status, account_status)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'customer' || i || '@test.com',
    '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK',
    'CUSTOMER', 'ACTIVE', 'ACTIVE'
FROM generate_series(1, 20000) AS t(i);

-- ============================================================================
-- 3. USER ROLES
-- ============================================================================
INSERT INTO user_roles (user_id, role_id)
SELECT id, '550e8400-e29b-41d4-a716-446655440000' FROM users WHERE user_type = 'PLATFORM_USER'
UNION ALL
SELECT id, '550e8400-e29b-41d4-a716-446655440001' FROM users WHERE user_type = 'BUSINESS_USER'
UNION ALL
SELECT id, '550e8400-e29b-41d4-a716-446655440003' FROM users WHERE user_type = 'CUSTOMER';

-- ============================================================================
-- 4. USER PROFILES (Complete for all users)
-- ============================================================================
INSERT INTO user_profiles (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id, first_name, last_name, nickname, gender, date_of_birth, phone_number, email, profile_image_url, address)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    u.id,
    CASE 
        WHEN u.user_type = 'PLATFORM_USER' THEN 'Platform'
        WHEN u.user_type = 'BUSINESS_USER' THEN 'Business'
        ELSE 'Customer' || (row_number() OVER (ORDER BY u.id))
    END,
    CASE 
        WHEN u.user_type = 'PLATFORM_USER' THEN 'Admin'
        WHEN u.user_type = 'BUSINESS_USER' THEN 'Manager'
        ELSE 'User'
    END,
    CASE 
        WHEN u.user_type = 'PLATFORM_USER' THEN 'Admin'
        WHEN u.user_type = 'BUSINESS_USER' THEN 'BizMgr'
        ELSE 'Cust' || (row_number() OVER (ORDER BY u.id))
    END,
    CASE WHEN (random() * 100)::int > 50 THEN 'MALE' ELSE 'FEMALE' END,
    NOW()::date - (random() * 15000)::int,
    '+855 ' || LPAD((random() * 999999)::int::text, 9, '0'),
    u.user_identifier,
    'https://via.placeholder.com/300?text=' || SUBSTR(u.user_identifier, 1, 10),
    'Phnom Penh, Cambodia'
FROM users u;

-- ============================================================================
-- 5. CATEGORIES (200 categories)
-- ============================================================================
INSERT INTO categories (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, name, description, icon_url, is_featured)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'Category ' || i,
    'Description for category ' || i,
    'https://via.placeholder.com/100?text=Cat' || i,
    (i <= 10)
FROM generate_series(1, 200) AS t(i);

-- ============================================================================
-- 6. PRODUCTS (100,000 products)
-- ============================================================================
INSERT INTO products (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, name, description, sku, barcode, price, cost, category_id, is_available, stock_quantity)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'Product ' || i,
    'High-quality product ' || i || ' with detailed description',
    'SKU-' || LPAD(i::text, 7, '0'),
    'BARCODE-' || LPAD(i::text, 10, '0'),
    (10 + random() * 500)::numeric(10,2),
    (5 + random() * 250)::numeric(10,2),
    (SELECT id FROM categories ORDER BY RANDOM() LIMIT 1),
    true,
    (5 + random() * 1000)::int
FROM generate_series(1, 100000) AS t(i);

-- ============================================================================
-- 7. PRODUCT SIZES (70% of products = 70,000 sizes)
-- ============================================================================
INSERT INTO product_sizes (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, product_id, size_name, sku, barcode)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    p.id,
    ARRAY['Small', 'Medium', 'Large', 'Extra Large'][((random() * 3)::int + 1)],
    p.sku || '-' || ARRAY['S', 'M', 'L', 'XL'][(random() * 3)::int + 1],
    p.barcode || '-' || ARRAY['S', 'M', 'L', 'XL'][(random() * 3)::int + 1]
FROM (
    SELECT * FROM products ORDER BY RANDOM() LIMIT (100000 * 0.7)::int
) p;

-- ============================================================================
-- 8. PRODUCT IMAGES (1-5 per product)
-- ============================================================================
INSERT INTO product_images (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, product_id, image_url, alt_text, display_order)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    p.id,
    'https://via.placeholder.com/400?text=Product' || p.id || 'Img' || img_num,
    'Product ' || p.id || ' image ' || img_num,
    img_num
FROM products p
CROSS JOIN generate_series(1, (1 + random() * 4)::int) AS img_num;

-- ============================================================================
-- 9. BANNERS (20 banners)
-- ============================================================================
INSERT INTO banners (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, title, description, image_url, link_url, is_active, display_order)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'Banner ' || i,
    'Promotional banner ' || i,
    'https://via.placeholder.com/1200x400?text=Banner' || i,
    '/promo/' || i,
    true,
    i
FROM generate_series(1, 20) AS t(i);

-- ============================================================================
-- 10. CARTS (All 20,000 customers)
-- ============================================================================
INSERT INTO carts (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id, total_items, total_price)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    u.id,
    0,
    0.00
FROM users u
WHERE u.user_type = 'CUSTOMER';

-- ============================================================================
-- 11. ORDERS (20,000 orders for phatmenghor21@gmail.com)
-- ============================================================================
INSERT INTO orders (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id, order_status, total_price, subtotal, tax_amount, discount_amount, delivery_fee, notes, customer_name, customer_phone, customer_email)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    '550e8400-e29b-41d4-a716-446655550002',
    ARRAY['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'][(random() * 3)::int + 1],
    (50 + random() * 500)::numeric(10,2),
    (40 + random() * 450)::numeric(10,2),
    (5 + random() * 20)::numeric(10,2),
    (0 + random() * 50)::numeric(10,2),
    5.00,
    'Order history ' || i,
    'Customer Phatmenghor',
    '+855 10 100 0001',
    'phatmenghor21@gmail.com'
FROM generate_series(1, 20000) AS t(i);

-- ============================================================================
-- 12. REFERENCE COUNTERS
-- ============================================================================
INSERT INTO reference_counters (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, reference_type, current_value)
VALUES
('550e8400-e29b-41d4-a716-446655880001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'ORDER', 20000),
('550e8400-e29b-41d4-a716-446655880002', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'INVOICE', 20000);

-- ============================================================================
-- 13. SYSTEM SETTINGS (Full configuration)
-- ============================================================================
INSERT INTO system_settings (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, setting_key, setting_value)
VALUES
('550e8400-e29b-41d4-a716-446655990001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'PLATFORM_NAME', 'Tiffany E-Menu Platform'),
('550e8400-e29b-41d4-a716-446655990002', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'PLATFORM_VERSION', '1.0.0'),
('550e8400-e29b-41d4-a716-446655990003', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'TAX_RATE', '10'),
('550e8400-e29b-41d4-a716-446655990004', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'CURRENCY', 'KHR'),
('550e8400-e29b-41d4-a716-446655990005', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'DELIVERY_FEE', '5.00'),
('550e8400-e29b-41d4-a716-446655990006', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'MIN_ORDER_AMOUNT', '10.00'),
('550e8400-e29b-41d4-a716-446655990007', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'MAX_ORDER_AMOUNT', '10000.00'),
('550e8400-e29b-41d4-a716-446655990008', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'BUSINESS_NAME', 'Tiffany Restaurant'),
('550e8400-e29b-41d4-a716-446655990009', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'BUSINESS_ADDRESS', 'Phnom Penh, Cambodia'),
('550e8400-e29b-41d4-a716-446655990010', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'BUSINESS_PHONE', '+855 23 888 9999'),
('550e8400-e29b-41d4-a716-446655990011', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'BUSINESS_EMAIL', 'contact@tiffany.com'),
('550e8400-e29b-41d4-a716-446655990012', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'OPENING_HOURS', '09:00-22:00'),
('550e8400-e29b-41d4-a716-446655990013', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'CLOSING_HOURS', '22:00'),
('550e8400-e29b-41d4-a716-446655990014', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'ENABLE_DELIVERY', 'true'),
('550e8400-e29b-41d4-a716-446655990015', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'ENABLE_PICKUP', 'true'),
('550e8400-e29b-41d4-a716-446655990016', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'MAX_DELIVERY_DISTANCE', '20'),
('550e8400-e29b-41d4-a716-446655990017', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'DEFAULT_LANGUAGE', 'en'),
('550e8400-e29b-41d4-a716-446655990018', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'TIMEZONE', 'Asia/Phnom_Penh'),
('550e8400-e29b-41d4-a716-446655990019', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'ENABLE_LOYALTY_PROGRAM', 'true'),
('550e8400-e29b-41d4-a716-446655990020', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'LOYALTY_POINTS_MULTIPLIER', '1.0');

-- ============================================================================
-- END OF LARGE SCALE TEST DATA
-- ============================================================================
