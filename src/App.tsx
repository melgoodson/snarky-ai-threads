import { useEffect, lazy, Suspense } from "react";
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
import { BestSellersPopup } from "./components/BestSellersPopup";
import { UtmRedirect } from "./components/UtmRedirect";

const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Collections = lazy(() => import("./pages/Collections"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const BlogPostDynamic = lazy(() => import("./pages/BlogPostDynamic"));
const FAQ = lazy(() => import("./pages/FAQ"));
const About = lazy(() => import("./pages/About"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Designs = lazy(() => import("./pages/Designs"));
const DesignDetail = lazy(() => import("./pages/DesignDetail"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrintifyAdmin = lazy(() => import("./pages/PrintifyAdmin"));
const CustomDesign = lazy(() => import("./pages/CustomDesign"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminBlog = lazy(() => import("./pages/AdminBlog"));
const AdminFAQ = lazy(() => import("./pages/AdminFAQ"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const TeeinblueAdmin = lazy(() => import("./pages/TeeinblueAdmin"));
const Auth = lazy(() => import("./pages/Auth"));
const ProductManagement = lazy(() => import("./pages/ProductManagement"));
const CreateProduct = lazy(() => import("./pages/CreateProduct"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const NewArrivals = lazy(() => import("./pages/NewArrivals"));
const Contact = lazy(() => import("./pages/Contact"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const ShippingInfo = lazy(() => import("./pages/ShippingInfo"));
const Returns = lazy(() => import("./pages/Returns"));
const ShirtLanding = lazy(() => import("./pages/ShirtLanding"));
const HoodieLanding = lazy(() => import("./pages/HoodieLanding"));
const JournalLanding = lazy(() => import("./pages/JournalLanding"));
const ToteBagLanding = lazy(() => import("./pages/ToteBagLanding"));
const MugLanding = lazy(() => import("./pages/MugLanding"));
const GreetingCardLanding = lazy(() => import("./pages/GreetingCardLanding"));
const DeskMatLanding = lazy(() => import("./pages/DeskMatLanding"));
const CategoryLanding = lazy(() => import("./pages/CategoryLanding"));
const WhiteElephantLanding = lazy(() => import("./pages/WhiteElephantLanding"));
const CoworkerGiftsLanding = lazy(() => import("./pages/CoworkerGiftsLanding"));
const AiCustomClothing = lazy(() => import("./pages/AiCustomClothing"));
const ThankYou = lazy(() => import("./pages/ThankYou"));


const queryClient = new QueryClient();

let signupRedirectProcessed = false;

const AppContent = () => {
  useExternalTracking();
  useGA4Tracking();
  useTikTokTracking();

  const location = useLocation();
  const navigate = useNavigate();

  // Robust check for signup verification hashes immediately on mount/render
  useEffect(() => {
    if (signupRedirectProcessed) return;

    const hash = window.location.hash || (window as any).__supabase_signup_hash || "";
    const search = window.location.search;

    if (hash.includes("type=signup") || hash.includes("type=invite") || search.includes("type=confirmed")) {
      signupRedirectProcessed = true;
      localStorage.removeItem('auth_return_to');

      // Clear query params and hashes to clean up the URL
      const url = new URL(window.location.href);
      url.hash = "";

      // Trigger GTM event for email verification/confirmation
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: "email_confirmed"
      });

      if (location.pathname !== "/thank-you") {
        url.searchParams.delete("type");
        window.history.replaceState({}, document.title, url.toString());
        navigate("/thank-you?type=confirmed", { replace: true });
      }
    }
  }, [location, navigate]);

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
        // If we've already handled the signup verification redirect, clear states and return
        if (signupRedirectProcessed) {
          localStorage.removeItem('auth_return_to');
          return;
        }

        const hash = window.location.hash || (window as any).__supabase_signup_hash || "";
        const search = window.location.search;

        // Fallback check in case the global useEffect hasn't run yet
        if (hash.includes("type=signup") || hash.includes("type=invite") || search.includes("type=confirmed")) {
          signupRedirectProcessed = true;
          localStorage.removeItem('auth_return_to');
          navigate("/thank-you?type=confirmed", { replace: true });
          return;
        }

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
          <Suspense fallback={null}>
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
            <Route path="/desk-mats" element={<DeskMatLanding />} />
            <Route path="/deskmats" element={<DeskMatLanding />} />
            <Route path="/category/white-elephant-gifts" element={<WhiteElephantLanding />} />
            <Route path="/category/funny-coworker-gifts" element={<CoworkerGiftsLanding />} />
            <Route path="/ai-custom-clothing" element={<AiCustomClothing />} />
            <Route path="/category/:categorySlug" element={<CategoryLanding />} />
            <Route path="/thank-you" element={<ThankYou />} />
            {/* Campaign Tracking Redirect Routes */}
            <Route path="/reddit-gifts" element={<UtmRedirect utmSource="reddit" utmContent="reddit_gifts" />} />
            <Route path="/reddit" element={<UtmRedirect utmSource="reddit" />} />
            <Route path="/substack-gifts" element={<UtmRedirect utmSource="substack" utmContent="substack_gifts" />} />
            <Route path="/substack" element={<UtmRedirect utmSource="substack" />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          </AnalyticsProvider>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
