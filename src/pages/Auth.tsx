import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useRegisterCompany } from "@/hooks/useAuth";

const Auth = () => {
  const [mode, setMode] = useState<"signin" | "signup" | "company">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const registerCompany = useRegisterCompany();

  const redirectTo = useMemo(() => search.get("redirect") || "/", [search]);

  useEffect(() => {
    document.title = mode === "signin" ? "Logga in" : mode === "signup" ? "Skapa Admin" : "Registrera Företag";

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

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate(redirectTo, { replace: true });
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [mode, navigate, redirectTo]);

  const onSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Inloggning lyckades");
    } catch (e: any) {
      toast.error(e?.message || "Kunde inte logga in");
    } finally {
      setLoading(false);
    }
  };

  const onSignUp = async () => {
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl },
      });
      if (error) throw error;
      toast.success("Admin konto skapat. Kontrollera din e-post för bekräftelse.");
    } catch (e: any) {
      toast.error(e?.message || "Kunde inte skapa admin konto");
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <main className="w-full max-w-md">
        <Card className="p-6 space-y-6">
          <Tabs value={mode} onValueChange={(value) => setMode(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="signin">Logga in</TabsTrigger>
              <TabsTrigger value="signup">Admin</TabsTrigger>
              <TabsTrigger value="company">Företag</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <header className="space-y-1">
                <h1 className="text-2xl font-semibold text-foreground">Logga in</h1>
                <p className="text-sm text-muted-foreground">
                  Logga in med ditt konto för att komma åt dashboard.
                </p>
              </header>
              <section className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-post</Label>
                  <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Lösenord</Label>
                  <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button className="w-full" onClick={onSignIn} disabled={loading}>
                  {loading ? "Loggar in..." : "Logga in"}
                </Button>
              </section>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <header className="space-y-1">
                <h1 className="text-2xl font-semibold text-foreground">Skapa Admin</h1>
                <p className="text-sm text-muted-foreground">
                  Skapa ett nytt administratörskonto för att hantera systemet.
                </p>
              </header>
              <section className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">E-post</Label>
                  <Input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Lösenord</Label>
                  <Input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button className="w-full" onClick={onSignUp} disabled={loading}>
                  {loading ? "Skapar konto..." : "Skapa Admin Konto"}
                </Button>
              </section>
            </TabsContent>

            <TabsContent value="company" className="space-y-4">
              <header className="space-y-1">
                <h1 className="text-2xl font-semibold text-foreground">Registrera Företag</h1>
                <p className="text-sm text-muted-foreground">
                  Skapa ett nytt företagskonto med egen dashboard.
                </p>
              </header>
              <section className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Företagsnamn</Label>
                  <Input id="company-name" type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email">E-post</Label>
                  <Input id="company-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-password">Lösenord</Label>
                  <Input id="company-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button className="w-full" onClick={onCompanyRegister} disabled={loading || !companyName.trim()}>
                  {loading ? "Registrerar företag..." : "Registrera Företag"}
                </Button>
              </section>
            </TabsContent>
          </Tabs>
          
          <aside className="text-xs text-muted-foreground">
            Genom att fortsätta godkänner du våra villkor. Kontrollera din e-post efter registrering för bekräftelse.
          </aside>
        </Card>
      </main>
    </div>
  );
};

export default Auth;
