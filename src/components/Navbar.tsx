
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { SearchBar } from "./SearchBar";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items } = useCart();

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SDM</span>
            </div>
            <span className="font-bold text-xl text-gray-900">
              SDM Electronics
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Products
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="sm" className="relative">
              <ShoppingCart className="w-4 h-4" />
              {cartItemsCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <SearchBar />
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-blue-600 transition-colors px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/products" 
                className="text-gray-700 hover:text-blue-600 transition-colors px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-gray-700">Cart</span>
                <Button variant="outline" size="sm" className="relative">
                  <ShoppingCart className="w-4 h-4" />
                  {cartItemsCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {cartItemsCount}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
