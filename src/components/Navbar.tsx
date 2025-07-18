import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartButton } from "@/components/CartButton";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <motion.nav
      className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-md sticky top-0 z-50"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-extrabold text-lg">SDM</span>
            </div>
            <span className="text-xl lg:text-2xl font-semibold text-white">Electronics</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-10">
            <Link to="/" className="text-white/90 hover:text-white font-medium transition-colors">Home</Link>
            <Link to="/products" className="text-white/90 hover:text-white font-medium transition-colors">Products</Link>
          </div>

          {/* Cart + Admin */}
          <div className="hidden lg:flex items-center space-x-4">
            <CartButton />
            <Link to="/admin">
              <Button
                variant="outline"
                size="sm"
                className="text-white border-white hover:bg-white hover:text-orange-600 transition"
              >
                <User className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Search bar - Always visible below the top row */}
        <form onSubmit={handleSearch} className="mt-4 flex w-full relative">
          <Input
            type="text"
            placeholder="Search for electronics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full bg-white text-gray-800 px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-orange-600"
          >
            <Search className="w-5 h-5" />
          </Button>
        </form>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="lg:hidden mt-4 border-t border-white/30 pt-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="flex flex-col space-y-4">
                <Link
                  to="/"
                  className="text-white text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/products"
                  className="text-white text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Products
                </Link>
                <div className="flex items-center space-x-4 pt-2">
                  <CartButton />
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-white border-white hover:bg-white hover:text-orange-600 transition"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};
