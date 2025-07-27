const savePurchasedItemsToLocalStorage = (items: any[]) => {
    try {
      const existing = JSON.parse(localStorage.getItem("recentlyPurchased") || "[]");
      const updated = [...items, ...existing].slice(0, 10); // Keep latest 10 items
      localStorage.setItem("recentlyPurchased", JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to save to localStorage", error);
    }
  };
    