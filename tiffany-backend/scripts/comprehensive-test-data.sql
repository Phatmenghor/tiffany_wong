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
-- Orders: 100 for phatmenghor21@gmail.com (6 items each = 600 order items)
-- ============================================================================

-- ============================================================================
-- 0. CLEANUP - DELETE ALL EXISTING DATA (Foreign Key Order)
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '================================================';
    RAISE NOTICE 'TIFFANY E-MENU PLATFORM - TEST DATA GENERATION';
    RAISE NOTICE '================================================';
    RAISE NOTICE '';
    RAISE NOTICE '[0 percent] Starting cleanup of existing data...';
END $$;

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

DO $$
BEGIN
    RAISE NOTICE '[5 percent] Cleanup completed successfully';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- 1. SYSTEM SETTINGS (Must be first - referenced by other tables)
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '[10 percent] Inserting system settings with complete information...';
END $$;

INSERT INTO system_settings (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, tax_percentage, system_name, description, logo_system_url, primary_color, contact_address, contact_phone, contact_email)
VALUES
('550e8400-e29b-41d4-a716-446655990001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 10.0, 'Tiffany E-Menu Platform', 'Premium E-Commerce and Menu Management Platform for Restaurants & Retail Businesses. Providing comprehensive solutions for inventory management, order processing, customer engagement, and business analytics. We deliver excellence through innovative technology, reliable service, and dedicated customer support to help your business thrive in the digital marketplace.', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', '#57823D', 'No. 123, Street 456, Khan Daun Penh, Phnom Penh, Cambodia', '+855 23 888 9999', 'contact@tiffany.com');

DO $$
BEGIN
    RAISE NOTICE '[12 percent] System settings inserted';
END $$;

