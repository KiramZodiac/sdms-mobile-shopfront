
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images: string[];
}

interface RecentProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
  purchasedAt: string;
}

interface CartContextType {
  items: CartItem[];
  recentProducts: RecentProduct[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  addToRecentProducts: (items: CartItem[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// LocalStorage keys
const CART_STORAGE_KEY = 'sdms_cart_items';
const RECENT_PRODUCTS_KEY = 'sdms_recent_products';

// Load cart items from localStorage
const loadCartFromStorage = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
    return [];
  }
};

// Save cart items to localStorage
const saveCartToStorage = (items: CartItem[]) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
  }
};

// Load recent products from localStorage
const loadRecentProductsFromStorage = (): RecentProduct[] => {
  try {
    const stored = localStorage.getItem(RECENT_PRODUCTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load recent products from localStorage:', error);
    return [];
  }
};

// Save recent products to localStorage
const saveRecentProductsToStorage = (products: RecentProduct[]) => {
  try {
    localStorage.setItem(RECENT_PRODUCTS_KEY, JSON.stringify(products));
  } catch (error) {
    console.error('Failed to save recent products to localStorage:', error);
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const { toast } = useToast();

  // Load cart and recent products from localStorage on mount
  useEffect(() => {
    const savedCart = loadCartFromStorage();
    const savedRecentProducts = loadRecentProductsFromStorage();
    
    setItems(savedCart);
    setRecentProducts(savedRecentProducts);
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const addToCart = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existingItem = prev.find(item => item.id === newItem.id);
      if (existingItem) {
        toast({
          title: "Cart Updated",
          description: `${newItem.name} quantity increased`,
        });
        return prev.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        toast({
          title: "Added to Cart",
          description: `${newItem.name} has been added to your cart`,
        });
        return [...prev, { ...newItem, quantity: 1 }];
      }
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => {
      const itemToRemove = prev.find(item => item.id === id);
      const newItems = prev.filter(item => item.id !== id);
      
      if (itemToRemove) {
        toast({
          title: "Item Removed",
          description: `${itemToRemove.name} has been removed from your cart`,
        });
      }
      
      return newItems;
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from your cart",
    });
  };

  const addToRecentProducts = (purchasedItems: CartItem[]) => {
    const newRecentProducts: RecentProduct[] = purchasedItems.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      images: item.images,
      purchasedAt: new Date().toISOString()
    }));

    setRecentProducts(prev => {
      // Remove duplicates and keep only the latest 10 items
      const existingIds = new Set(prev.map(p => p.id));
      const uniqueNewProducts = newRecentProducts.filter(p => !existingIds.has(p.id));
      const combined = [...uniqueNewProducts, ...prev];
      const limited = combined.slice(0, 10); // Keep latest 10 items
      
      saveRecentProductsToStorage(limited);
      return limited;
    });
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      recentProducts,
      addToCart,
      removeItem,
      updateQuantity,
      clearCart,
      total,
      itemCount,
      addToRecentProducts,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
