-- E-commerce Database Queries
-- This file contains SQL queries to extract specific information

-- Query 1: E-mail addresses of users who have bought PRODUCT_1 in the past 7 days
SELECT DISTINCT u.email
FROM users u
INNER JOIN orders o ON u.id = o.user_id
INNER JOIN order_items oi ON o.id = oi.order_id
INNER JOIN products p ON oi.product_id = p.id
WHERE p.name = 'PRODUCT_1'
  AND o.status = 'completed'
  AND o.created_at >= datetime('now', '-7 days')
ORDER BY u.email;

-- Query 2: Total sales amount, per day
SELECT 
    DATE(o.created_at) as sale_date,
    SUM(o.total_amount) as total_sales
FROM orders o
WHERE o.status = 'completed'
GROUP BY DATE(o.created_at)
ORDER BY sale_date DESC;

