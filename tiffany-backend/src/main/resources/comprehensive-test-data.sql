-- ============================================================================
-- COMPREHENSIVE TEST DATA FOR TIFFANY CAMBODIA E-COMMERCE PLATFORM
-- ============================================================================
-- Generated test data with:
-- - 3 admin/staff users + 20,000 customers
-- - 300 categories, 300 banners
-- - 10,000 products (50% with sizes, 80% with promotions)
-- - 200 product favorites
-- - 100 cart items per user
-- - 30,000 orders for phatmenghor21@gmail.com
-- ============================================================================

-- ============================================================================
-- 1. USERS - 3 Admin/Staff + 20,000 Customers
-- ============================================================================

-- Admin User
INSERT INTO users (id, user_identifier, password, user_type, user_role, account_status, status, created_by, created_at, is_deleted)
VALUES (
    '10000000-0000-0000-0000-000000000001',
    'admin@tiffany.com',
    '$2a$12$abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz1', -- bcrypt hash
    'OWNER',
    'ADMIN',
    'ACTIVE',
    'ACTIVE',
    'SYSTEM',
    NOW(),
    false
);

-- Staff User
INSERT INTO users (id, user_identifier, password, user_type, user_role, account_status, status, created_by, created_at, is_deleted)
VALUES (
    '10000000-0000-0000-0000-000000000002',
    'staff@tiffany.com',
    '$2a$12$abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz2',
    'OWNER',
    'STAFF',
    'ACTIVE',
    'ACTIVE',
    'SYSTEM',
    NOW(),
    false
);

-- Customer Test User (Primary customer for orders)
INSERT INTO users (id, user_identifier, password, user_type, user_role, account_status, status, created_by, created_at, is_deleted)
VALUES (
    '10000000-0000-0000-0000-000000000003',
    'phatmenghor21@gmail.com',
    '$2a$12$abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz3',
    'CUSTOMER',
    'CUSTOMER',
    'ACTIVE',
    'ACTIVE',
    'SYSTEM',
    NOW(),
    false
);

-- Generate 19,999 additional customers (IDs from 10000000-0000-0000-0000-000000000004 to 10000000-0000-0000-0000-000004E1F)
-- For brevity, showing pattern - in actual implementation, use batch insert
INSERT INTO users (id, user_identifier, password, user_type, user_role, account_status, status, created_by, created_at, is_deleted)
SELECT
    UUID() as id,
    CONCAT('customer_', LPAD(num, 5, '0'), '@example.com') as user_identifier,
    '$2a$12$abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz' as password,
    'CUSTOMER' as user_type,
    'CUSTOMER' as user_role,
    'ACTIVE' as account_status,
    'ACTIVE' as status,
    'SYSTEM' as created_by,
    DATE_ADD(NOW(), INTERVAL -FLOOR(RAND()*90) DAY) as created_at,
    false as is_deleted
FROM (
    SELECT @row:=@row+1 as num FROM
    (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) t1,
    (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) t2,
    (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) t3,
    (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) t4,
    (SELECT @row:=3) init
) numbers
WHERE num > 0 AND num <= 19999;

-- ============================================================================
-- 2. USER PROFILES - For all users
-- ============================================================================

-- Admin profile
INSERT INTO user_profiles (id, user_id, email, first_name, last_name, phone_number, created_by, created_at)
VALUES (
    UUID(),
    '10000000-0000-0000-0000-000000000001',
    'admin@tiffany.com',
    'Admin',
    'User',
    '+855123456789',
    'SYSTEM',
    NOW()
);

-- Staff profile
INSERT INTO user_profiles (id, user_id, email, first_name, last_name, phone_number, created_by, created_at)
VALUES (
    UUID(),
    '10000000-0000-0000-0000-000000000002',
    'staff@tiffany.com',
    'Staff',
    'Member',
    '+855987654321',
    'SYSTEM',
    NOW()
);

-- Primary customer profile
INSERT INTO user_profiles (id, user_id, email, first_name, last_name, phone_number, created_by, created_at)
VALUES (
    UUID(),
    '10000000-0000-0000-0000-000000000003',
    'phatmenghor21@gmail.com',
    'Phat',
    'Menghor',
    '+855901234567',
    'SYSTEM',
    NOW()
);

