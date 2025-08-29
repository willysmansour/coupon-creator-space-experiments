import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useRegisterCompany } from "@/hooks/useAuth";

const Auth = () => {
  const [mode, setMode] = useState<"signin" | "company">("company");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const registerCompany = useRegisterCompany();

  const redirectTo = useMemo(() => search.get("redirect") || "/", [search]);

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    document.title = mode === "signin" ? "Sign in" : "Get started with your company";

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        // Try bootstrap admin for first user
        fetch(`https://${"mbpghmizndwixvuqrvmu"}.supabase.co/functions/v1/bootstrap-admin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: session.user.id }),
        }).catch(() => {});
        navigate(redirectTo, { replace: true });
      }
    });

    // Check for existing session but don't auto-redirect - just store user info
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, [mode, navigate, redirectTo]);

  const onSignIn = async () => {
    setLoading(true);
    try {
      // Ensure no stale session keeps you logged into a different account
      await supabase.auth.signOut();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Signed in successfully");
    } catch (e: any) {
      toast.error(e?.message || "Could not sign in");
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
      toast.success("Admin account created. Check your email for confirmation.");
    } catch (e: any) {
      toast.error(e?.message || "Could not create admin account");
    } finally {
      setLoading(false);
    }
  };

  const onCompanyRegister = async () => {
    setLoading(true);
    try {
      await registerCompany.mutateAsync({
        email,
        password,
        companyName
      });
    } catch (error: any) {
      // Error handling is now done in the hook
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <main className="w-full max-w-md">
        <Card className="p-6 space-y-6">
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
          <Tabs value={mode} onValueChange={(value) => setMode(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="company">Get started</TabsTrigger>
              <TabsTrigger value="signin">Sign in</TabsTrigger>
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
