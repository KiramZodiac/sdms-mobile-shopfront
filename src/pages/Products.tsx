
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Filter, Grid, List, Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/useCart";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  description: string;
  images: string[];
  category: string;
  stock_quantity: number;
  rating?: number;
  reviews_count?: number;
}

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const { addToCart } = useCart();

  const category = searchParams.get('category') || '';
  const sortBy = searchParams.get('sort') || 'newest';

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, category, sortBy, priceRange]);

  const fetchProducts = async () => {
    try {
      // Mock data for now
      const mockProducts: Product[] = [
        {
          id: "1",
          name: "iPhone 15 Pro Max",
          price: 1200000,
          original_price: 1350000,
          description: "Latest iPhone with A17 Pro chip and titanium design",
          images: ["https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400"],
          category: "smartphones",
          stock_quantity: 15,
          rating: 4.8,
          reviews_count: 124
        },
        {
          id: "2",
          name: "Samsung Galaxy S24 Ultra",
          price: 1100000,
          description: "Premium Android phone with S Pen",
          images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"],
          category: "smartphones",
          stock_quantity: 12,
          rating: 4.7,
          reviews_count: 98
        },
        {
          id: "3",
          name: "MacBook Pro 14\"",
          price: 2500000,
          description: "Powerful laptop with M3 chip",
          images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400"],
          category: "laptops",
          stock_quantity: 8,
          rating: 4.9,
          reviews_count: 89
        },
        {
          id: "4",
          name: "Dell XPS 13",
          price: 1800000,
          description: "Ultra-portable Windows laptop",
          images: ["https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400"],
          category: "laptops",
          stock_quantity: 6,
          rating: 4.5,
          reviews_count: 67
        },
        {
          id: "5",
          name: "Sony WH-1000XM5",
          price: 450000,
          original_price: 520000,
          description: "Premium noise-canceling headphones",
          images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"],
          category: "audio",
          stock_quantity: 25,
          rating: 4.7,
          reviews_count: 203
        },
        {
          id: "6",
          name: "AirPods Pro 2",
          price: 350000,
          description: "Active noise canceling earbuds",
          images: ["https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400"],
          category: "audio",
          stock_quantity: 30,
          rating: 4.6,
          reviews_count: 145
        }
      ];

      setProducts(mockProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filter by category
    if (category) {
      filtered = filtered.filter(product => product.category === category);
    }

    // Filter by price range
    if (priceRange.min) {
      filtered = filtered.filter(product => product.price >= parseInt(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter(product => product.price <= parseInt(priceRange.max));
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
      default:
        // Already in newest order
        break;
    }

    setFilteredProducts(filtered);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]
    });
  };

  const categories = [
    { id: '', name: 'All Categories' },
    { id: 'smartphones', name: 'Smartphones' },
    { id: 'laptops', name: 'Laptops' },
    { id: 'audio', name: 'Audio Devices' },
    { id: 'wearables', name: 'Wearables' },
    { id: 'cameras', name: 'Cameras' },
    { id: 'gaming', name: 'Gaming' }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {category ? categories.find(c => c.id === category)?.name || 'Products' : 'All Products'}
        </h1>
        <p className="text-gray-600">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-64 space-y-6">
          {/* Category Filter */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
            <Select
              value={category}
              onValueChange={(value) => {
                const params = new URLSearchParams(searchParams);
                if (value) {
                  params.set('category', value);
                } else {
                  params.delete('category');
                }
                setSearchParams(params);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range Filter */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
            <div className="space-y-2">
              <Input
                type="number"
                placeholder="Min price"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Max price"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Select
                value={sortBy}
                onValueChange={(value) => {
                  const params = new URLSearchParams(searchParams);
                  params.set('sort', value);
                  setSearchParams(params);
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Products Grid/List */}
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
          }>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 group ${
                  viewMode === 'list' ? 'flex gap-4 p-4' : ''
                }`}
              >
                {/* Product Image */}
                <div className={`relative overflow-hidden ${
                  viewMode === 'list' ? 'w-32 h-32 rounded-lg flex-shrink-0' : 'aspect-square rounded-t-lg'
                }`}>
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.original_price && product.original_price > product.price && (
                      <Badge className="bg-red-500 text-white text-xs">
                        {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className={viewMode === 'list' ? 'flex-1' : 'p-4'}>
                  <Link to={`/products/${product.id}`}>
                    <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(product.rating!) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        ({product.reviews_count})
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-blue-600">
                        {formatPrice(product.price)}
                      </span>
                      {product.original_price && product.original_price > product.price && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(product.original_price)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div className="mb-3">
                    {product.stock_quantity > 0 ? (
                      <span className="text-sm text-green-600">
                        {product.stock_quantity < 10 
                          ? `Only ${product.stock_quantity} left!` 
                          : 'In Stock'
                        }
                      </span>
                    ) : (
                      <span className="text-sm text-red-600">Out of Stock</span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    size="sm"
                    disabled={product.stock_quantity === 0}
                  >
                    {product.stock_quantity === 0 ? (
                      'Out of Stock'
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Filter className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or search terms
              </p>
              <Button
                onClick={() => {
                  setPriceRange({ min: '', max: '' });
                  setSearchParams({});
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
