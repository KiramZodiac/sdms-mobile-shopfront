
import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, Smartphone, Laptop, Headphones, Watch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/useCart";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { items } = useCart();
  
  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const categories = [
    { name: "Smartphones", icon: Smartphone, href: "/products?category=smartphones" },
    { name: "Laptops", icon: Laptop, href: "/products?category=laptops" },
    { name: "Audio", icon: Headphones, href: "/products?category=audio" },
    { name: "Wearables", icon: Watch, href: "/products?category=wearables" },
  ];

  return (
    <nav className="bg-white shadow-lg border-b">
      {/* Top Bar */}
      <div className="bg-blue-600 text-white py-2">
        <div className="container mx-auto px-4 text-center text-sm">
          <span>Free delivery on orders above UGX 100,000 📱 WhatsApp: +256-XXX-XXXXX</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">SDM Electronics</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search for electronics, gadgets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Account */}
            <Link to="/account">
              <Button variant="ghost" size="sm">
                <User className="w-5 h-5" />
                <span className="hidden sm:ml-2 sm:inline">Account</span>
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Categories - Desktop */}
        <div className="hidden md:flex items-center space-x-8 py-3 border-t">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={category.href}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <category.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-4">
            {/* Mobile Search */}
            <div className="relative mb-4">
              <Input
                type="text"
                placeholder="Search for electronics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* Mobile Categories */}
            <div className="space-y-2">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  to={category.href}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <category.icon className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
