import { useState, useEffect } from "react";
import { Search, Home, ShoppingBag } from "lucide-react";
import { CartButton } from "./CartButton";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100); // Hide other parts when scrolled more than 100px
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <div className="sticky top-0 z-50">
      {/* Marquee Text */}
     

      {/* Main Navigation */}
      <nav className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-md">
        <div className="container mx-auto px-4 lg:px-8 py-3">
          <div
            className={`flex items-center justify-between w-full flex-wrap gap-4 transition-all duration-300 ${
              isScrolled ? "max-h-0 opacity-0 py-0 overflow-hidden" : "max-h-20 opacity-100"
            }`}
          >
            {/* Logo with Image */}
            <a href="/" className="flex items-center space-x-3 flex-shrink-0">
              <img 
                src="./sdmlogo.png" 
                alt="SDM Electronics Logo" 
                className="w-12 h-12 lg:w-16 lg:h-16 object-contain rounded-lg shadow-md bg-white/10 p-1"
                onError={(e) => {
                  // Fallback to text logo if image fails to load
                  // e.target.style.display = 'none';
                  // e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              

              {/* Fallback text logo (hidden by default) */}
              <div className="hidden flex-col items-center">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-extrabold text-lg lg:text-xl">SDM</span>
                </div>
              </div>
              {/* <div className="flex flex-col">
                <span className="text-lg lg:text-xl font-bold text-white">
                  SDM Electronics
                </span>
                <span className="text-xs lg:text-sm text-white/80">
                  Quality Electronics
                </span>
              </div> */}
            </a>

            {/* Right side navigation items */}
            <div className="flex items-center space-x-2 lg:space-x-6 ml-auto">
              {/* Desktop Navigation Links */}
              <a
                href="/"
                className="text-white/90 hover:text-white font-medium transition-colors text-sm lg:text-base hidden md:block"
              >
                Home
              </a>
              <a
                href="/products"
                className="text-white/90 hover:text-white font-medium transition-colors text-sm lg:text-base hidden md:block"
              >
                Products
              </a>
              <a
                href="/aboutUsPage"
                className="text-white/90 hover:text-white font-medium transition-colors text-sm lg:text-base hidden lg:block"
              >
                About
              </a>
              <a
                href="/contactUsPage"
                className="text-white/90 hover:text-white font-medium transition-colors text-sm lg:text-base hidden lg:block"
              >
                Contact
              </a>
              
              {/* Mobile Icons */}
              <a
                href="/"
                className="md:hidden text-white/90 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <Home className="w-5 h-5" />
              </a>
              <a
                href="/products"
                className="md:hidden text-white/90 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
              </a>
              
              {/* Cart Button - Desktop/Tablet only */}
              <div className="hidden md:block">
                <CartButton />
              </div>
              
              {/* Call to Action Button */}
              <a
                href="tel:+256755869853"
                className="hidden sm:flex items-center bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-full text-sm font-medium transition-colors"
              >
                <span className="mr-2">📞</span>
                <span className="hidden lg:inline">Call Now</span>
              </a>
              
              {/* Currency Display */}
              <div className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                <span className="flex items-center space-x-1">
                  <span className="text-lg">🇺🇬</span>
                  <span className="hidden sm:inline text-xs">UGX</span>
                </span>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className={`flex w-full relative transition-all duration-300 ${
            isScrolled ? "mt-2" : "mt-4"
          }`}>
            <div className="relative w-full max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search for electronics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 rounded-lg bg-white/95 backdrop-blur-sm text-gray-800 px-4 pl-12 pr-4 focus:ring-2 focus:ring-white/30 focus:bg-white placeholder-gray-500 text-sm lg:text-base outline-none shadow-lg border border-white/20 transition-all duration-200"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-500" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-md transition-colors text-sm font-medium shadow-md"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </nav>

      {/* Animation CSS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes marquee {
              0% { transform: translate3d(0, 0, 0); }
              100% { transform: translate3d(-100%, 0, 0); }
            }
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-15px); }
            }
            .animate-marquee {
              animation: marquee 47s linear infinite;
              will-change: transform;
            }
            .animate-marquee:hover {
              animation-play-state: paused;
            }
            @media (min-width: 1024px) {
              .animate-marquee {
                animation: none;
              }
              .animate-bounce-text {
                animation: bounce 1.5s ease-in-out infinite;
                display: inline-block; /* Needed for transform */
              }
            }
            @media (max-width: 1023px) {
              .animate-bounce-text {
                animation: none;
              }
              .animate-marquee {
                animation: marquee 47s linear infinite;
              }
            }
          `,
        }}
      />
    </div>
  );
};