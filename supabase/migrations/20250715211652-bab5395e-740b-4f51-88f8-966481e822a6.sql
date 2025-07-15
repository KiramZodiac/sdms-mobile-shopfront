
-- Create enum types for order status and payment methods
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_method AS ENUM ('whatsapp', 'cash_on_delivery', 'bank_transfer');

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  sku TEXT UNIQUE,
  stock_quantity INTEGER DEFAULT 0,
  category_id UUID REFERENCES public.categories(id),
  images TEXT[] DEFAULT '{}',
  specifications JSONB DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT,
  city TEXT,
  district TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id),
  status order_status DEFAULT 'pending',
  payment_method payment_method DEFAULT 'whatsapp',
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_fee DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  notes TEXT,
  whatsapp_chat_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create product_reviews table
CREATE TABLE public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin_users table for admin panel access
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access to categories and products
CREATE POLICY "Allow public read access to categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to product reviews" ON public.product_reviews FOR SELECT USING (true);

-- Admin policies for full access
CREATE POLICY "Allow admin full access to categories" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_active = true)
);
CREATE POLICY "Allow admin full access to products" ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_active = true)
);
CREATE POLICY "Allow admin full access to customers" ON public.customers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_active = true)
);
CREATE POLICY "Allow admin full access to orders" ON public.orders FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_active = true)
);
CREATE POLICY "Allow admin full access to order_items" ON public.order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_active = true)
);
CREATE POLICY "Allow admin full access to product_reviews" ON public.product_reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_active = true)
);
CREATE POLICY "Allow admin read own profile" ON public.admin_users FOR SELECT USING (id = auth.uid());

-- Public policies for creating orders and customers
CREATE POLICY "Allow public insert customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert order_items" ON public.order_items FOR INSERT WITH CHECK (true);

-- Insert sample categories
INSERT INTO public.categories (name, slug, description, image_url) VALUES
('Smartphones', 'smartphones', 'Latest smartphones and mobile devices', 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400'),
('Laptops', 'laptops', 'Powerful laptops and notebooks', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'),
('Audio Devices', 'audio', 'Headphones, speakers, and audio equipment', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'),
('Wearables', 'wearables', 'Smartwatches and fitness trackers', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'),
('Cameras', 'cameras', 'Digital cameras and photography equipment', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400'),
('Gaming', 'gaming', 'Gaming consoles and accessories', 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400');

-- Insert sample products
INSERT INTO public.products (name, slug, description, short_description, price, original_price, sku, stock_quantity, category_id, images, specifications, features, is_featured, rating, reviews_count) 
SELECT 
  'iPhone 15 Pro Max',
  'iphone-15-pro-max',
  'The iPhone 15 Pro Max is Apple''s largest and most advanced smartphone, featuring a 6.7-inch Super Retina XDR display with ProMotion technology. Powered by the A17 Pro chip built on a 3-nanometer process, it delivers exceptional performance for demanding tasks and gaming. The device includes a sophisticated camera system with a 48MP main camera, 12MP ultra-wide camera, and 12MP telephoto camera with 5x optical zoom.',
  'Latest iPhone with A17 Pro chip and titanium design',
  1200000,
  1350000,
  'IPHONE15PM256',
  15,
  c.id,
  ARRAY['https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400', 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500', 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600'],
  '{"display": "6.7-inch Super Retina XDR", "chip": "A17 Pro", "storage": "256GB", "camera": "48MP Pro camera system", "battery": "Up to 29 hours video playback"}'::jsonb,
  ARRAY['A17 Pro chip with 6-core GPU', 'Titanium design', '48MP Pro camera system', '5x Telephoto zoom', 'Action Button'],
  true,
  4.8,
  124
FROM public.categories c WHERE c.slug = 'smartphones';

INSERT INTO public.products (name, slug, description, short_description, price, sku, stock_quantity, category_id, images, specifications, features, rating, reviews_count)
SELECT 
  'Samsung Galaxy S24 Ultra',
  'samsung-galaxy-s24-ultra',
  'The Samsung Galaxy S24 Ultra is a premium Android smartphone with a large 6.8-inch Dynamic AMOLED display and integrated S Pen functionality. It features a powerful camera system with a 200MP main sensor and advanced AI photography features.',
  'Premium Android phone with S Pen',
  1100000,
  'GALAXYS24U512',
  12,
  c.id,
  ARRAY['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'],
  '{"display": "6.8-inch Dynamic AMOLED", "processor": "Snapdragon 8 Gen 3", "storage": "512GB", "camera": "200MP main camera", "battery": "5000mAh"}'::jsonb,
  ARRAY['200MP Pro camera', 'S Pen included', 'AI photography', '5000mAh battery', 'Titanium frame'],
  4.7,
  98
FROM public.categories c WHERE c.slug = 'smartphones';

INSERT INTO public.products (name, slug, description, short_description, price, sku, stock_quantity, category_id, images, specifications, features, is_featured, rating, reviews_count)
SELECT 
  'MacBook Pro 14"',
  'macbook-pro-14',
  'The MacBook Pro 14-inch with M3 chip delivers exceptional performance for professional workflows. Features a stunning Liquid Retina XDR display, advanced camera and audio, and all-day battery life.',
  'Powerful laptop with M3 chip',
  2500000,
  'MBP14M3512',
  8,
  c.id,
  ARRAY['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'],
  '{"display": "14.2-inch Liquid Retina XDR", "chip": "Apple M3", "memory": "16GB", "storage": "512GB SSD", "battery": "Up to 22 hours"}'::jsonb,
  ARRAY['M3 chip with 10-core GPU', 'Liquid Retina XDR display', '16GB unified memory', '512GB SSD storage', 'MagSafe charging'],
  true,
  4.9,
  89
FROM public.categories c WHERE c.slug = 'laptops';

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'SDM' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE order_number_seq START 1;

-- Function to update product rating when review is added
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products 
  SET 
    rating = (
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM public.product_reviews 
      WHERE product_id = NEW.product_id
    ),
    reviews_count = (
      SELECT COUNT(*)
      FROM public.product_reviews 
      WHERE product_id = NEW.product_id
    ),
    updated_at = NOW()
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update product rating
CREATE TRIGGER update_product_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers to tables
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
