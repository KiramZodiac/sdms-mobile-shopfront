import { HeroBanner } from "@/components/HeroBanner";
import { FeaturedCategories } from "@/components/FeaturedCategories";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import PromoBanners from "@/components/PromoBanners";
import RecentProducts from "@/components/RecentProducts";

import { Mail } from "lucide-react";
import ShopImageCarousel from "@/components/ShopImageCarousek";

const Index = () => {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative z-10">
        <HeroBanner />
      </section>

      {/* Promotional Banners */}
      <section className="">
        <PromoBanners />
      </section>

      {/* Featured Categories */}
      <section className=" container mx-auto px-4">
        <FeaturedCategories />
      </section>

      {/* Featured Products */}
      <section className=" pb-4 container mx-auto px-4">
        <FeaturedProducts />
      </section>

      {/* Recently Purchased Products */}
      <RecentProducts />

      {/* Image Carousel */}
      <section className="py-12 container mx-auto px-4">
        <ShopImageCarousel />
      </section>

      {/* Newsletter Section */}
     {/* Newsletter Section */}
     <section className="py-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4 flex justify-center">
            <div className="bg-white/10 p-3 rounded-full">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-1">Stay Updated with Latest Tech</h2>
          <p className="text-orange-100 mb-6 max-w-xl mx-auto text-sm">
            Subscribe for exclusive deals, product launches, and insights.
          </p>
          <form className="max-w-md mx-auto flex flex-col sm:flex-row items-center gap-3">
            <input
              type="email"
              aria-label="Email for newsletter"
              placeholder="Enter your email"
              className="flex-1 w-full px-4 py-2 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-white text-sm"
            />
            <button
              type="submit"
              className="bg-white text-orange-600 px-5 py-2.5 rounded-md font-semibold hover:bg-orange-100 transition-colors w-full sm:w-auto text-sm"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Index;
