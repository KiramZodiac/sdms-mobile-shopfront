
import { HeroBanner } from "@/components/HeroBanner";
import { FeaturedCategories } from "@/components/FeaturedCategories";
import { FeaturedProducts } from "@/components/FeaturedProducts";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroBanner />
      <FeaturedCategories />
      <FeaturedProducts />
      
      {/* Newsletter Section */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated with Latest Tech
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for exclusive deals, new product launches, and tech insights
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
