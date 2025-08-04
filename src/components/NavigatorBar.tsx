import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { CartButton } from './CartButton';
import clsx from "clsx";

const NAV_HEIGHT = 68;

// Cache for categories data
const categoriesCache = {
  data: null,
  timestamp: 0,
  loading: false
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

interface CategoryDrawerProps {
  open: boolean;
  onClose: () => void;
  categories: Array<{
    id: string;
    name: string;
    slug?: string;
    image_url?: string;
    is_active: boolean;
    count?: number;
  }>;
  loading: boolean;
  onCategoryClick: (cat: any) => void;
}

// Memoized CategoryDrawer component
const CategoryDrawer = React.memo(({ open, onClose, categories, loading, onCategoryClick }: CategoryDrawerProps) => (
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
        "absolute left-0 top-0 h-full w-4/5 max-w-xs bg-white dark:bg-gray-900 shadow-2xl rounded-r-2xl transition-transform duration-300 flex flex-col",
        open ? "translate-x-0" : "-translate-x-full"
      )}
      onClick={e => e.stopPropagation()}
    >
      {/* Header - Fixed */}
      <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">Categories</span>
        <button
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          onClick={onClose}
        >
          <FontAwesomeIcon icon={faTimes} className="text-gray-500" />
        </button>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 -webkit-overflow-scrolling-touch">
        {loading ? (
          <div className="text-center text-gray-400 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
            Loading categories...
          </div>
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
                      loading="lazy"
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
  </div>
));

CategoryDrawer.displayName = 'CategoryDrawer';

const MobileBottomNavigation = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState<Array<{
    id: string;
    name: string;
    slug?: string;
    image_url?: string;
    is_active: boolean;
    count?: number;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check if cache is valid
  const isCacheValid = useCallback(() => {
    return categoriesCache.data && 
           categoriesCache.timestamp && 
           Date.now() - categoriesCache.timestamp < CACHE_DURATION;
  }, []);

  // Fetch categories with caching and optimization
  const fetchCategories = useCallback(async () => {
    // Check cache first
    if (isCacheValid()) {
      setCategories(categoriesCache.data);
      setLoading(false);
      return;
    }

    // Prevent multiple simultaneous requests
    if (categoriesCache.loading) return;
    categoriesCache.loading = true;

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);

    try {
      // Dynamic import for Supabase to reduce initial bundle size
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, image_url, is_active")
        .eq("is_active", true)
        .order("name")
        .abortSignal(abortControllerRef.current.signal);

      if (error) throw error;

      const filteredCategories = data || [];
      
      // Update cache
      categoriesCache.data = filteredCategories;
      categoriesCache.timestamp = Date.now();
      
      setCategories(filteredCategories);
    } catch (error) {
      if (error.name === 'AbortError') {
        return; // Request was cancelled
      }
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
      categoriesCache.loading = false;
      abortControllerRef.current = null;
    }
  }, [isCacheValid]);

  // Memoized navigation handler
  const handleNavClick = useCallback((item) => {
    setActiveTab(item.id);
    if (item.id === "categories") {
      setSidebarOpen(true);
      document.body.style.overflow = 'hidden';
      // Fetch categories when drawer opens (lazy loading)
      fetchCategories();
    } else if (item.link) {
      navigate(item.link);
    } else if (item.action) {
      item.action();
    }
  }, [navigate, fetchCategories]);

  // Memoized category click handler
  const handleCategoryClick = useCallback((cat) => {
    const categoryParam = cat.slug || cat.name;
    navigate(`/products?category=${encodeURIComponent(categoryParam)}`);
  }, [navigate]);

  // Memoized drawer close handler
  const handleDrawerClose = useCallback(() => {
    setSidebarOpen(false);
    document.body.style.overflow = '';
  }, []);

  // Memoized nav items to prevent unnecessary re-renders
  const memoizedNavItems = useMemo(() => navItems, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
        {memoizedNavItems.map((item, idx) => {
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
        onClose={handleDrawerClose}
        categories={categories}
        loading={loading}
        onCategoryClick={handleCategoryClick}
      />
      
      {/* Spacer for nav height - prevents content from being hidden behind nav */}
      <div className="h-[76px] md:hidden" />
    </>
  );
};

export default React.memo(MobileBottomNavigation);