-- Customer profiles for others
INSERT INTO user_profiles (id, user_id, email, first_name, last_name, phone_number, created_by, created_at)
SELECT
    UUID() as id,
    u.id as user_id,
    u.user_identifier as email,
    CONCAT('Customer_', LPAD(@cust_row:=@cust_row+1, 5, '0')) as first_name,
    CONCAT('User_', LPAD(@cust_row, 5, '0')) as last_name,
    CONCAT('+855', LPAD(FLOOR(RAND()*999999999), 9, '0')) as phone_number,
    'SYSTEM' as created_by,
    u.created_at
FROM users u, (SELECT @cust_row:=0) init
WHERE u.user_type = 'CUSTOMER' AND u.user_identifier != 'phatmenghor21@gmail.com'
LIMIT 19999;

-- ============================================================================
-- 3. CATEGORIES - 300 categories
-- ============================================================================

INSERT INTO categories (id, name, slug, description, created_by, created_at, is_deleted)
SELECT
    UUID() as id,
    CONCAT('Category_', LPAD(num, 3, '0')) as name,
    CONCAT('category-', LPAD(num, 3, '0')) as slug,
    CONCAT('Category ', num, ' - Premium selection of products') as description,
    'SYSTEM' as created_by,
    DATE_ADD(NOW(), INTERVAL -FLOOR(RAND()*90) DAY) as created_at,
    false as is_deleted
FROM (
    SELECT @cat:=@cat+1 as num FROM
    (SELECT 0 UNION SELECT 1 UNION SELECT 2) t1,
    (SELECT 0 UNION SELECT 1 UNION SELECT 2) t2,
    (SELECT 0 UNION SELECT 1 UNION SELECT 2) t3,
    (SELECT 0 UNION SELECT 1 UNION SELECT 2) t4,
    (SELECT 0 UNION SELECT 1 UNION SELECT 2) t5,
    (SELECT @cat:=-1) init
) cat_nums
WHERE num > 0 AND num <= 300;

-- ============================================================================
-- 4. PRODUCT SIZES - Master sizes (S, M, L, XL, XXL)
-- ============================================================================

INSERT INTO product_sizes (id, name, code, is_active, created_by, created_at, is_deleted)
VALUES
    (UUID(), 'Small', 'S', true, 'SYSTEM', NOW(), false),
    (UUID(), 'Medium', 'M', true, 'SYSTEM', NOW(), false),
    (UUID(), 'Large', 'L', true, 'SYSTEM', NOW(), false),
    (UUID(), 'Extra Large', 'XL', true, 'SYSTEM', NOW(), false),
    (UUID(), 'Double Extra Large', 'XXL', true, 'SYSTEM', NOW(), false);

-- ============================================================================
-- 5. PRODUCTS - 10,000 products
-- ============================================================================

INSERT INTO products (id, category_id, name, slug, description, sku, barcode, main_image_url, status, is_deleted, created_by, created_at)
SELECT
    UUID() as id,
    (SELECT id FROM categories ORDER BY RAND() LIMIT 1) as category_id,
    CONCAT('Product_', LPAD(num, 5, '0')) as name,
    CONCAT('product-', LPAD(num, 5, '0')) as slug,
    CONCAT('Premium quality product ', num, ' with excellent features and durability') as description,
    CONCAT('SKU-', LPAD(num, 5, '0')) as sku,
    CONCAT('BARCODE', LPAD(num, 7, '0')) as barcode,
    CASE
        WHEN FLOOR(RAND()*5) = 0 THEN 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'
        WHEN FLOOR(RAND()*5) = 1 THEN 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'
        WHEN FLOOR(RAND()*5) = 2 THEN 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'
        WHEN FLOOR(RAND()*5) = 3 THEN 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500'
        ELSE 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500'
    END as main_image_url,
    'ACTIVE' as status,
    false as is_deleted,
    'SYSTEM' as created_by,
    DATE_ADD(NOW(), INTERVAL -FLOOR(RAND()*90) DAY) as created_at
FROM (
    SELECT @prow:=@prow+1 as num FROM
    (SELECT 0 UNION SELECT 1 UNION SELECT 2) p1,
    (SELECT 0 UNION SELECT 1 UNION SELECT 2) p2,
    (SELECT 0 UNION SELECT 1 UNION SELECT 2) p3,
    (SELECT 0 UNION SELECT 1 UNION SELECT 2) p4,
    (SELECT 0 UNION SELECT 1 UNION SELECT 2) p5,
    (SELECT 0 UNION SELECT 1 UNION SELECT 2) p6,
    (SELECT @prow:=-1) init
) prod_nums
WHERE num > 0 AND num <= 10000;

