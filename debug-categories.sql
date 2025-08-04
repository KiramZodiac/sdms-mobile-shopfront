-- Debug script to check categories and products
-- Run this in your Supabase SQL editor

-- Check all categories
SELECT id, name, slug, is_active FROM categories ORDER BY name;

-- Check products with their categories
SELECT 
  p.id,
  p.name,
  p.slug,
  c.name as category_name,
  c.slug as category_slug,
  p.category_id
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true
ORDER BY c.name, p.name;

-- Count products per category
SELECT 
  c.name as category_name,
  c.slug as category_slug,
  COUNT(p.id) as product_count
FROM categories c
LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
WHERE c.is_active = true
GROUP BY c.id, c.name, c.slug
ORDER BY product_count DESC, c.name; 