-- ============================================================================
-- TIFFANY E-MENU PLATFORM - LARGE SCALE TEST DATA
-- ============================================================================
-- Users: 60,001 total
--   - 20,000 ADMIN users (UserType: OWNER, UserRole: ADMIN)
--   - 20,000 STAFF users (UserType: OWNER, UserRole: STAFF)
--   - 20,001 CUSTOMER users (UserType: CUSTOMER, UserRole: CUSTOMER)
-- Products: 100,000 with 70% having sizes (70,000 sizes)
-- Product Images: 1-5 per product
-- Categories: 200
-- Banners: 20
-- Carts: All 20,001 customers
-- Orders: 20,000 for phatmenghor21@gmail.com
-- ============================================================================

-- ============================================================================
-- 1. USERS (60,001 total)
-- ============================================================================

-- Insert 20,000 ADMIN users (OWNER type with ADMIN role)
INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, password, user_type, status, account_status, user_role)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'admin' || i || '@tiffany.com',
    '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK',
    'OWNER', 'ACTIVE', 'ACTIVE', 'ADMIN'
FROM generate_series(1, 20000) AS t(i);

-- Insert 20,000 STAFF users (OWNER type with STAFF role)
INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, password, user_type, status, account_status, user_role)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'staff' || i || '@tiffany.com',
    '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK',
    'OWNER', 'ACTIVE', 'ACTIVE', 'STAFF'
FROM generate_series(1, 20000) AS t(i);

-- Insert 20,001 CUSTOMER users (CUSTOMER type with CUSTOMER role)
INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, password, user_type, status, account_status, user_role)
VALUES
('550e8400-e29b-41d4-a716-446655550002', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'phatmenghor21@gmail.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'CUSTOMER', 'ACTIVE', 'ACTIVE', 'CUSTOMER');

INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, password, user_type, status, account_status, user_role)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'customer' || i || '@test.com',
    '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK',
    'CUSTOMER', 'ACTIVE', 'ACTIVE', 'CUSTOMER'
FROM generate_series(1, 20000) AS t(i);

-- ============================================================================
-- 2. USER PROFILES (Complete for all users)
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
    'https://via.placeholder.com/300?text=' || SUBSTR(u.user_identifier, 1, 10)
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM user_profiles up WHERE up.user_id = u.id);

-- ============================================================================
-- 3. CATEGORIES (200 categories)
-- ============================================================================
INSERT INTO categories (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, name, image_url, status)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'Category ' || i,
    'https://via.placeholder.com/300?text=Cat' || i,
    'ACTIVE'
FROM generate_series(1, 200) AS t(i);

-- ============================================================================
-- 4. PRODUCTS (100,000 products)
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
-- 5. PRODUCT SIZES (70% of products = 70,000 sizes)
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
-- 6. PRODUCT IMAGES (1-5 per product)
-- ============================================================================
INSERT INTO product_images (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, product_id, image_url)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    p.id,
    'https://via.placeholder.com/400?text=Product' || SUBSTR(p.id::text, 1, 8) || 'Img' || img_num
FROM products p
CROSS JOIN generate_series(1, (1 + (random() * 4)::int)) AS img_num;

-- ============================================================================
-- 7. BANNERS (20 banners)
-- ============================================================================
INSERT INTO banners (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, description, image_url, link_url, status)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'Promotional banner ' || i,
    'https://via.placeholder.com/1200x400?text=Banner' || i,
    '/promo/' || i,
    'ACTIVE'
FROM generate_series(1, 20) AS t(i);

-- ============================================================================
-- 8. CARTS (All 20,001 customers)
-- ============================================================================
INSERT INTO carts (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    u.id
FROM users u
WHERE u.user_type = 'CUSTOMER'
AND NOT EXISTS (SELECT 1 FROM carts c WHERE c.user_id = u.id);

-- ============================================================================
-- 9. ORDERS (20,000 orders for phatmenghor21@gmail.com)
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
-- 10. REFERENCE COUNTERS
-- ============================================================================
INSERT INTO reference_counters (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, reference_type, current_value)
VALUES
('550e8400-e29b-41d4-a716-446655880001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'ORDER', 20000),
('550e8400-e29b-41d4-a716-446655880002', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'INVOICE', 20000);

-- ============================================================================
-- 11. SYSTEM SETTINGS (Full configuration)
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
