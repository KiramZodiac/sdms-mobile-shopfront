import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPhone, 
  faHome, 
  faTh, 
  faMapMarkerAlt, 
  faTimes, 
  faChevronRight ,
  faListAlt, 
  faShoppingCart  
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { CartButton } from './CartButton';
/**
 * Redesigned Mobile Bottom Navigation Bar for a more visually appealing and professional look.
 * - Modern floating glassmorphism style
 * - Animated active tab indicator
 * - Category drawer with icons and images
 * - Subtle shadow and rounded corners
 * - Large, touch-friendly icons
 */

import clsx from "clsx";

const NAV_HEIGHT = 68;

const navItems = [
  {
    id: "home",
    label: "Home",
    icon: faHome,
    color: "text-orange-500",
    link: "/",
  },
  {
    id: "categories",
    label: "Categories",
    icon: faTh,
    color: "text-orange-500",
    action: null, // Will open sidebar
  },
  {
    id: "call",
    label: "Call",
    icon: faPhone,
    color: "text-orange-500",
    action: () => window.location.href = "tel:+256755869853",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: faWhatsapp,
    color: "text-green-500",
    action: () => window.open("https://wa.me/256755869853", "_blank"),
  },
];

const CategoryDrawer = ({ open, onClose, categories, loading, onCategoryClick }) => (
  <div
    className={clsx(
      "fixed inset-0 z-50 transition-all duration-300",
      open ? "pointer-events-auto" : "pointer-events-none"
    )}
    style={{ background: open ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0)" }}
    onClick={onClose}
  >
    <div
      className={clsx(
        "absolute left-0 top-0 h-full w-4/5 max-w-xs bg-white dark:bg-gray-900 shadow-2xl rounded-r-2xl p-5 transition-transform duration-300",
        open ? "translate-x-0" : "-translate-x-full"
      )}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">Categories</span>
        <button
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          onClick={onClose}
        >
          <FontAwesomeIcon icon={faTimes} className="text-gray-500" />
        </button>
      </div>
      {loading ? (
        <div className="text-center text-gray-400 py-8">Loading...</div>
      ) : (
        <ul className="space-y-3">
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                className="flex items-center w-full px-3 py-2 rounded-lg hover:bg-orange-50 dark:hover:bg-gray-800 transition group"
                onClick={() => {
                  onCategoryClick(cat);
                  onClose();
                }}
              >
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-8 h-8 rounded-lg object-cover mr-3 border border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <FontAwesomeIcon icon={faListAlt} className="w-7 h-7 mr-3 text-orange-400" />
                )}
                <span className="text-gray-800 dark:text-gray-100 font-medium flex-1 text-left">
                  {cat.name}
                </span>
                {cat.count > 0 && (
                  <span className="ml-2 text-xs bg-orange-100 text-orange-600 rounded-full px-2 py-0.5">
                    {cat.count}
                  </span>
                )}
                <FontAwesomeIcon icon={faChevronRight} className="ml-2 text-gray-300 group-hover:text-orange-400" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

const MobileBottomNavigation = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name, image_url, is_active, count");
        if (error) throw error;
        setCategories((data || []).filter((c) => c.is_active));
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Handle navigation and actions
  const handleNavClick = (item) => {
    setActiveTab(item.id);
    if (item.id === "categories") {
      setSidebarOpen(true);
    } else if (item.link) {
      navigate(item.link);
    } else if (item.action) {
      item.action();
    }
  };

  // Handle category click
  const handleCategoryClick = (cat) => {
    navigate(`/products?category=${encodeURIComponent(cat.name)}`);
  };

  // Only show on mobile
  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 w-full md:hidden
          bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-xl
          flex items-center justify-between px-2 py-2 border-t border-gray-200/20"
        style={{
          height: NAV_HEIGHT,
          boxShadow: "0 -2px 20px 0 rgba(0, 0, 0, 0.1)",
        }}
      >
        {navItems.map((item, idx) => {
          // Insert CartButton after categories (index 1)
          if (idx === 1) {
            return (
              <React.Fragment key={`${item.id}-fragment`}>
                {/* Regular nav item */}
                <button
                  key={item.id}
                  className={clsx(
                    "flex flex-col items-center justify-center flex-1 py-1 transition group relative",
                    "focus:outline-none",
                    activeTab === item.id ? "text-orange-600" : "text-gray-500 dark:text-gray-300"
                  )}
                  onClick={() => handleNavClick(item)}
                  style={{ minWidth: 0 }}
                >
                  <span
                    className={clsx(
                      "flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200",
                      activeTab === item.id
                        ? "bg-orange-100/80 dark:bg-orange-900/40 shadow-md scale-110"
                        : "bg-transparent"
                    )}
                  >
                    <FontAwesomeIcon icon={item.icon} className={clsx("text-xl", item.color)} />
                  </span>
                  <span
                    className={clsx(
                      "text-xs font-medium mt-1 transition-colors",
                      activeTab === item.id ? "text-orange-600" : "text-gray-500 dark:text-gray-300"
                    )}
                  >
                    {item.label}
                  </span>
                  {/* Animated active indicator */}
                  {activeTab === item.id && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-orange-500/80 animate-pulse" />
                  )}
                </button>
                
                {/* Cart Button */}
                <div 
                  key="cart-button"
                  className="flex flex-col items-center justify-center flex-1 py-1 relative"
                  style={{ minWidth: 0 }}
                >
                  <div className="scale-75 transform">
                    <CartButton />
                  </div>
                </div>
              </React.Fragment>
            );
          }
          
          // Regular nav items
          return (
            <button
              key={item.id}
              className={clsx(
                "flex flex-col items-center justify-center flex-1 py-1 transition group relative",
                "focus:outline-none",
                activeTab === item.id ? "text-orange-600" : "text-gray-500 dark:text-gray-300"
              )}
              onClick={() => handleNavClick(item)}
              style={{ minWidth: 0 }}
            >
              <span
                className={clsx(
                  "flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200",
                  activeTab === item.id
                    ? "bg-orange-100/80 dark:bg-orange-900/40 shadow-md scale-110"
                    : "bg-transparent"
                )}
              >
                <FontAwesomeIcon icon={item.icon} className={clsx("text-xl", item.color)} />
              </span>
              <span
                className={clsx(
                  "text-xs font-medium mt-1 transition-colors",
                  activeTab === item.id ? "text-orange-600" : "text-gray-500 dark:text-gray-300"
                )}
              >
                {item.label}
              </span>
              {/* Animated active indicator */}
              {activeTab === item.id && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-orange-500/80 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>
      {/* Category Drawer */}
      <CategoryDrawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        categories={categories}
        loading={loading}
        onCategoryClick={handleCategoryClick}
      />
      {/* Spacer for nav height - prevents content from being hidden behind nav */}
      <div className="h-[76px] md:hidden" />
    </>
  );
};

export default MobileBottomNavigation;