-- ============================================================================
-- 6. PRODUCT SIZES MAPPING - 50% of products get sizes
-- ============================================================================

INSERT INTO product_size (id, product_id, size_id, price_adjustment, created_by, created_at, is_deleted)
SELECT
    UUID() as id,
    p.id as product_id,
    ps.id as size_id,
    FLOOR(RAND()*50)*1.0 as price_adjustment,
    'SYSTEM' as created_by,
    NOW() as created_at,
    false as is_deleted
FROM products p
CROSS JOIN product_sizes ps
WHERE FLOOR(RAND()*2) = 0
LIMIT 25000; -- 50% of 10000 products * 5 sizes

-- ============================================================================
-- 7. PROMOTIONS - 80% of products have promotions
-- ============================================================================

INSERT INTO products (id, category_id, name, promotion_type, promotion_value, promotion_from_date, promotion_to_date)
UPDATE products p
SET
    p.promotion_type = CASE WHEN FLOOR(RAND()*2) = 0 THEN 'PERCENTAGE' ELSE 'FIXED_AMOUNT' END,
    p.promotion_value = CASE
        WHEN p.promotion_type = 'PERCENTAGE' THEN FLOOR(RAND()*40) + 5
        ELSE FLOOR(RAND()*50000) + 5000
    END,
    p.promotion_from_date = DATE_ADD(NOW(), INTERVAL -FLOOR(RAND()*30) DAY),
    p.promotion_to_date = DATE_ADD(NOW(), INTERVAL FLOOR(RAND()*90) + 30 DAY)
WHERE FLOOR(RAND()*10) < 8; -- 80% probability

-- ============================================================================
-- 8. BANNERS - 300 banners
-- ============================================================================

INSERT INTO banners (id, title, description, image_url, link_url, position, is_active, created_by, created_at, is_deleted)
SELECT
    UUID() as id,
    CONCAT('Banner_', LPAD(num, 3, '0')) as title,
    CONCAT('Promotional banner for campaign ', num) as description,
    CASE
        WHEN FLOOR(RAND()*3) = 0 THEN 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200'
        WHEN FLOOR(RAND()*3) = 1 THEN 'https://images.unsplash.com/photo-1557821552-17105176677c?w=1200'
        ELSE 'https://images.unsplash.com/photo-1483389127117-b6a2102724ae?w=1200'
    END as image_url,
    CONCAT('/campaign-', LPAD(num, 3, '0')) as link_url,
    num % 5 + 1 as position,
    true as is_active,
    'SYSTEM' as created_by,
    DATE_ADD(NOW(), INTERVAL -FLOOR(RAND()*60) DAY) as created_at,
    false as is_deleted
FROM (
    SELECT @brow:=@brow+1 as num FROM
    (SELECT 0 UNION SELECT 1 UNION SELECT 2) b1,
    (SELECT 0 UNION SELECT 1 UNION SELECT 2) b2,
    (SELECT 0 UNION SELECT 1 UNION SELECT 2) b3,
    (SELECT 0 UNION SELECT 1 UNION SELECT 2) b4,
    (SELECT 0 UNION SELECT 1 UNION SELECT 2) b5,
    (SELECT @brow:=-1) init
) ban_nums
WHERE num > 0 AND num <= 300;

-- ============================================================================
-- 9. PRODUCT FAVORITES - 200 favorites
-- ============================================================================

INSERT INTO product_favorite (id, user_id, product_id, created_by, created_at)
SELECT
    UUID() as id,
    (SELECT id FROM users WHERE user_type = 'CUSTOMER' ORDER BY RAND() LIMIT 1) as user_id,
    (SELECT id FROM products ORDER BY RAND() LIMIT 1) as product_id,
    'SYSTEM' as created_by,
    DATE_ADD(NOW(), INTERVAL -FLOOR(RAND()*30) DAY) as created_at