-- ============================================================================
-- 1.1 SOCIAL MEDIA (5 social media accounts)
-- ============================================================================
INSERT INTO social_media (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, system_setting_id, name, link_url)
VALUES
('550e8400-e29b-41d4-a716-446655991001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, '550e8400-e29b-41d4-a716-446655990001', 'Facebook', 'https://www.facebook.com/TiffanyCambodia'),
('550e8400-e29b-41d4-a716-446655991002', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, '550e8400-e29b-41d4-a716-446655990001', 'Instagram', 'https://www.instagram.com/tiffanycambodia'),
('550e8400-e29b-41d4-a716-446655991003', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, '550e8400-e29b-41d4-a716-446655990001', 'Telegram', 'https://t.me/tiffanycambodia'),
('550e8400-e29b-41d4-a716-446655991004', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, '550e8400-e29b-41d4-a716-446655990001', 'Twitter', 'https://twitter.com/TiffanyKH'),
('550e8400-e29b-41d4-a716-446655991005', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, '550e8400-e29b-41d4-a716-446655990001', 'LinkedIn', 'https://www.linkedin.com/company/tiffany-cambodia');

DO $$
BEGIN
    RAISE NOTICE '[13 percent] Social media accounts inserted';
END $$;

-- ============================================================================
-- 1.2 BUSINESS HOURS (7 days a week)
-- ============================================================================
INSERT INTO business_hours (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, system_setting_id, day, opening_time, closing_time)
VALUES
('550e8400-e29b-41d4-a716-446655992001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, '550e8400-e29b-41d4-a716-446655990001', 'Monday', '09:00', '22:00'),
('550e8400-e29b-41d4-a716-446655992002', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, '550e8400-e29b-41d4-a716-446655990001', 'Tuesday', '09:00', '22:00'),
('550e8400-e29b-41d4-a716-446655992003', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, '550e8400-e29b-41d4-a716-446655990001', 'Wednesday', '09:00', '22:00'),
('550e8400-e29b-41d4-a716-446655992004', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, '550e8400-e29b-41d4-a716-446655990001', 'Thursday', '09:00', '22:00'),
('550e8400-e29b-41d4-a716-446655992005', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, '550e8400-e29b-41d4-a716-446655990001', 'Friday', '09:00', '23:00'),
('550e8400-e29b-41d4-a716-446655992006', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, '550e8400-e29b-41d4-a716-446655990001', 'Saturday', '10:00', '23:00'),
('550e8400-e29b-41d4-a716-446655992007', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, '550e8400-e29b-41d4-a716-446655990001', 'Sunday', '10:00', '21:00');

DO $$
BEGIN
    RAISE NOTICE '[15 percent] Business hours inserted';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- 2. USERS (60,003 total)
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '[20 percent] Inserting users (60,003 total)...';
    RAISE NOTICE '      - 20,000 ADMIN users';
    RAISE NOTICE '      - 20,000 STAFF users';
    RAISE NOTICE '      - 20,003 CUSTOMER users';
END $$;

-- Insert main admin user (phatmenghor19@gmail.com)
INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, password, user_type, account_status, user_role)
VALUES
('550e8400-e29b-41d4-a716-446655550001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'phatmenghor19@gmail.com', '$2a$12$C3nxQcF8f1rHHOJnyE0ZFOHOYXTn4/pCvUNBkhNPrS40WrnQ9gZ36', 'OWNER', 'ACTIVE', 'ADMIN');

-- Insert owner user with ADMIN role (phatmenghor20@gmail.com)
INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, password, user_type, account_status, user_role)
VALUES
('550e8400-e29b-41d4-a716-446655550003', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'phatmenghor20@gmail.com', '$2a$12$C3nxQcF8f1rHHOJnyE0ZFOHOYXTn4/pCvUNBkhNPrS40WrnQ9gZ36', 'OWNER', 'ACTIVE', 'ADMIN');

DO $$
BEGIN
    RAISE NOTICE '      [30 percent] Inserted 2 main ADMIN users';
END $$;

-- Insert 19,998 additional ADMIN users (OWNER type with ADMIN role)
INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, password, user_type, account_status, user_role)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'admin' || i || '@tiffany.com',
    '$2a$12$C3nxQcF8f1rHHOJnyE0ZFOHOYXTn4/pCvUNBkhNPrS40WrnQ9gZ36',
    'OWNER', 'ACTIVE', 'ADMIN'
FROM generate_series(1, 19998) AS t(i);

DO $$
BEGIN
    RAISE NOTICE '      [40 percent] Inserted 19,998 additional ADMIN users';
END $$;

-- Insert 20,000 STAFF users (OWNER type with STAFF role)
INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, password, user_type, account_status, user_role)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'staff' || i || '@tiffany.com',
    '$2a$12$C3nxQcF8f1rHHOJnyE0ZFOHOYXTn4/pCvUNBkhNPrS40WrnQ9gZ36',
    'OWNER', 'ACTIVE', 'STAFF'
FROM generate_series(1, 20000) AS t(i);

DO $$
BEGIN
    RAISE NOTICE '      [50 percent] Inserted 20,000 STAFF users';
END $$;

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

DO $$
BEGIN
    RAISE NOTICE '      [60 percent] Inserted 20,001 CUSTOMER users';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- 3. CATEGORIES (200 categories)
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '[60 percent] Inserting 200 categories...';
END $$;

INSERT INTO categories (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, name, image_url, status)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'Category ' || i,
    'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
    'ACTIVE'
FROM generate_series(1, 200) AS t(i);

DO $$
BEGIN
    RAISE NOTICE '      [62 percent] Categories inserted';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- 5. PRODUCTS (100,000 with detailed descriptions)
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '[70 percent] Inserting 100,000 products with detailed descriptions...';
    RAISE NOTICE '      This may take several minutes...';
