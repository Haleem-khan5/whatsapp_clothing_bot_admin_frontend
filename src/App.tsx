import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Stores from "./pages/Stores";
import ImageJobs from "./pages/ImageJobs";
import VideoJobs from "./pages/VideoJobs";
import Transactions from "./pages/Transactions";
import Refunds from "./pages/Refunds";
import Downloads from "./pages/Downloads";
import CreditCatalog from "./pages/CreditCatalog";
import PaymentFor from "./pages/PaymentFor";
import PaymentMethod from "./pages/PaymentMethod";
import CatalogPrompts from "./pages/CatalogPrompts";
import CatalogPackages from "./pages/CatalogPackages";
import Phones from "./pages/Phones";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ErrorLogs from "./pages/ErrorLogs";
import BotMessages from "./pages/BotMessages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/stores" element={<Stores />} />
              <Route path="/image-jobs" element={<ImageJobs />} />
              <Route path="/video-jobs" element={<VideoJobs />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/refunds" element={<Refunds />} />
              <Route path="/downloads" element={<Downloads />} />
              <Route path="/error-logs" element={<ErrorLogs />} />
              <Route path="/bot-messages" element={<BotMessages />} />
              <Route path="/catalogs/credit" element={<CreditCatalog />} />
              <Route path="/catalogs/payment-for" element={<PaymentFor />} />
              <Route path="/catalogs/payment-method" element={<PaymentMethod />} />
              <Route path="/catalogs/prompts" element={<CatalogPrompts />} />
              <Route path="/catalogs/packages" element={<CatalogPackages />} />
              <Route path="/phones" element={<Phones />} />
              <Route path="/users" element={<Users />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
