import { useState } from "react";
import { Search, Home, ShoppingBag } from "lucide-react";
import { CartButton } from "./CartButton";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

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
      <div
        className="bg-black text-white py-2 overflow-hidden lg:flex lg:justify-center"
        role="status"
        aria-label="Notification banner"
      >
        <div className="relative whitespace-nowrap min-w-max lg:min-w-0 flex items-center justify-center">
          {/* Left decorative SVG */}
          <svg
            className="hidden lg:block absolute left-0 top-1/2 transform -translate-y-1/2 w-8 h-8 text-orange-400 opacity-50"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>

          {/* Text with bounce on large screens, marquee on small */}
          <span className="text-md font-medium mx-4 animate-marquee lg:animate-bounce-text">
  🔥 Special Offers on Electronics! Free Delivery Nationwide 📱💻{" "}
  <a
    href="tel:+256-755-869-853"
    className="underline hover:text-orange-300"
    onClick={(e) => e.stopPropagation()} // prevent marquee pause or other side effects
  >
    Call us at +256 755 869 853
  </a>{" "}
  | Email: info@sdmelectronics.ug 🔥 Best Prices in Uganda! Quality Electronics for Everyone 📱💻
</span>

          {/* Right decorative SVG */}
          <svg
            className="hidden lg:block absolute right-0 top-1/2 transform -translate-y-1/2 w-8 h-8 text-orange-400 opacity-50"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-md">
        <div className="container mx-auto px-4 lg:px-8 py-3">
          <div className="flex items-center justify-between w-full flex-wrap gap-4">
            {/* Logo */}
            <a href="/" className="flex items-center space-x-2 flex-shrink-0">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-extrabold text-base lg:text-lg">SDM</span>
              </div>
              <span className="text-base lg:text-sm font-semibold text-white  hidden lg:inline-block">
                Electronics
              </span>
            </a>

            {/* Right side navigation items */}
            <div className="flex items-center space-x-2 lg:space-x-6 ml-auto">
              <a
                href="/"
                className="text-white/90 hover:text-white font-medium transition-colors text-sm lg:text-base hidden sm:block"
              >
                Home
              </a>
              <a
                href="/"
                className="text-white/90 hover:text-white font-medium transition-colors sm:hidden p-1 rounded-full hover:bg-gray-100"
              >
                <Home className="w-4 h-4 lg:w-5 lg:h-5" />
              </a>
              <a
                href="/products"
                className="text-white/90 hover:text-white font-medium transition-colors text-sm lg:text-base hidden sm:block"
              >
                Products
              </a>
              <a
                href="/products"
                className="text-white/90 hover:text-white font-medium transition-colors sm:hidden p-1 rounded-full hover:bg-gray-100"
              >
                <ShoppingBag className="w-4 h-4 lg:w-5 lg:h-5" />
              </a>
              <CartButton />
              <div className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                <span className="flex items-center space-x-1">
                  <span>🇺🇬UGX</span>
                  <span className="hidden sm:inline">UGX</span>
                </span>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mt-4 flex w-full relative">
            <input
              type="text"
              placeholder="Search for electronics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full bg-white text-gray-800 px-4 py-2 pr-12 focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-sm lg:text-base outline-none"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-orange-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <Search className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
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
