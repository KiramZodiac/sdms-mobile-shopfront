import React, { useEffect, useState } from 'react';
import { Phone, Home, Grid3X3, MessageCircle, MapPin, X, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import path from 'path';
import { link } from 'fs';

const MobileBottomNavigation = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  //fetch categories from API or state management
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name, image_url, is_active, count");

        if (error) throw error;

        // Filter only active categories
        const activeCategories = data.filter((category) => category.is_active);
        setCategories(activeCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const navItems = [
    {
      id: 'call',
      label: 'Call to Order',
      icon: Phone,
      color: 'text-orange-500'
    },
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      color: 'text-orange-500',
      link: '/', // Assuming you have a home route
      hasNotification: false
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: Grid3X3,
      color: 'text-orange-500',
      hasNotification: true
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageCircle,
      color: 'text-green-500',
      hasNotification: true
    },
    {
      id: 'location',
      label: 'Location',
      icon: MapPin,
      color: 'text-red-500'
    }
  ];

  return (
    <div className="w-full max-w-md mx-auto bg-gray-100 relative">
      
      

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-50   bg-opacity-90 backdrop-blur-sm shadow-lg transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-orange-500 text-white">
          <h2 className="text-lg font-semibold">Categories</h2>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1 hover:bg-orange-600 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Categories List */}
        <div className="p-4">
          <div className="space-y-2">
            {categories.map((category, index) => (
              <button
                key={index}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-left"
                onClick={() => {
                  // Handle category selection here
                  navigate(`/products?category=${category.name.toLowerCase()}`);
                  setActiveTab('categories');
                  setSidebarOpen(false);
                }}
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
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <button className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-200">
            View All Categories
          </button>
        </div>
      </div>

      {/* Bottom Navigation - Fixed with high z-index */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white shadow-lg md:hidden z-50">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  
                  if (item.id === 'call') {
                    window.location.href = 'tel:+256755869853'; 
                  } else if (item.id === 'whatsapp') {
                    window.location.href = 'https://wa.me/+256755869853'; 
                  } else if (item.id === 'location') {
                    window.location.href = "https://www.google.com/maps/place/Stanbic+Bank+%7C+William+Street+Branch/@0.3157357,32.5724852,17z"
                  } else if (item.id === 'categories') {
                    setSidebarOpen(!sidebarOpen);
                  } else {
                    navigate(item.link || '/');
                  }

                  if (item.id === 'categories') {
                    setSidebarOpen(!sidebarOpen);
                  }
                }}
                className={`flex flex-col items-center justify-center py-2 px-1 relative transition-colors duration-200 ${
                  isActive ? 'text-orange-400' : 'text-gray-300'
                } hover:text-orange-400`}
              >
                <div className="relative">
                  <IconComponent 
                    size={20} 
                    className={`mb-1 ${isActive ? item.color : ''}`}
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