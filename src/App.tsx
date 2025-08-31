import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Suspense, lazy } from "react";
import { LoadingPage } from "@/components/ui/loading";

// Lazy load heavy pages for better performance
const Index = lazy(() => import("./pages/Index"));
const DiscountSettings = lazy(() => import("./pages/DiscountSettings"));
const Uploads = lazy(() => import("./pages/Uploads"));
const Coupons = lazy(() => import("./pages/Coupons"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Customers = lazy(() => import("./pages/Customers"));
const Settings = lazy(() => import("./pages/Settings"));
const Help = lazy(() => import("./pages/Help"));
const Logout = lazy(() => import("./pages/Logout"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Upload = lazy(() => import("./pages/Upload"));
const CompanyWelcome = lazy(() => import("./pages/CompanyWelcome"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const Coupon = lazy(() => import("./pages/Coupon"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ✅ Fix: Consistent with useSupabaseData.ts
      retry: (failureCount, error: any) => {
        // Always retry for mobile compatibility
        if (failureCount >= 3) return false;
        return true;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true, // ✅ Fix: Always refetch on mount
      refetchOnReconnect: true, // ✅ Fix: Refetch on reconnect
    },
    mutations: {
      retry: false,
    },
  },
});

// Loading fallback component
const PageLoader = () => <LoadingPage message="Loading page..." />;

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={
                <Suspense fallback={<PageLoader />}>
                  <Index />
                </Suspense>
              } />
              <Route path="/campaigns" element={
                <Suspense fallback={<PageLoader />}>
                  <DiscountSettings />
                </Suspense>
              } />
              <Route path="/uploads" element={
                <Suspense fallback={<PageLoader />}>
                  <Uploads />
                </Suspense>
              } />
              <Route path="/coupons" element={
                <Suspense fallback={<PageLoader />}>
                  <Coupons />
                </Suspense>
              } />
              <Route path="/analytics" element={
                <Suspense fallback={<PageLoader />}>
                  <Analytics />
                </Suspense>
              } />
              <Route path="/customers" element={
                <Suspense fallback={<PageLoader />}>
                  <Customers />
                </Suspense>
              } />
              <Route path="/settings" element={
                <Suspense fallback={<PageLoader />}>
                  <Settings />
                </Suspense>
              } />
              <Route path="/help" element={
                <Suspense fallback={<PageLoader />}>
                  <Help />
                </Suspense>
              } />
              <Route path="/logout" element={
                <Suspense fallback={<PageLoader />}>
                  <Logout />
                </Suspense>
              } />
              <Route path="/admin" element={
                <Suspense fallback={<PageLoader />}>
                  <Admin />
                </Suspense>
              } />
              <Route path="/auth" element={
                <Suspense fallback={<PageLoader />}>
                  <Auth />
                </Suspense>
              } />
              <Route path="/company/:companyId" element={
                <Suspense fallback={<PageLoader />}>
                  <CompanyWelcome />
                </Suspense>
              } />
              <Route path="/company/:companyId/upload" element={
                <Suspense fallback={<PageLoader />}>
                  <Upload />
                </Suspense>
              } />
              <Route path="/thank-you/:uploadId" element={
                <Suspense fallback={<PageLoader />}>
                  <ThankYou />
                </Suspense>
              } />
              <Route path="/coupon/:couponId" element={
                <Suspense fallback={<PageLoader />}>
                  <Coupon />
                </Suspense>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={
                <Suspense fallback={<PageLoader />}>
                  <NotFound />
                </Suspense>
              } />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
