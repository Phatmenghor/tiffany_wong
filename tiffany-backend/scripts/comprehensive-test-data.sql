-- ============================================================================
-- TIFFANY E-MENU PLATFORM - CLEAN TEST DATA
-- ============================================================================
-- Includes only tables that exist in the current project
-- All fields populated with NO NULL values
-- Password Hash: $2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK (password123)
-- ============================================================================

-- Clear existing data (if needed)
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
-- 2. USERS (3 main users + 10 test customers)
-- ============================================================================
INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, password, user_type, status, account_status)
VALUES
('550e8400-e29b-41d4-a716-446655550000', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'phatmenghor19@gmail.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'PLATFORM_USER', 'ACTIVE', 'ACTIVE'),
('550e8400-e29b-41d4-a716-446655550001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'phatmenghor20@gmail.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'BUSINESS_USER', 'ACTIVE', 'ACTIVE'),
('550e8400-e29b-41d4-a716-446655550002', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'phatmenghor21@gmail.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'CUSTOMER', 'ACTIVE', 'ACTIVE'),
('550e8400-e29b-41d4-a716-446655550003', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'customer1@test.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'CUSTOMER', 'ACTIVE', 'ACTIVE'),
('550e8400-e29b-41d4-a716-446655550004', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'customer2@test.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'CUSTOMER', 'ACTIVE', 'ACTIVE'),
('550e8400-e29b-41d4-a716-446655550005', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'customer3@test.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'CUSTOMER', 'ACTIVE', 'ACTIVE'),
('550e8400-e29b-41d4-a716-446655550006', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'customer4@test.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'CUSTOMER', 'ACTIVE', 'ACTIVE'),
('550e8400-e29b-41d4-a716-446655550007', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'customer5@test.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'CUSTOMER', 'ACTIVE', 'ACTIVE'),
('550e8400-e29b-41d4-a716-446655550008', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'customer6@test.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'CUSTOMER', 'ACTIVE', 'ACTIVE'),
('550e8400-e29b-41d4-a716-446655550009', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'customer7@test.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'CUSTOMER', 'ACTIVE', 'ACTIVE'),
('550e8400-e29b-41d4-a716-446655550010', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'customer8@test.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'CUSTOMER', 'ACTIVE', 'ACTIVE'),
('550e8400-e29b-41d4-a716-446655550011', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'customer9@test.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'CUSTOMER', 'ACTIVE', 'ACTIVE'),
('550e8400-e29b-41d4-a716-446655550012', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'customer10@test.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'CUSTOMER', 'ACTIVE', 'ACTIVE');

-- ============================================================================
-- 3. USER ROLES
-- ============================================================================
INSERT INTO user_roles (user_id, role_id) VALUES
('550e8400-e29b-41d4-a716-446655550000', '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655550001', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655550002', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655550003', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655550004', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655550005', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655550006', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655550007', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655550008', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655550009', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655550010', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655550011', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655550012', '550e8400-e29b-41d4-a716-446655440003');

-- ============================================================================
-- 4. USER PROFILES
-- ============================================================================
INSERT INTO user_profiles (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id, first_name, last_name, nickname, gender, date_of_birth, phone_number, email, profile_image_url, address)
VALUES
('550e8400-e29b-41d4-a716-446655550000', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, '550e8400-e29b-41d4-a716-446655550000', 'Platform', 'Admin', 'Admin', 'MALE', '1990-01-15', '+855 10 100 0001', 'phatmenghor19@gmail.com', 'https://via.placeholder.com/300?text=Admin', 'Phnom Penh, Cambodia'),
('550e8400-e29b-41d4-a716-446655550001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, '550e8400-e29b-41d4-a716-446655550001', 'Business', 'Manager', 'BizMgr', 'MALE', '1992-05-20', '+855 10 100 0002', 'phatmenghor20@gmail.com', 'https://via.placeholder.com/300?text=Manager', 'Phnom Penh, Cambodia'),
('550e8400-e29b-41d4-a716-446655550002', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, '550e8400-e29b-41d4-a716-446655550002', 'Test', 'Customer', 'TestCust', 'MALE', '1995-08-10', '+855 10 100 0003', 'phatmenghor21@gmail.com', 'https://via.placeholder.com/300?text=Customer', 'Phnom Penh, Cambodia');

-- Insert remaining customer profiles
INSERT INTO user_profiles (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id, first_name, last_name, nickname, gender, date_of_birth, phone_number, email, profile_image_url, address)
SELECT 
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    u.id,
    'Customer' || row_number() OVER (ORDER BY u.id),
    'Test',
    'Cust' || row_number() OVER (ORDER BY u.id),
    CASE WHEN random() > 0.5 THEN 'MALE' ELSE 'FEMALE' END,
    NOW()::date - (random() * 10000)::int,
    '+855 10 100 ' || LPAD((1000 + row_number() OVER (ORDER BY u.id))::text, 4, '0'),
    u.user_identifier,
    'https://via.placeholder.com/300?text=Customer' || row_number() OVER (ORDER BY u.id),
    'Phnom Penh, Cambodia'
FROM users u
WHERE u.user_type = 'CUSTOMER' 
  AND u.id NOT IN ('550e8400-e29b-41d4-a716-446655550002')
  AND NOT EXISTS (SELECT 1 FROM user_profiles up WHERE up.user_id = u.id);

-- ============================================================================
-- 5. CATEGORIES
-- ============================================================================
INSERT INTO categories (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, name, description, icon_url, is_featured)
VALUES
('550e8400-e29b-41d4-a716-446655660001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'Beverages', 'Drinks and beverages', 'https://via.placeholder.com/100?text=Beverages', true),
('550e8400-e29b-41d4-a716-446655660002', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'Food', 'Food items and dishes', 'https://via.placeholder.com/100?text=Food', true),
('550e8400-e29b-41d4-a716-446655660003', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'Snacks', 'Snacks and appetizers', 'https://via.placeholder.com/100?text=Snacks', false),
('550e8400-e29b-41d4-a716-446655660004', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'Desserts', 'Desserts and sweets', 'https://via.placeholder.com/100?text=Desserts', false);

-- ============================================================================
-- 6. PRODUCTS (20 test products)
-- ============================================================================
INSERT INTO products (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, name, description, sku, barcode, price, cost, category_id, is_available, stock_quantity)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'Product ' || i,
    'Description for product ' || i,
    'SKU-' || i,
    'BARCODE-' || i,
    (10 + random() * 50)::numeric(10,2),
    (5 + random() * 25)::numeric(10,2),
    ARRAY['550e8400-e29b-41d4-a716-446655660001', '550e8400-e29b-41d4-a716-446655660002', '550e8400-e29b-41d4-a716-446655660003', '550e8400-e29b-41d4-a716-446655660004'][((i-1) % 4) + 1],
    true,
    (5 + random() * 100)::int
FROM generate_series(1, 20) AS t(i);

-- ============================================================================
-- 7. PRODUCT SIZES
-- ============================================================================
INSERT INTO product_sizes (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, product_id, size_name, sku, barcode)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    p.id,
    'Standard',
    p.sku || '-S',
    p.barcode || '-S'
FROM products p;

-- ============================================================================
-- 8. PRODUCT IMAGES
-- ============================================================================
INSERT INTO product_images (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, product_id, image_url, alt_text, display_order)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    p.id,
    'https://via.placeholder.com/400?text=' || p.name,
    p.name || ' image',
    1
FROM products p;

-- ============================================================================
-- 9. BANNERS
-- ============================================================================
INSERT INTO banners (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, title, description, image_url, link_url, is_active, display_order)
VALUES
('550e8400-e29b-41d4-a716-446655770001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'Summer Sale', 'Get 50% off on selected items', 'https://via.placeholder.com/1200x400?text=Summer+Sale', '/sale', true, 1),
('550e8400-e29b-41d4-a716-446655770002', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'New Arrivals', 'Check out our latest products', 'https://via.placeholder.com/1200x400?text=New+Arrivals', '/new', true, 2);

-- ============================================================================
-- 10. CARTS (Basic carts for test customers)
-- ============================================================================
INSERT INTO carts (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id, total_items, total_price)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    u.id,
    0,
    0.00
FROM users u
WHERE u.user_type = 'CUSTOMER'
  AND NOT EXISTS (SELECT 1 FROM carts c WHERE c.user_id = u.id);

-- ============================================================================
-- 11. ORDERS (5 test orders)
-- ============================================================================
INSERT INTO orders (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id, order_status, total_price, subtotal, tax_amount, discount_amount, delivery_fee, notes, customer_name, customer_phone, customer_email)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    ARRAY['550e8400-e29b-41d4-a716-446655550002', '550e8400-e29b-41d4-a716-446655550003', '550e8400-e29b-41d4-a716-446655550004', '550e8400-e29b-41d4-a716-446655550005', '550e8400-e29b-41d4-a716-446655550006'][i],
    ARRAY['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'][((i-1) % 4) + 1],
    (50 + random() * 200)::numeric(10,2),
    (40 + random() * 180)::numeric(10,2),
    (5 + random() * 10)::numeric(10,2),
    (0 + random() * 20)::numeric(10,2),
    5.00,
    'Test order notes ' || i,
    'Customer ' || i,
    '+855 10 100 ' || LPAD(i::text, 4, '0'),
    'customer' || i || '@test.com'
FROM generate_series(1, 5) AS t(i);

-- ============================================================================
-- 12. REFERENCE COUNTERS
-- ============================================================================
INSERT INTO reference_counters (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, reference_type, current_value)
VALUES
('550e8400-e29b-41d4-a716-446655880001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'ORDER', 1000),
('550e8400-e29b-41d4-a716-446655880002', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'INVOICE', 500);

-- ============================================================================
-- 13. SYSTEM SETTINGS
-- ============================================================================
INSERT INTO system_settings (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, setting_key, setting_value)
VALUES
('550e8400-e29b-41d4-a716-446655990001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'PLATFORM_NAME', 'Tiffany E-Menu Platform'),
('550e8400-e29b-41d4-a716-446655990002', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'TAX_RATE', '10'),
('550e8400-e29b-41d4-a716-446655990003', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'CURRENCY', 'KHR'),
('550e8400-e29b-41d4-a716-446655990004', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'DELIVERY_FEE', '5.00');

-- ============================================================================
-- END OF CLEAN TEST DATA
-- ============================================================================
