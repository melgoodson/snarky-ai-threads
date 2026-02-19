import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import Collections from "./pages/Collections";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BlogPostDynamic from "./pages/BlogPostDynamic";
import FAQ from "./pages/FAQ";
import About from "./pages/About";
import Checkout from "./pages/Checkout";
import Designs from "./pages/Designs";
import DesignDetail from "./pages/DesignDetail";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderTracking from "./pages/OrderTracking";
import NotFound from "./pages/NotFound";
import PrintifyAdmin from "./pages/PrintifyAdmin";
import CustomDesign from "./pages/CustomDesign";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBlog from "./pages/AdminBlog";
import AdminFAQ from "./pages/AdminFAQ";
import TeeinblueAdmin from "./pages/TeeinblueAdmin";
import Auth from "./pages/Auth";
import ProductManagement from "./pages/ProductManagement";
import CreateProduct from "./pages/CreateProduct";
import UserProfile from "./pages/UserProfile";
import NewArrivals from "./pages/NewArrivals";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ShippingInfo from "./pages/ShippingInfo";
import Returns from "./pages/Returns";
import ShirtLanding from "./pages/ShirtLanding";
import HoodieLanding from "./pages/HoodieLanding";
import BlanketLanding from "./pages/BlanketLanding";
import ToteBagLanding from "./pages/ToteBagLanding";
import MugLanding from "./pages/MugLanding";
import GreetingCardLanding from "./pages/GreetingCardLanding";

const queryClient = new QueryClient();

const AppContent = () => {
  useAnalytics();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/designs" element={<Designs />} />
            <Route path="/designs/:id" element={<DesignDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/funny-snarky-shirts-make-friends" element={<BlogPost />} />
            <Route path="/blog/:slug" element={<BlogPostDynamic />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/about" element={<About />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
            <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
            <Route path="/printify-admin" element={<PrintifyAdmin />} />
            <Route path="/custom-design" element={<CustomDesign />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/blog" element={<AdminBlog />} />
            <Route path="/admin/faq" element={<AdminFAQ />} />
            <Route path="/teeinblue-admin" element={<TeeinblueAdmin />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/product-management" element={<ProductManagement />} />
            <Route path="/create-product" element={<CreateProduct />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/new-arrivals" element={<NewArrivals />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/shipping" element={<ShippingInfo />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/shirts" element={<ShirtLanding />} />
            <Route path="/hoodies" element={<HoodieLanding />} />
            <Route path="/blankets" element={<BlanketLanding />} />
            <Route path="/tote-bags" element={<ToteBagLanding />} />
            <Route path="/mugs" element={<MugLanding />} />
            <Route path="/greeting-cards" element={<GreetingCardLanding />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
