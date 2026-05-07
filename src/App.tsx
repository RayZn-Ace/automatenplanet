import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { I18nProvider } from "@/lib/i18n";
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
import WhatsAppButton from "./components/WhatsAppButton";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
        <BrowserRouter>
          <WhatsAppButton />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogArticle />} />
            <Route path="/standorte" element={<Standorte />} />
            <Route path="/standorte/:slug" element={<CityLanding />} />
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
