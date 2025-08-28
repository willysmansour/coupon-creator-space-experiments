import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import Index from "./pages/Index";
import DiscountSettings from "./pages/DiscountSettings";
import Uploads from "./pages/Uploads";
import Coupons from "./pages/Coupons";
import Analytics from "./pages/Analytics";
import Customers from "./pages/Customers";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Logout from "./pages/Logout";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Upload from "./pages/Upload";
import CompanyWelcome from "./pages/CompanyWelcome";
import ThankYou from "./pages/ThankYou";
import Coupon from "./pages/Coupon";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import { RequireAuth } from "./components/auth/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RequireAuth><Index /></RequireAuth>} />
            <Route path="/campaigns" element={<RequireAuth><DiscountSettings /></RequireAuth>} />
            <Route path="/uploads" element={<RequireAuth><Uploads /></RequireAuth>} />
            <Route path="/coupons" element={<RequireAuth><Coupons /></RequireAuth>} />
            <Route path="/analytics" element={<RequireAuth><Analytics /></RequireAuth>} />
            <Route path="/customers" element={<RequireAuth><Customers /></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
            <Route path="/help" element={<RequireAuth><Help /></RequireAuth>} />
            <Route path="/logout" element={<RequireAuth><Logout /></RequireAuth>} />
            <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/company/:companyId" element={<CompanyWelcome />} />
            <Route path="/company/:companyId/upload" element={<Upload />} />
            <Route path="/thank-you/:uploadId" element={<ThankYou />} />
            <Route path="/coupon/:couponId" element={<Coupon />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
