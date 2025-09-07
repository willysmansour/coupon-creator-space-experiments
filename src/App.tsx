import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/lib/query-config";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Suspense, lazy } from "react";
import { useAuth } from "@/domains/auth";
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
const TestEmail = lazy(() => import("./pages/TestEmail"));

const queryClient = createQueryClient();

// Loading fallback component
const PageLoader = () => <LoadingPage message="Loading page..." />;

// Global auth gate to avoid app-wide flash on initial auth resolving
const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const { loading } = useAuth();
  if (loading) return <PageLoader />;
  return <>{children}</>;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={
                <Suspense fallback={<PageLoader />}>
                  <AuthGate>
                    <Index />
                  </AuthGate>
                </Suspense>
              } />
              <Route path="/campaigns" element={
                <Suspense fallback={<PageLoader />}>
                  <AuthGate>
                    <DiscountSettings />
                  </AuthGate>
                </Suspense>
              } />
              <Route path="/uploads" element={
                <Suspense fallback={<PageLoader />}>
                  <AuthGate>
                    <Uploads />
                  </AuthGate>
                </Suspense>
              } />
              <Route path="/coupons" element={
                <Suspense fallback={<PageLoader />}>
                  <AuthGate>
                    <Coupons />
                  </AuthGate>
                </Suspense>
              } />
              <Route path="/analytics" element={
                <Suspense fallback={<PageLoader />}>
                  <AuthGate>
                    <Analytics />
                  </AuthGate>
                </Suspense>
              } />
              <Route path="/customers" element={
                <Suspense fallback={<PageLoader />}>
                  <AuthGate>
                    <Customers />
                  </AuthGate>
                </Suspense>
              } />
              <Route path="/settings" element={
                <Suspense fallback={<PageLoader />}>
                  <AuthGate>
                    <Settings />
                  </AuthGate>
                </Suspense>
              } />
              <Route path="/help" element={
                <Suspense fallback={<PageLoader />}>
                  <AuthGate>
                    <Help />
                  </AuthGate>
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
              <Route path="/test-email" element={
                <Suspense fallback={<PageLoader />}>
                  <TestEmail />
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
