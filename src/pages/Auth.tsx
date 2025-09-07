import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { notify, notifyFromError } from "@/lib/notify";
import { useRegisterCompany } from "@/domains/companies";
import QRCode from 'react-qr-code';
import { useMobile } from "@/hooks/use-mobile";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { loginSchema, companyRegistrationSchema, type LoginFormData, type CompanyRegistrationFormData } from "@/lib/validations";

const Auth = () => {
  const [mode, setMode] = useState<"signin" | "company">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<{ companyId: string; companyName: string; qrUrl: string } | null>(null);
  
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const registerCompany = useRegisterCompany();
  const queryClient = useQueryClient();
  const { isMobile } = useMobile();

  const redirectTo = useMemo(() => search.get("redirect") || "/", [search]);

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    document.title = mode === "signin" ? "Sign in" : "Get started with your company";

    const prefetchCoreData = async (session: any) => {
      try {
        // Prefetch user role
        const { data: roleData, error: roleErr } = await supabase
          .from('user_roles')
          .select(`role, company_id, companies!left(name)`) 
          .eq('user_id', session.user.id)
          .order('role', { ascending: true })
          .limit(1)
          .maybeSingle();

        const userWithRole = {
          id: session.user.id,
          email: session.user.email,
          role: roleData?.role || 'company_admin',
          company_id: roleData?.company_id,
          company_name: roleData?.companies?.name,
        };
        queryClient.setQueryData(['user-role'], userWithRole);

        // Prefetch companies (company-aware key)
        if (userWithRole.role === 'company_admin' && userWithRole.company_id) {
          const { data: company, error: compErr } = await supabase
            .from('companies')
            .select('*')
            .eq('id', userWithRole.company_id)
            .single();
          if (!compErr && company) {
            queryClient.setQueryData(['companies', userWithRole.role, userWithRole.company_id], [company]);
          }
        } else {
          const { data: companies, error: compsErr } = await supabase
            .from('companies')
            .select('*')
            .order('created_at', { ascending: false });
          if (!compsErr && companies) {
            queryClient.setQueryData(['companies', userWithRole.role, userWithRole.company_id], companies);
          }
        }
      } catch { /* ignore prefetch errors */ }
    };

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        // Bootstrap admin using Supabase Functions client bound to current env
        supabase.functions
          .invoke('bootstrap-admin', {
            body: { userId: session.user.id },
            headers: { 'x-app-origin': window.location.origin },
          })
          .catch(() => { /* ignore bootstrap errors */ });

        // Prefetch core queries to avoid dashboard spinners
        prefetchCoreData(session);

        // Don't auto-navigate if we're showing QR code
        if (!showQRCode) {
          navigate(redirectTo, { replace: true });
        }
      }
    });

    // Check for existing session but don't auto-redirect - just store user info
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, [mode, navigate, redirectTo, showQRCode]);

  const onSignIn = async () => {
    setLoading(true);
    try {
      // Validate input data
      const validatedData = loginSchema.parse({ email, password });
      
      // Ensure no stale session keeps you logged into a different account
      await supabase.auth.signOut();
      const { error } = await supabase.auth.signInWithPassword(validatedData);
      if (error) throw error;
      notify.success("Signed in successfully");
    } catch (e: unknown) {
      if (e instanceof z.ZodError) {
        notify.error(e.errors[0].message);
      } else {
        const errorMessage = e instanceof Error ? e.message : "Could not sign in";
        notify.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const onSignUp = async () => {
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      // Also sign out any existing session before creating a new account
      await supabase.auth.signOut();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl },
      });
      if (error) throw error;
      notify.success("Admin account created. Check your email for confirmation.");
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Could not create admin account";
      notify.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onCompanyRegister = async () => {
    setLoading(true);
    try {
      // Validate input data
      const validatedData = companyRegistrationSchema.parse({
        email,
        password,
        companyName,
        firstName: firstName || undefined,
        lastName: lastName || undefined
      });
      
      const result = await registerCompany.mutateAsync(validatedData);
      
      // Show QR code after successful registration
      if (result.company && result.qrCodeUrl) {
        setQrCodeData({
          companyId: result.company.id,
          companyName: result.company.name,
          qrUrl: result.qrCodeUrl
        });
        setShowQRCode(true);
      }
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        notify.error(error.errors[0].message);
      } else {
        const errorMessage = error instanceof Error ? error.message : "Could not register company";
        notify.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToDashboard = () => {
    setShowQRCode(false);
    navigate("/");
  };

  if (showQRCode && qrCodeData) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-background ${isMobile ? 'p-3' : 'p-6'}`}>
        <main className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-md'}`}>
          <Card className={`${isMobile ? 'p-4' : 'p-6'} space-y-6`}>
            <div className="text-center space-y-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-foreground">Company Created Successfully!</h1>
              <p className="text-sm text-muted-foreground">
                Your company "{qrCodeData.companyName}" has been created and your QR code is ready!
              </p>
            </div>

                          <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-medium text-foreground mb-3">Your QR Code</h3>
                  <div className={`${isMobile ? 'p-3' : 'p-4'} bg-card rounded-lg border-2 border-border inline-block`}>
                    <QRCode
                      value={qrCodeData.qrUrl}
                      size={isMobile ? 150 : 200}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      viewBox="0 0 256 256"
                      bgColor="white"
                      fgColor="#111827"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{qrCodeData.companyName}</p>
                </div>

              <div className="space-y-3">
                <div className="p-4 bg-accent/50 rounded-lg border border-accent">
                  <h4 className="font-medium text-accent-foreground mb-2">What's next?</h4>
                  <ul className="text-sm text-accent-foreground space-y-1">
                    <li>• Your QR code is automatically generated</li>
                    <li>• Customers can scan it to upload images</li>
                    <li>• Access your dashboard to manage everything</li>
                  </ul>
                </div>

                <Button onClick={handleContinueToDashboard} className="w-full">
                  Continue to Dashboard
                </Button>
              </div>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-background ${isMobile ? 'p-3' : 'p-6'}`}>
      <main className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-md'}`}>
        <Card className={`${isMobile ? 'p-4' : 'p-6'} space-y-6`}>
          {currentUser && (
            <div className="bg-muted/50 p-4 rounded-lg border space-y-3">
              <div className="text-sm">
                <p className="font-medium text-foreground">You are already signed in as:</p>
                <p className="text-muted-foreground">{currentUser.email}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => navigate(redirectTo)}>
                  Go to Dashboard
                </Button>
                <Button size="sm" variant="outline" onClick={() => supabase.auth.signOut()}>
                  Sign out
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                You can continue using the service or sign out to switch accounts.
              </p>
            </div>
          )}
          <Tabs value={mode} onValueChange={(value) => setMode(value as "signin" | "company")} className="w-full">
            <TabsList className={`grid w-full grid-cols-2 ${isMobile ? 'h-10' : 'h-10'}`}>
              <TabsTrigger value="signin" className={isMobile ? 'text-sm' : ''}>Sign in</TabsTrigger>
              <TabsTrigger value="company" className={isMobile ? 'text-sm' : ''}>Get started</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <header className="space-y-1">
                <h1 className="text-2xl font-semibold text-foreground">Sign in</h1>
                <p className="text-sm text-muted-foreground">
                  Sign in with your account to access the dashboard.
                </p>
              </header>
              <section className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button className="w-full" onClick={onSignIn} disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </section>
            </TabsContent>

            <TabsContent value="company" className="space-y-4">
              <header className="space-y-1">
                <h1 className="text-2xl font-semibold text-foreground">Get started with your company</h1>
                <p className="text-sm text-muted-foreground">
                  Create your company account and get access to all our services immediately.
                </p>
              </header>
              

              <section className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company name</Label>
                  <Input id="company-name" type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First name</Label>
                    <Input 
                      id="first-name" 
                      type="text" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last name</Label>
                    <Input 
                      id="last-name" 
                      type="text" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Your last name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email">Email</Label>
                  <Input 
                    id="company-email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="din@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-password">Password</Label>
                  <Input id="company-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button className="w-full" onClick={onCompanyRegister} disabled={loading || !companyName.trim() || !email.trim()}>
                  {loading ? "Creating account..." : "Create account"}
                </Button>
              </section>
            </TabsContent>
          </Tabs>
          
          <aside className="text-xs text-muted-foreground">
            By continuing you agree to our terms. Check your email after registration for confirmation.
          </aside>
        </Card>
      </main>
    </div>
  );
};

export default Auth;
