// Recent Products Management
const savePurchasedItemsToLocalStorage = (items: any[]) => {
    try {
      const existing = JSON.parse(localStorage.getItem("recentlyPurchased") || "[]");
      const updated = [...items, ...existing].slice(0, 10); // Keep latest 10 items
      localStorage.setItem("recentlyPurchased", JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to save to localStorage", error);
    }
  };

// Cart Management
const saveCartToLocalStorage = (items: any[]) => {
  try {
    localStorage.setItem("sdms_cart_items", JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save cart to localStorage", error);
  }
};

const loadCartFromLocalStorage = () => {
  try {
    const stored = localStorage.getItem("sdms_cart_items");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load cart from localStorage", error);
    return [];
  }
};

// Recent Products Management
const saveRecentProductsToLocalStorage = (products: any[]) => {
  try {
    localStorage.setItem("sdms_recent_products", JSON.stringify(products));
  } catch (error) {
    console.error("Failed to save recent products to localStorage", error);
  }
};

const loadRecentProductsFromLocalStorage = () => {
  try {
    const stored = localStorage.getItem("sdms_recent_products");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load recent products from localStorage", error);
    return [];
  }
};

// Clear functions
const clearCartFromLocalStorage = () => {
  try {
    localStorage.removeItem("sdms_cart_items");
  } catch (error) {
    console.error("Failed to clear cart from localStorage", error);
  }
};

const clearRecentProductsFromLocalStorage = () => {
  try {
    localStorage.removeItem("sdms_recent_products");
  } catch (error) {
    console.error("Failed to clear recent products from localStorage", error);
  }
};

// Export all functions
export {
  savePurchasedItemsToLocalStorage,
  saveCartToLocalStorage,
  loadCartFromLocalStorage,
  saveRecentProductsToLocalStorage,
  loadRecentProductsFromLocalStorage,
  clearCartFromLocalStorage,
  clearRecentProductsFromLocalStorage
};
    