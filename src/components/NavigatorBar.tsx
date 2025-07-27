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

const MobileBottomNavigation = () => {
  const [activeTab, setActiveTab] = useState('home');
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

        const activeCategories = data.filter((category) => category.is_active);
        setCategories(activeCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const navItems = [
    {
      id: 'call',
      label: 'Call to Order',
      icon: faPhone,
      color: 'text-orange-500',
      action: () => window.location.href = 'tel:+256755869853'
    },
    {
      id: 'home',
      label: 'Home',
      icon: faHome,
      color: 'text-orange-500',
      link: '/',
      hasNotification: false
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: faListAlt,
      color: 'text-orange-500',
      action: () => setSidebarOpen(!sidebarOpen),
      hasNotification: true
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: faWhatsapp,
      color: 'text-green-500',
      action: () => window.location.href = 'https://wa.me/+256755869853',
      hasNotification: true
    },
    {
      id: 'location',
      label: 'Location',
      icon: faMapMarkerAlt,
      color: 'text-red-500',
      action: () => window.location.href = 'https://www.google.com/maps/place/Stanbic+Bank+%7C+William+Street+Branch/@0.3157357,32.5724852,17z'
    }
  ];

  return (
    <div className="w-full max-w-md mx-auto bg-gray-100 relative">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          role="button"
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-3/4 bg-white bg-opacity-90 backdrop-blur-sm shadow-lg transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-orange-500 text-white">
          <h2 className="text-lg font-semibold">Categories</h2>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1 hover:bg-orange-600 rounded"
            aria-label="Close sidebar"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        {/* Categories List */}
        <div className="p-4 max-h-[calc(100vh-100px)] overflow-y-auto">
  {loading ? (
    <p className="text-gray-500">Loading categories...</p>
  ) : (
    <div className="space-y-2">
      {categories.map((category) => (
        <button
          key={category.id}
          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-left"
          onClick={() => {
            navigate(`/products?category=${category.name.toLowerCase()}`);
            setActiveTab('categories');
            setSidebarOpen(false);
          }}
          role="menuitem"
          aria-label={`View ${category.name} category`}
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3 overflow-hidden">
              <img 
                src={category.image_url} 
                alt={category.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-medium text-gray-900">{category.name}</p>
              <p className="text-sm text-gray-500">{category.count} items</p>
            </div>
          </div>
          <FontAwesomeIcon icon={faChevronRight} className="text-gray-400" />
        </button>
      ))}
    </div>
  )}
</div>



        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <button 
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-200"
            aria-label="View all categories"
          >
            View All Categories
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white shadow-lg md:hidden z-50">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.action) {
                    item.action();
                  } else if (item.link) {
                    navigate(item.link);
                  }
                }}
                className={`flex flex-col items-center justify-center py-2 px-1 relative transition-colors duration-200 ${
                  isActive ? 'text-orange-400' : 'text-gray-300'
                } hover:text-orange-400`}
                aria-label={item.label}
                role="tab"
                aria-selected={isActive}
              >
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={item.icon} 
                    size="lg"
                    className={`mb-1 size-7 ${isActive ? item.color : item.id === 'whatsapp' ? 'text-green-500 ' : ''}`}
                  />
                  {item.hasNotification && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-center leading-tight max-w-16">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNavigation;