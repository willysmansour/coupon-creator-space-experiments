import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Suspense, lazy } from "react";
import { LoadingPage } from "@/components/ui/loading";
import { RequireAuth } from "@/components/auth/RequireAuth";

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
const TestEmail = lazy(() => import("./pages/TestEmail"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Consistent with useSupabaseData.ts
      retry: (failureCount, error: any) => {
        // Always retry for mobile compatibility
        if (failureCount >= 3) return false;
        return true;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true, // Always refetch on mount
      refetchOnReconnect: true, // Refetch on reconnect
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
                <RequireAuth>
                  <Suspense fallback={<PageLoader />}>
                    <Index />
                  </Suspense>
                </RequireAuth>
              } />
              <Route path="/campaigns" element={
                <RequireAuth>
                  <Suspense fallback={<PageLoader />}>
                    <DiscountSettings />
                  </Suspense>
                </RequireAuth>
              } />
              <Route path="/uploads" element={
                <RequireAuth>
                  <Suspense fallback={<PageLoader />}>
                    <Uploads />
                  </Suspense>
                </RequireAuth>
              } />
              <Route path="/coupons" element={
                <RequireAuth>
                  <Suspense fallback={<PageLoader />}>
                    <Coupons />
                  </Suspense>
                </RequireAuth>
              } />
              <Route path="/analytics" element={
                <RequireAuth>
                  <Suspense fallback={<PageLoader />}>
                    <Analytics />
                  </Suspense>
                </RequireAuth>
              } />
              <Route path="/customers" element={
                <RequireAuth>
                  <Suspense fallback={<PageLoader />}>
                    <Customers />
                  </Suspense>
                </RequireAuth>
              } />
              <Route path="/settings" element={
                <RequireAuth>
                  <Suspense fallback={<PageLoader />}>
                    <Settings />
                  </Suspense>
                </RequireAuth>
              } />
              <Route path="/help" element={
                <RequireAuth>
                  <Suspense fallback={<PageLoader />}>
                    <Help />
                  </Suspense>
                </RequireAuth>
              } />
              <Route path="/logout" element={
                <RequireAuth>
                  <Suspense fallback={<PageLoader />}>
                    <Logout />
                  </Suspense>
                </RequireAuth>
              } />
              <Route path="/admin" element={
                <RequireAuth>
                  <Suspense fallback={<PageLoader />}>
                    <Admin />
                  </Suspense>
                </RequireAuth>
              } />
              <Route path="/test-email" element={
                <RequireAuth>
                  <Suspense fallback={<PageLoader />}>
                    <TestEmail />
                  </Suspense>
                </RequireAuth>
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