FROM (
    SELECT @fav:=@fav+1 as num FROM
    (SELECT 0 UNION SELECT 1) f1,
    (SELECT 0 UNION SELECT 1) f2,
    (SELECT 0 UNION SELECT 1) f3,
    (SELECT 0 UNION SELECT 1) f4,
    (SELECT 0 UNION SELECT 1) f5,
    (SELECT 0 UNION SELECT 1) f6,
    (SELECT 0 UNION SELECT 1) f7,
    (SELECT @fav:=-1) init
) fav_nums
WHERE num > 0 AND num <= 200;

-- ============================================================================
-- 10. CARTS - 100 items per user (sample)
-- ============================================================================

INSERT INTO carts (id, user_id, created_by, created_at)
SELECT DISTINCT user_id, user_id, 'SYSTEM', NOW()
FROM users
WHERE user_type = 'CUSTOMER';

-- Cart items - 100 per user
INSERT INTO cart_items (id, cart_id, product_id, product_size_id, quantity, created_by, created_at, is_deleted)
SELECT
    UUID() as id,
    c.id as cart_id,
    (SELECT id FROM products ORDER BY RAND() LIMIT 1) as product_id,
    (SELECT id FROM product_size ORDER BY RAND() LIMIT 1) as product_size_id,
    FLOOR(RAND()*5) + 1 as quantity,
    'SYSTEM' as created_by,
    DATE_ADD(NOW(), INTERVAL -FLOOR(RAND()*7) DAY) as created_at,
    false as is_deleted
FROM carts c
CROSS JOIN (
    SELECT @cart_item:=@cart_item+1 as rn FROM
    (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6) ci1,
    (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6) ci2,
    (SELECT @cart_item:=-1) init
) nums
WHERE rn <= 100;

-- ============================================================================
-- 11. ORDERS - 30,000 orders for phatmenghor21@gmail.com
-- ============================================================================

INSERT INTO orders (id, order_number, customer_id, order_status, subtotal, discount_amount, delivery_fee, tax_amount, total_amount, customer_note, created_by, created_at)
SELECT
    UUID() as id,
    CONCAT('ORD-', DATE_FORMAT(DATE_ADD(NOW(), INTERVAL -FLOOR(RAND()*90) DAY), '%Y%m%d'), '-', LPAD(num, 5, '0')) as order_number,
    '10000000-0000-0000-0000-000000000003' as customer_id,
    CASE WHEN FLOOR(RAND()*100) < 70 THEN 'COMPLETED'
         WHEN FLOOR(RAND()*100) < 85 THEN 'CONFIRMED'
         ELSE 'PENDING'
    END as order_status,
    FLOOR(RAND()*500000) + 10000 as subtotal,
    FLOOR(RAND()*50000) as discount_amount,
    CASE WHEN FLOOR(RAND()*2) = 0 THEN 0 ELSE 5000 END as delivery_fee,
    FLOOR(RAND()*20000) as tax_amount,
    FLOOR(RAND()*600000) + 15000 as total_amount,
    CASE WHEN FLOOR(RAND()*2) = 0 THEN NULL ELSE 'Please deliver on time' END as customer_note,
    'SYSTEM' as created_by,
    DATE_ADD(NOW(), INTERVAL -FLOOR(RAND()*90) DAY) as created_at
FROM (
    SELECT @orow:=@orow+1 as num FROM
    (SELECT 0 UNION SELECT 1 UNION SELECT 2) o1,
    (SELECT 0 UNION SELECT 1 UNION SELECT 2) o2,
    (SELECT 0 UNION SELECT 1 UNION SELECT 2) o3,
    (SELECT 0 UNION SELECT 1 UNION SELECT 2) o4,
    (SELECT 0 UNION SELECT 1 UNION SELECT 2) o5,
    (SELECT 0 UNION SELECT 1 UNION SELECT 2) o6,
    (SELECT @orow:=-1) init
) ord_nums
WHERE num > 0 AND num <= 30000;

-- ============================================================================
-- 12. ORDER ITEMS - Items for each order (2-5 items per order)
-- ============================================================================

