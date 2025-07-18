import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartButton } from "@/components/CartButton";
import { useCart } from "@/hooks/useCart";
import TopRatedBanner from "./ui/TopRatedBanner";
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
    <>

      <motion.nav
        className="bg-gradient-to-r from-orange-400 to-orange-600 shadow-lg sticky top-0 z-50"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-extrabold text-lg">SDM</span>
              </div>
              <span className="text-2xl font-semibold text-white tracking-tight">Electronics</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-12">
              <Link to="/" className="text-gray-200 hover:text-white font-medium transition-colors duration-200">
                Home
              </Link>
              <Link to="/products" className="text-gray-200 hover:text-white font-medium transition-colors duration-200">
                Products
              </Link>
            </div>

            {/* Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-md mx-12">
              <form onSubmit={handleSearch} className="relative w-full">
                <Input
                  type="text"
                  placeholder="Search for electronics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-700 text-white placeholder-gray-400 border-none rounded-full py-2 px-4 focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
                >
                  <Search className="w-5 h-5" />
                </Button>
              </form>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-6">
              <CartButton />
              <Link to="/admin">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-200 border-gray-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
                >
                  <User className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-gray-200 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                className="lg:hidden bg-gray-800 border-t border-gray-700 py-6"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <div className="flex flex-col space-y-6 px-6">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="relative">
                    <Input
                      type="text"
                      placeholder="Search for electronics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-gray-700 text-white placeholder-gray-400 border-none rounded-full py-2 px-4 focus:ring-2 focus:ring-blue-500"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      variant="ghost"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
                    >
                      <Search className="w-5 h-5" />
                    </Button>
                  </form>

                  {/* Mobile Navigation Links */}
                  <Link
                    to="/"
                    className="text-gray-200 hover:text-white font-medium transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    to="/products"
                    className="text-gray-200 hover:text-white font-medium transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Products
                  </Link>

                  {/* Mobile Actions */}
                  <div className="flex items-center space-x-6 pt-4">
                    <CartButton />
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-200 border-gray-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
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
    </>
  );
};