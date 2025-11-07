-- E-commerce Database Structure (PostgreSQL)
-- This file contains CREATE TABLE statements and sample data for PostgreSQL

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order items table (junction table for orders and products)
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Sample data for users
INSERT INTO users (email, name) VALUES
('john.doe@example.com', 'John Doe'),
('jane.smith@example.com', 'Jane Smith'),
('bob.johnson@example.com', 'Bob Johnson'),
('alice.williams@example.com', 'Alice Williams'),
('charlie.brown@example.com', 'Charlie Brown')
ON CONFLICT (email) DO NOTHING;

-- Sample data for products
INSERT INTO products (name, sku, price, description, stock_quantity) VALUES
('PRODUCT_1', 'PROD-001', 29.99, 'Sample Product 1 Description', 100),
('PRODUCT_2', 'PROD-002', 49.99, 'Sample Product 2 Description', 50),
('PRODUCT_3', 'PROD-003', 19.99, 'Sample Product 3 Description', 200),
('PRODUCT_4', 'PROD-004', 79.99, 'Sample Product 4 Description', 30),
('PRODUCT_5', 'PROD-005', 39.99, 'Sample Product 5 Description', 75)
ON CONFLICT (sku) DO NOTHING;

-- Sample data for orders (some recent, some older)
-- Recent orders (within last 7 days)
INSERT INTO orders (user_id, total_amount, status, created_at) VALUES
(1, 29.99, 'completed', NOW() - INTERVAL '2 days'),
(2, 29.99, 'completed', NOW() - INTERVAL '1 day'),
(3, 29.99, 'completed', NOW() - INTERVAL '3 days'),
(1, 79.99, 'completed', NOW() - INTERVAL '5 days'),
(4, 29.99, 'completed', NOW() - INTERVAL '6 days');

-- Older orders (more than 7 days ago)
INSERT INTO orders (user_id, total_amount, status, created_at) VALUES
(2, 49.99, 'completed', NOW() - INTERVAL '10 days'),
(3, 19.99, 'completed', NOW() - INTERVAL '15 days'),
(5, 39.99, 'completed', NOW() - INTERVAL '20 days'),
(1, 99.98, 'completed', NOW() - INTERVAL '25 days'),
(4, 29.99, 'completed', NOW() - INTERVAL '30 days');

-- Sample data for order_items
-- Recent orders with PRODUCT_1
INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES
(1, 1, 1, 29.99, 29.99),  -- Order 1: PRODUCT_1
(2, 1, 1, 29.99, 29.99),  -- Order 2: PRODUCT_1
(3, 1, 1, 29.99, 29.99),  -- Order 3: PRODUCT_1
(4, 4, 1, 79.99, 79.99),  -- Order 4: PRODUCT_4
(5, 1, 1, 29.99, 29.99);  -- Order 5: PRODUCT_1

-- Older orders with various products
INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES
(6, 2, 1, 49.99, 49.99),  -- Order 6: PRODUCT_2
(7, 3, 1, 19.99, 19.99),  -- Order 7: PRODUCT_3
(8, 5, 1, 39.99, 39.99),  -- Order 8: PRODUCT_5
(9, 1, 2, 29.99, 59.98),  -- Order 9: PRODUCT_1 x2
(9, 2, 1, 49.99, 49.99),  -- Order 9: PRODUCT_2
(10, 1, 1, 29.99, 29.99); -- Order 10: PRODUCT_1

