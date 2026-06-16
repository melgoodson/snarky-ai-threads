import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";
import { CartProvider } from "./contexts/CartContext";
import { useExternalTracking } from "@/hooks/useExternalTracking";
import { useGA4Tracking } from "@/hooks/useGA4Tracking";
import { useTikTokTracking } from "@/hooks/useTikTokTracking";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { supabase } from "@/integrations/supabase/client";
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
import AdminLogin from "./pages/AdminLogin";
import AdminBlog from "./pages/AdminBlog";
import AdminFAQ from "./pages/AdminFAQ";
import AdminOrders from "./pages/AdminOrders";
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
import JournalLanding from "./pages/JournalLanding";
import ToteBagLanding from "./pages/ToteBagLanding";
import MugLanding from "./pages/MugLanding";
import GreetingCardLanding from "./pages/GreetingCardLanding";
import CategoryLanding from "./pages/CategoryLanding";
import WhiteElephantLanding from "./pages/WhiteElephantLanding";
import CoworkerGiftsLanding from "./pages/CoworkerGiftsLanding";
import AiCustomClothing from "./pages/AiCustomClothing";
import { BestSellersPopup } from "./components/BestSellersPopup";

const queryClient = new QueryClient();

const AppContent = () => {
  useExternalTracking();
  useGA4Tracking();
  useTikTokTracking();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("error=")) {
      try {
        const hashParams = new URLSearchParams(hash.substring(1));
        const error = hashParams.get("error");
        const errorCode = hashParams.get("error_code");
        const errorDescription = hashParams.get("error_description");

        if (errorCode || error) {
          const rawDescription = errorDescription || error || "Authentication failed";
          const message = decodeURIComponent(rawDescription.replace(/\+/g, " "));

          let friendlyTitle = "Authentication Error";
          let friendlyDescription = message;

          if (errorCode === "otp_expired") {
            friendlyTitle = "Sign-in Link Expired or Already Used";
            friendlyDescription = "Security scanners in your email app may have checked the link, or it has expired. Please request a new magic link.";
          }

          toast.error(friendlyTitle, {
            description: friendlyDescription,
            duration: 8000,
          });

          // Clean up the URL hash so it doesn't persist
          const url = new URL(window.location.href);
          url.hash = "";
          window.history.replaceState({}, document.title, url.toString());

          // Redirect to the login/auth page to let user request a new one
          if (location.pathname !== "/auth") {
            navigate("/auth", { replace: true });
          }
        }
      } catch (err) {
        console.error("Failed to parse auth error from URL hash:", err);
      }
    }
  }, [location, navigate]);

  // After email confirmation, Supabase redirects to the site root (the only reliably
  // whitelisted URL). We stored the intended destination in localStorage ('auth_return_to')
  // before sending the signup/magic-link email. Pick it up here and navigate.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const returnTo = localStorage.getItem('auth_return_to');
        if (returnTo) {
          localStorage.removeItem('auth_return_to');
          // Small delay so the current route finishes mounting before we navigate
          setTimeout(() => navigate(returnTo, { replace: true }), 50);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnalyticsProvider>
            <ScrollToTop />
            <AppContent />
            <BestSellersPopup />
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
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/blog" element={<AdminBlog />} />
            <Route path="/admin/faq" element={<AdminFAQ />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
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
            <Route path="/journals" element={<JournalLanding />} />
            <Route path="/tote-bags" element={<ToteBagLanding />} />
            <Route path="/mugs" element={<MugLanding />} />
            <Route path="/greeting-cards" element={<GreetingCardLanding />} />
            <Route path="/category/white-elephant-gifts" element={<WhiteElephantLanding />} />
            <Route path="/category/funny-coworker-gifts" element={<CoworkerGiftsLanding />} />
            <Route path="/ai-custom-clothing" element={<AiCustomClothing />} />
            <Route path="/category/:categorySlug" element={<CategoryLanding />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </AnalyticsProvider>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
