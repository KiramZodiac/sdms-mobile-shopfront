import { Skeleton } from '@/components/ui/skeleton';

// Hero Banner Skeleton
const HeroBannerSkeleton = () => (
  <section className="relative z-10">
    <div className="relative h-64 md:h-80 lg:h-96 bg-gradient-to-r from-orange-500 to-orange-600">
      <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="text-white max-w-2xl">
          <Skeleton className="h-8 w-64 mb-4 bg-white/20" />
          <Skeleton className="h-6 w-48 mb-6 bg-white/20" />
          <Skeleton className="h-12 w-32 bg-white/20" />
        </div>
      </div>
    </div>
  </section>
);

// Promotional Banners Skeleton
const PromoBannersSkeleton = () => (
  <section className="py-4">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Skeleton className="h-32 w-full" />
            <div className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Featured Categories Skeleton
const FeaturedCategoriesSkeleton = () => (
  <section className="py-8 container mx-auto px-4">
    <div className="text-center mb-8">
      <Skeleton className="h-8 w-48 mx-auto mb-4" />
      <Skeleton className="h-4 w-32 mx-auto" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="text-center">
          <Skeleton className="w-16 h-16 rounded-full mx-auto mb-3" />
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>
      ))}
    </div>
  </section>
);

// Featured Products Skeleton
const FeaturedProductsSkeleton = () => (
  <section className="py-8 bg-gradient-to-br from-orange-500/50 to-indigo-900/50">
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <Skeleton className="h-8 w-48 mx-auto mb-4 bg-white/20" />
        <Skeleton className="h-4 w-32 mx-auto bg-white/10" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white/10 rounded-lg overflow-hidden">
            <Skeleton className="h-48 w-full bg-white/20" />
            <div className="p-3">
              <Skeleton className="h-4 w-3/4 mb-2 bg-white/20" />
              <Skeleton className="h-3 w-1/2 mb-3 bg-white/20" />
              <Skeleton className="h-8 w-full bg-white/20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Recent Products Skeleton
const RecentProductsSkeleton = () => (
  <section className="py-8 container mx-auto px-4">
    <div className="text-center mb-8">
      <Skeleton className="h-8 w-48 mx-auto mb-4" />
      <Skeleton className="h-4 w-32 mx-auto" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <div className="p-3">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2 mb-3" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      ))}
    </div>
  </section>
);

// Image Carousel Skeleton
const ImageCarouselSkeleton = () => (
  <section className="py-12 container mx-auto px-4">
    <div className="text-center mb-8">
      <Skeleton className="h-8 w-48 mx-auto mb-4" />
      <Skeleton className="h-4 w-32 mx-auto" />
    </div>
    <div className="relative">
      <Skeleton className="h-64 md:h-80 w-full rounded-lg" />
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>
    </div>
  </section>
);

// Newsletter Section Skeleton
const NewsletterSkeleton = () => (
  <section className="py-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
    <div className="container mx-auto px-4 text-center">
      <div className="mb-4 flex justify-center">
        <Skeleton className="w-14 h-14 rounded-full bg-white/10" />
      </div>
      <Skeleton className="h-8 w-64 mx-auto mb-4 bg-white/20" />
      <Skeleton className="h-4 w-96 mx-auto mb-6 bg-white/10" />
      <div className="max-w-md mx-auto flex flex-col sm:flex-row items-center gap-3">
        <Skeleton className="flex-1 h-10 bg-white/20" />
        <Skeleton className="w-full sm:w-32 h-10 bg-white/20" />
      </div>
    </div>
  </section>
);

// Main App Skeleton Component
export const AppSkeleton = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroBannerSkeleton />
      
      {/* Promotional Banners */}
      <PromoBannersSkeleton />
      
      {/* Featured Categories */}
      <FeaturedCategoriesSkeleton />
      
      {/* Featured Products */}
      <FeaturedProductsSkeleton />
      
      {/* Recently Purchased Products */}
      <RecentProductsSkeleton />
      
      {/* Image Carousel */}
      <ImageCarouselSkeleton />
      
      {/* Newsletter Section */}
      <NewsletterSkeleton />
    </div>
  );
};

export default AppSkeleton; 