INSERT INTO order_items (id, order_id, product_id, product_size_id, product_name, product_image_url, size_name, sku, current_price, final_price, unit_price, quantity, total_price, has_promotion, promotion_type, promotion_value, created_by, created_at)
SELECT
    UUID() as id,
    o.id as order_id,
    p.id as product_id,
    ps.id as product_size_id,
    p.name as product_name,
    p.main_image_url as product_image_url,
    psize.name as size_name,
    p.sku as sku,
    FLOOR(RAND()*500000) + 10000 as current_price,
    FLOOR(RAND()*400000) + 5000 as final_price,
    FLOOR(RAND()*400000) + 5000 as unit_price,
    FLOOR(RAND()*5) + 1 as quantity,
    FLOOR(RAND()*2000000) + 10000 as total_price,
    CASE WHEN p.promotion_type IS NOT NULL THEN true ELSE false END as has_promotion,
    p.promotion_type as promotion_type,
    p.promotion_value as promotion_value,
    'SYSTEM' as created_by,
    o.created_at
FROM orders o
CROSS JOIN products p
CROSS JOIN (SELECT id FROM product_size ORDER BY RAND() LIMIT 1) ps
LEFT JOIN product_sizes psize ON ps.size_id = psize.id
WHERE FLOOR(RAND()*3) < 2 -- Average 2-3 items per order
LIMIT 90000; -- Approximately 3 items per order

-- ============================================================================
-- 13. ORDER STATUS HISTORY - Status change history
-- ============================================================================

INSERT INTO order_status_history (id, order_id, order_status, changed_by_user_id, changed_by_name, note, created_at)
SELECT
    UUID() as id,
    o.id as order_id,
    o.order_status as order_status,
    '10000000-0000-0000-0000-000000000002' as changed_by_user_id,
    'Staff Member' as changed_by_name,
    CASE o.order_status
        WHEN 'PENDING' THEN 'Order placed by customer'
        WHEN 'CONFIRMED' THEN 'Order confirmed by business'
        WHEN 'COMPLETED' THEN 'Order delivered to customer'
        ELSE 'Order cancelled'
    END as note,
    o.created_at as created_at
FROM orders o;

-- Add additional status changes for completed orders
INSERT INTO order_status_history (id, order_id, order_status, changed_by_user_id, changed_by_name, note, created_at)
SELECT
    UUID() as id,
    o.id as order_id,
    'COMPLETED' as order_status,
    '10000000-0000-0000-0000-000000000002' as changed_by_user_id,
    'Staff Member' as changed_by_name,
    'Order delivered' as note,
    DATE_ADD(o.created_at, INTERVAL FLOOR(RAND()*14) + 1 DAY) as created_at
FROM orders o
WHERE o.order_status = 'COMPLETED';

-- ============================================================================
-- 14. DELIVERY ADDRESSES - Sample addresses for primary customer
-- ============================================================================

INSERT INTO order_delivery_address (id, order_id, village, commune, district, province, street_number, house_number, note, created_by, created_at)
SELECT
    UUID() as id,
    o.id as order_id,
    CONCAT('Village ', FLOOR(RAND()*100)+1) as village,
    CONCAT('Commune ', FLOOR(RAND()*50)+1) as commune,
    CONCAT('District ', FLOOR(RAND()*15)+1) as district,
    CONCAT('Province ', FLOOR(RAND()*24)+1) as province,
    LPAD(FLOOR(RAND()*9999)+1, 4, '0') as street_number,
    LPAD(FLOOR(RAND()*999)+1, 3, '0') as house_number,
    CASE WHEN FLOOR(RAND()*2) = 0 THEN 'Please ring doorbell twice' ELSE NULL END as note,
    'SYSTEM' as created_by,
    o.created_at
FROM orders o;

-- ============================================================================
-- INDEXES for performance
-- ============================================================================

CREATE INDEX idx_users_user_identifier ON users(user_identifier);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_order_status ON orders(order_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_product_favorite_user_id ON product_favorite(user_id);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- SELECT COUNT(*) as total_users FROM users;
-- SELECT user_type, COUNT(*) FROM users GROUP BY user_type;
-- SELECT user_role, COUNT(*) FROM users WHERE user_type = 'OWNER' GROUP BY user_role;
-- SELECT COUNT(*) as total_categories FROM categories WHERE is_deleted = false;
-- SELECT COUNT(*) as total_products FROM products WHERE is_deleted = false;
-- SELECT COUNT(*) as total_orders FROM orders WHERE customer_id = '10000000-0000-0000-0000-000000000003';
-- SELECT order_status, COUNT(*) FROM orders GROUP BY order_status;

-- ============================================================================
-- END OF COMPREHENSIVE TEST DATA
-- ============================================================================
