-- Add condition field to products table

-- Create enum for product condition (only if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE product_condition AS ENUM ('new', 'used', 'like_new', 'refurbished', 'open_box');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add condition column to products table (only if it doesn't exist)
DO $$ BEGIN
    ALTER TABLE public.products 
    ADD COLUMN condition product_condition DEFAULT 'new';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$; 