END $$;

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
),
promo_data AS (
    SELECT
        i,
        random() as promo_rand
    FROM generate_series(1, 100000) AS t(i)
)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'Product ' || pd.i,
    (SELECT description_text FROM descriptions WHERE desc_id = ((pd.i - 1) % 3) + 1),
    'SKU-' || LPAD(pd.i::text, 7, '0'),
    'BARCODE-' || LPAD(pd.i::text, 10, '0'),
    (10 + random() * 500)::numeric(10,2),
    'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
    (SELECT id FROM category_list WHERE cat_num = ((pd.i - 1) % 200) + 1),
    'ACTIVE',
    (random() * 10000)::int,  -- Random view count 0-10000
    (random() * 1000)::int,   -- Random favorite count 0-1000
    CASE
        WHEN pd.promo_rand < 0.4 THEN 'PERCENTAGE'       -- 40% PERCENTAGE
        WHEN pd.promo_rand < 0.8 THEN 'FIXED_AMOUNT'     -- 40% FIXED_AMOUNT
        ELSE NULL                                         -- 20% no promotion
    END,
    CASE
        WHEN pd.promo_rand < 0.4 THEN (5 + random() * 45)::numeric(10,2)    -- PERCENTAGE: 5-50%
        WHEN pd.promo_rand < 0.8 THEN (1 + random() * 100)::numeric(10,2)   -- FIXED_AMOUNT: 1-100 discount
        ELSE NULL
    END,
    CASE
        WHEN pd.promo_rand < 0.8 THEN NOW()
        ELSE NULL
    END,
    CASE
        WHEN pd.promo_rand < 0.8 THEN NOW() + INTERVAL '30 days'
        ELSE NULL
    END
FROM promo_data pd;

DO $$
BEGIN
    RAISE NOTICE '      [85 percent] Products inserted successfully';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- 6. PRODUCT SIZES (70% of products = 70,000 with 5-10 sizes each)
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '[76 percent] Inserting product sizes (5-10 per product with sizes)...';
END $$;

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
),
size_with_promo AS (
    SELECT
        p.id as product_id,
        sn.name as size_name,
        sn.size_id,
        p.price,
        p.sku,
        p.barcode,
        random() as promo_rand
    FROM product_with_sizes p
    CROSS JOIN size_names sn
    WHERE sn.size_id <= (5 + ((ABS(hashtext(p.id::text))::numeric % 6))::int)
)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    sp.product_id,
    sp.size_name,
    (sp.price * (0.8 + random() * 0.4))::numeric(10,2),
    sp.sku || '-' || LPAD(sp.size_id::text, 2, '0'),
    sp.barcode || '-' || LPAD(sp.size_id::text, 2, '0'),
    CASE
        WHEN sp.promo_rand < 0.4 THEN 'PERCENTAGE'       -- 40% PERCENTAGE
        WHEN sp.promo_rand < 0.8 THEN 'FIXED_AMOUNT'     -- 40% FIXED_AMOUNT
        ELSE NULL                                         -- 20% no promotion
    END,
    CASE
        WHEN sp.promo_rand < 0.4 THEN (5 + random() * 45)::numeric(10,2)    -- PERCENTAGE: 5-50%
        WHEN sp.promo_rand < 0.8 THEN (1 + random() * 50)::numeric(10,2)    -- FIXED_AMOUNT: 1-50 discount
        ELSE NULL
    END,
    CASE
        WHEN sp.promo_rand < 0.8 THEN NOW()
        ELSE NULL
    END,
    CASE
        WHEN sp.promo_rand < 0.8 THEN NOW() + INTERVAL '30 days'
        ELSE NULL
    END
FROM size_with_promo sp;

DO $$
BEGIN
    RAISE NOTICE '      [78 percent] Product sizes inserted successfully';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- 7. PRODUCT IMAGES (1-5 per product)
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '[81 percent] Inserting product images (1-5 per product)...';
END $$;

INSERT INTO product_images (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, product_id, image_url)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    p.id,
    'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce'
FROM products p
CROSS JOIN generate_series(1, (1 + (random() * 4)::int)) AS img_num;

