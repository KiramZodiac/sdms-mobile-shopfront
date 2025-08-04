// Rating and Review Utilities

interface ProductRating {
  rating: number;
  reviews_count: number;
}

// LocalStorage key for persistent ratings
const RATINGS_STORAGE_KEY = 'sdms_product_ratings';

// Load ratings from localStorage
const loadRatingsFromStorage = (): Map<string, ProductRating> => {
  try {
    const stored = localStorage.getItem(RATINGS_STORAGE_KEY);
    if (stored) {
      const ratingsData = JSON.parse(stored);
      return new Map(Object.entries(ratingsData));
    }
  } catch (error) {
    console.error('Failed to load ratings from localStorage:', error);
  }
  return new Map();
};

// Save ratings to localStorage
const saveRatingsToStorage = (ratingsMap: Map<string, ProductRating>) => {
  try {
    const ratingsObject = Object.fromEntries(ratingsMap);
    localStorage.setItem(RATINGS_STORAGE_KEY, JSON.stringify(ratingsObject));
  } catch (error) {
    console.error('Failed to save ratings to localStorage:', error);
  }
};

// Generate a random rating between 3.5 and 5.0 (realistic e-commerce ratings)
const generateRandomRating = (): number => {
  // 70% chance of 4.0-5.0, 25% chance of 3.5-4.0, 5% chance of 3.0-3.5
  const random = Math.random();
  
  if (random < 0.70) {
    // 4.0-5.0 range
    return Math.round((Math.random() * 1 + 4) * 10) / 10;
  } else if (random < 0.95) {
    // 3.5-4.0 range
    return Math.round((Math.random() * 0.5 + 3.5) * 10) / 10;
  } else {
    // 3.0-3.5 range (rare)
    return Math.round((Math.random() * 0.5 + 3) * 10) / 10;
  }
};

// Generate a realistic number of reviews based on rating
const generateReviewCount = (rating: number): number => {
  // Higher ratings tend to have more reviews
  const baseMultiplier = rating >= 4.5 ? 150 : rating >= 4.0 ? 100 : rating >= 3.5 ? 50 : 25;
  const variance = Math.random() * 0.8 + 0.6; // 60% to 140% variance
  
  return Math.round(baseMultiplier * variance);
};

// Generate random ratings for a list of products with persistence
export const generateProductRatings = (products: any[]): Map<string, ProductRating> => {
  const existingRatings = loadRatingsFromStorage();
  const ratingsMap = new Map<string, ProductRating>();
  
  products.forEach(product => {
    // Check if rating already exists for this product
    if (existingRatings.has(product.id)) {
      ratingsMap.set(product.id, existingRatings.get(product.id)!);
    } else {
      // Generate new rating
      const rating = generateRandomRating();
      const reviews_count = generateReviewCount(rating);
      
      const newRating: ProductRating = {
        rating,
        reviews_count
      };
      
      ratingsMap.set(product.id, newRating);
    }
  });
  
  // Save updated ratings to localStorage
  saveRatingsToStorage(ratingsMap);
  
  return ratingsMap;
};

// Generate a single product rating
export const generateSingleProductRating = (): ProductRating => {
  const rating = generateRandomRating();
  const reviews_count = generateReviewCount(rating);
  
  return { rating, reviews_count };
};

// Get rating for a specific product (with persistence)
export const getProductRating = (productId: string): ProductRating | null => {
  const existingRatings = loadRatingsFromStorage();
  return existingRatings.get(productId) || null;
};

// Clear all ratings (for testing)
export const clearAllRatings = (): void => {
  try {
    localStorage.removeItem(RATINGS_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear ratings:', error);
  }
};

// Format rating for display
export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

// Get rating color based on rating value
export const getRatingColor = (rating: number): string => {
  if (rating >= 4.5) return 'text-green-600';
  if (rating >= 4.0) return 'text-blue-600';
  if (rating >= 3.5) return 'text-yellow-600';
  return 'text-red-600';
};

// Generate random review text (for future use)
export const generateReviewText = (): string => {
  const positiveReviews = [
    "Great product, highly recommend!",
    "Excellent quality and fast delivery",
    "Exactly what I was looking for",
    "Amazing value for money",
    "Perfect condition, very satisfied",
    "Outstanding service and product",
    "Best purchase I've made",
    "Highly impressed with quality",
    "Great customer service",
    "Would definitely buy again"
  ];
  
  const neutralReviews = [
    "Good product overall",
    "Meets expectations",
    "Decent quality",
    "Satisfied with purchase",
    "Works as described"
  ];
  
  const rating = generateRandomRating();
  
  if (rating >= 4.0) {
    return positiveReviews[Math.floor(Math.random() * positiveReviews.length)];
  } else {
    return neutralReviews[Math.floor(Math.random() * neutralReviews.length)];
  }
};

// Get rating statistics for analytics
export const getRatingStats = (): { totalProducts: number; averageRating: number; totalReviews: number } => {
  const existingRatings = loadRatingsFromStorage();
  const ratings = Array.from(existingRatings.values());
  
  if (ratings.length === 0) {
    return { totalProducts: 0, averageRating: 0, totalReviews: 0 };
  }
  
  const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
  const totalReviews = ratings.reduce((sum, r) => sum + r.reviews_count, 0);
  
  return {
    totalProducts: ratings.length,
    averageRating: Math.round((totalRating / ratings.length) * 10) / 10,
    totalReviews
  };
}; 