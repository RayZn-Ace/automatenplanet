import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { I18nProvider } from "@/lib/i18n";
import ScrollToTop from "@/components/layout/ScrollToTop";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import Standorte from "./pages/Standorte";
import CityLanding from "./pages/CityLanding";
import ProductPage from "./pages/ProductPage";
import NotFound from "./pages/NotFound";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import Handbuch from "./pages/Handbuch";
import HandbuchBoxautomat from "./pages/HandbuchBoxautomat";
import HandbuchBoxautomatDownload from "./pages/HandbuchBoxautomatDownload";
import BoxautomatLanding from "./pages/BoxautomatLanding";
import Checkout from "./pages/Checkout";
import OrderStatus from "./pages/OrderStatus";
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLive from "./pages/admin/AdminLive";
import AdminJourneys from "./pages/admin/AdminJourneys";
import AdminRevenue from "./pages/admin/AdminRevenue";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminMail from "./pages/admin/AdminMail";

import WhatsAppButton from "./components/WhatsAppButton";
import TrackingScripts from "./components/TrackingScripts";
import AnalyticsTracker from "./components/AnalyticsTracker";
import CookieBanner from "./components/CookieBanner";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" />
        <BrowserRouter>
          <ScrollToTop />
          <TrackingScripts />
          <AnalyticsTracker />
          <WhatsAppButton />
          <CookieBanner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="live" element={<AdminLive />} />
              <Route path="journeys" element={<AdminJourneys />} />
              <Route path="umsatz" element={<AdminRevenue />} />
              <Route path="bestellungen" element={<AdminOrders />} />
              <Route path="produkte" element={<AdminProducts />} />
            </Route>
            <Route path="/metriken" element={<Navigate to="/admin" replace />} />
            <Route path="/bestellungen" element={<Navigate to="/admin/bestellungen" replace />} />

            <Route path="/kasse" element={<Checkout />} />
            <Route path="/bestellung" element={<OrderStatus />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogArticle />} />
            <Route path="/standorte" element={<Standorte />} />
            <Route path="/standorte/:slug" element={<CityLanding />} />
            {/* Boxautomat: dedicated landing page replaces the legacy product page */}
            <Route path="/produkte/boxautomat-premium" element={<BoxautomatLanding />} />
            <Route
              path="/produkte/boxautomat-mit-geldscheinakzeptor"
              element={<Navigate to="/produkte/boxautomat-premium" replace />}
            />
            <Route
              path="/produkte/boxautomat-ohne-geldscheinakzeptor"
              element={<Navigate to="/produkte/boxautomat-premium" replace />}
            />
            <Route
              path="/produkte/combo-boxautomat"
              element={<Navigate to="/produkte/boxautomat-premium" replace />}
            />
            <Route path="/boxautomat" element={<Navigate to="/produkte/boxautomat-premium" replace />} />
            <Route path="/produkte/:slug" element={<ProductPage />} />
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/datenschutz" element={<Datenschutz />} />
            <Route path="/handbuch" element={<Handbuch />} />
            <Route path="/handbuch/boxautomat" element={<HandbuchBoxautomat />} />
            <Route
              path="/downloads/handbuch-boxautomat"
              element={<HandbuchBoxautomatDownload />}
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </I18nProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