DO $$
BEGIN
    RAISE NOTICE '      [82 percent] Product images inserted successfully';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- 8. BANNERS (20 banners)
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '[84 percent] Inserting 20 banners...';
END $$;

INSERT INTO banners (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, description, image_url, link_url, status)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'Promotional banner ' || i,
    'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
    '/promo/' || i,
    'ACTIVE'
FROM generate_series(1, 20) AS t(i);

DO $$
BEGIN
    RAISE NOTICE '      [91 percent] Banners inserted successfully';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- 9. CARTS (All 20,001 customers)
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '[87 percent] Inserting carts for 20,001 customers...';
END $$;

INSERT INTO carts (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    u.id
FROM users u
WHERE u.user_type = 'CUSTOMER'
AND NOT EXISTS (SELECT 1 FROM carts c WHERE c.user_id = u.id);

DO $$
BEGIN
    RAISE NOTICE '      [94 percent] Carts inserted successfully';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- 10. ORDERS (100 orders for phatmenghor21@gmail.com)
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '[90 percent] Inserting 100 orders with items, addresses, and history...';
    RAISE NOTICE '      [1] [2] [3] [4] [5] [6] items per order...';
END $$;

-- Simplified Orders (100 orders) - Matches current backend structure
-- No source, order_from, tax_amount, delivery_fee fields
-- New payment_status values: PAID, UNPAID, REFUNDED
INSERT INTO orders (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_number, customer_id, order_status, payment_method, payment_status, subtotal, discount_amount, total_amount, customer_name, customer_phone, customer_email, customer_note)
SELECT
    gen_random_uuid(), 0, NOW() - ((i - 1)::text || ' days')::interval, NOW() - ((i - 1)::text || ' days')::interval, 'system', 'system', false, NULL, NULL,
    'ORD-' || TO_CHAR(NOW() - ((i - 1)::text || ' days')::interval, 'YYYYMMDD') || '-' || LPAD(i::text, 6, '0'),
    '550e8400-e29b-41d4-a716-446655550002',
    -- Order Status: Varied distribution (25% each)
    CASE ((i - 1) % 4)
        WHEN 0 THEN 'PENDING'
        WHEN 1 THEN 'CONFIRMED'
        WHEN 2 THEN 'COMPLETED'
        ELSE 'CANCELLED'
    END,
    -- Payment Method: Split between CASH and BANK
    CASE ((i - 1) % 2)
        WHEN 0 THEN 'CASH'
        ELSE 'BANK'
    END,
    -- Payment Status: PAID for completed orders, UNPAID for pending, REFUNDED for some
    CASE
        WHEN ((i - 1) % 4) = 2 THEN 'PAID'           -- COMPLETED orders are PAID
        WHEN ((i - 1) % 4) = 3 THEN 'REFUNDED'       -- CANCELLED orders are REFUNDED
        WHEN ((i - 1) % 3) = 0 THEN 'PAID'           -- Some unpaid ones become paid
        ELSE 'UNPAID'
    END,
    -- Subtotal: Random price between 50-500
    (50 + random() * 450)::numeric(10,2),
    -- Discount Amount: 0-10% of subtotal (5-50)
    (random() * 50)::numeric(10,2),
    -- Total Amount: subtotal - discount (no tax, no delivery fee)
    ((50 + random() * 450) - (random() * 50))::numeric(10,2),
    -- Customer Name
    CASE
        WHEN (i % 10) = 0 THEN 'Premium Customer ' || i
        WHEN (i % 7) = 0 THEN 'VIP Customer ' || i
        ELSE 'Customer ' || i
    END,
    -- Customer Phone: Varied Cambodian phone numbers
    '+855 ' || LPAD(((i % 98) + 1)::text, 2, '0') || ' ' || LPAD((((i * 17) % 900) + 100)::text, 3, '0') || ' ' || LPAD((((i * 23) % 9000) + 1000)::text, 4, '0'),
    -- Customer Email
    'customer' || i || '@example.com',
    -- Customer Note: Varied messages
    CASE
        WHEN (i % 5) = 0 THEN 'Please deliver ASAP'
        WHEN (i % 5) = 1 THEN 'Leave at door please'
        WHEN (i % 5) = 2 THEN 'Call upon arrival'
        WHEN (i % 5) = 3 THEN 'Special order - handle with care'
        ELSE 'Standard delivery'
    END
FROM generate_series(1, 100) AS t(i);

-- ============================================================================
-- 11. ORDER ITEMS (6 items per order - with progress tracking)
-- ============================================================================
DO $$
DECLARE
    v_order_id UUID;
    v_order_num INT := 0;
    v_progress_msg TEXT := '';
BEGIN
    RAISE NOTICE '      Inserting order items: ';

    FOR v_order_id IN SELECT id FROM orders ORDER BY created_at
    LOOP
        v_order_num := v_order_num + 1;

        -- Insert 6 items for this order
        -- New structure: current_price, final_price, unit_price, has_promotion, promotion_type, promotion_value, etc.
        INSERT INTO order_items (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_id, product_id, product_name, product_image_url, product_size_id, size_name, sku, barcode, quantity, current_price, final_price, unit_price, has_promotion, promotion_type, promotion_value, promotion_from_date, promotion_to_date, total_price)
        SELECT
            gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
            v_order_id,
            p.id,
            p.name,
            p.image_url,
            ps.id,
            ps.size_name,
            p.sku,
            'BC-' || LPAD(p.id::text, 8, '0'),
            CASE WHEN (ROW_NUMBER() OVER (PARTITION BY v_order_id ORDER BY random()))::int % 3 = 0 THEN 1 ELSE 2 END,
            p.price,
            -- Final price: 10-30% discount on some items
            CASE
                WHEN (ROW_NUMBER() OVER (PARTITION BY v_order_id ORDER BY random()))::int % 4 = 0
                    THEN (p.price * 0.7)::numeric(10,2)  -- 30% discount
                WHEN (ROW_NUMBER() OVER (PARTITION BY v_order_id ORDER BY random()))::int % 4 = 1
                    THEN (p.price * 0.8)::numeric(10,2)  -- 20% discount
                WHEN (ROW_NUMBER() OVER (PARTITION BY v_order_id ORDER BY random()))::int % 4 = 2
                    THEN (p.price * 0.9)::numeric(10,2)  -- 10% discount
                ELSE p.price
            END,
            p.price,
            -- Has promotion: 70% of items have promotions
            (ROW_NUMBER() OVER (PARTITION BY v_order_id ORDER BY random()))::int % 10 < 7,
            -- Promotion Type
            CASE
                WHEN (ROW_NUMBER() OVER (PARTITION BY v_order_id ORDER BY random()))::int % 2 = 0 THEN 'PERCENTAGE'
                ELSE 'FIXED_AMOUNT'
            END,
            -- Promotion Value
            CASE
                WHEN (ROW_NUMBER() OVER (PARTITION BY v_order_id ORDER BY random()))::int % 2 = 0 THEN 15.00  -- 15% discount
                ELSE 5.00  -- $5 fixed discount
            END,
            NOW() - INTERVAL '30 days',
            NOW() + INTERVAL '30 days',
            -- Total Price: unit_price * quantity
            (p.price * CASE WHEN (ROW_NUMBER() OVER (PARTITION BY v_order_id ORDER BY random()))::int % 3 = 0 THEN 1 ELSE 2 END)::numeric(10,2)
        FROM (
            SELECT id, name, price, image_url, sku FROM products ORDER BY id LIMIT 6 OFFSET ((ABS(hashtext(v_order_id::text)) % 99994))
        ) p
        CROSS JOIN (SELECT id, size_name FROM product_sizes LIMIT 1) ps;

        -- Show progress every 10 orders
        IF v_order_num % 10 = 0 THEN
            RAISE NOTICE '      [%]', v_order_num;
        END IF;
    END LOOP;

    RAISE NOTICE '      [100 percent] All order items inserted!';
END $$;

-- ============================================================================
-- 12. ORDER DELIVERY ADDRESSES
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '      Inserting order delivery addresses...';
END $$;

INSERT INTO order_delivery_addresses (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_id, village, commune, district, province, street_number, house_number, note, latitude, longitude)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    o.id,
    'Village ' || (random() * 100)::int,
    'Commune ' || (random() * 50)::int,
    'District ' || (random() * 20)::int,
    'Province',
    'Street ' || (random() * 1000)::int,
    'House ' || (random() * 500)::int,
    'Delivery note',
    11.5564 + (random() - 0.5) * 0.1,
    104.9282 + (random() - 0.5) * 0.1
FROM orders o;

-- ============================================================================
-- 13. ORDER STATUS HISTORY
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '      Inserting order status history...';
END $$;

INSERT INTO order_status_history (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_id, order_status, note, changed_by_name)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    o.id,
    o.order_status,
    'Status: ' || o.order_status,
    'system'
FROM orders o;

-- ============================================================================
-- Final Statistics & Summary
-- ============================================================================
DO $$
DECLARE
    v_total_users INT;
    v_total_products INT;
    v_total_sizes INT;
    v_total_images INT;
    v_total_orders INT;
    v_total_order_items INT;
    v_total_categories INT;
    v_total_banners INT;
    v_total_carts INT;
BEGIN
    -- Retrieve counts
    SELECT COUNT(*) INTO v_total_users FROM users;
    SELECT COUNT(*) INTO v_total_products FROM products;
    SELECT COUNT(*) INTO v_total_sizes FROM product_sizes;
    SELECT COUNT(*) INTO v_total_images FROM product_images;
    SELECT COUNT(*) INTO v_total_orders FROM orders;
    SELECT COUNT(*) INTO v_total_order_items FROM order_items;
    SELECT COUNT(*) INTO v_total_categories FROM categories;
    SELECT COUNT(*) INTO v_total_banners FROM banners;
    SELECT COUNT(*) INTO v_total_carts FROM carts;

    -- Print results
    RAISE NOTICE '';
    RAISE NOTICE '[100] DATA GENERATION COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'FINAL STATISTICS';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Users:             %', v_total_users;
    RAISE NOTICE 'Products:          %', v_total_products;
    RAISE NOTICE 'Product Sizes:     %', v_total_sizes;
    RAISE NOTICE 'Product Images:    %', v_total_images;
    RAISE NOTICE 'Categories:        %', v_total_categories;
    RAISE NOTICE 'Banners:           %', v_total_banners;
    RAISE NOTICE 'Shopping Carts:    %', v_total_carts;
    RAISE NOTICE 'Orders:            %', v_total_orders;
    RAISE NOTICE 'Order Items:       %', v_total_order_items;
    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'TEST DATA READY FOR USE!';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Default Login Credentials:';
    RAISE NOTICE '  Admin:    phatmenghor19@gmail.com';
    RAISE NOTICE '  Owner:    phatmenghor20@gmail.com';
    RAISE NOTICE '  Customer: phatmenghor21@gmail.com';
    RAISE NOTICE '  Password: 88889999 (for all test users)';
    RAISE NOTICE '';
    RAISE NOTICE 'Additional users:';
    RAISE NOTICE '  - admin1@tiffany.com to admin19998@tiffany.com (ADMIN users)';
    RAISE NOTICE '  - staff1@tiffany.com to staff20000@tiffany.com (STAFF users)';
    RAISE NOTICE '  - customer1@test.com to customer20000@test.com (CUSTOMER users)';
    RAISE NOTICE '';
    RAISE NOTICE '================================================';
END $$;
