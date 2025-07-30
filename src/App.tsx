import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { CartProvider } from "@/hooks/useCart";
import { SimpleAdminAuthProvider } from "@/hooks/useSimpleAdminAuth";
import { Layout } from "@/components/Layout";
import { SimpleProtectedRoute } from "@/components/SimpleProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import ContactUsPage from "./pages/ContactUsPage";
import AboutUsPage from "./pages/AboutUsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SimpleAdminAuthProvider>
          <CartProvider>
            
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Index />} />
                  <Route path="products" element={<Products />} />
                  <Route path="products/category/:category" element={<Products />} />
                  <Route path="products/search/:query" element={<Products />} />
                  <Route path="products/featured" element={<Products />} />
                  <Route path="products/top-rated" element={<Products />} />
                  <Route path="products/new-arrivals" element={<Products />} />
                  <Route path="products/on-sale" element={<Products />} />
                  <Route path="products/:slug" element={<ProductDetail />} />
                  <Route path="contactUsPage" element={<ContactUsPage />} />
                  <Route path="aboutUsPage" element={<AboutUsPage />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="*" element={<NotFound />} />
                </Route>

                <Route
                  path="/admin"
                  element={
                    <SimpleProtectedRoute>
                      <Admin />
                    </SimpleProtectedRoute>
                  }
                />
              </Routes>
            
          </CartProvider>
        </SimpleAdminAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
