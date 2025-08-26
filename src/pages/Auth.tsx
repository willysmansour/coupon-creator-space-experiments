import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Auth = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [search] = useSearchParams();
  const navigate = useNavigate();

  const redirectTo = useMemo(() => search.get("redirect") || "/uploads", [search]);

  useEffect(() => {
    document.title = mode === "signin" ? "Logga in – Admin" : "Skapa konto – Admin";

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
      toast.success("Konto skapat. Kontrollera din e-post för bekräftelse.");
    } catch (e: any) {
      toast.error(e?.message || "Kunde inte skapa konto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <main className="w-full max-w-md">
        <Card className="p-6 space-y-6">
          <header className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground">
              {mode === "signin" ? "Logga in" : "Skapa konto"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Adminåtkomst krävs för att hantera uppladdningar.
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
            <Button className="w-full" onClick={mode === "signin" ? onSignIn : onSignUp} disabled={loading}>
              {loading ? "Arbetar..." : mode === "signin" ? "Logga in" : "Skapa konto"}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}> 
              {mode === "signin" ? "Har du inget konto? Skapa konto" : "Har du ett konto? Logga in"}
            </Button>
          </section>
          <aside className="text-xs text-muted-foreground">
            Genom att fortsätta godkänner du våra villkor. Om e-postbekräftelse är aktiverat måste du bekräfta din e-post.
          </aside>
        </Card>
      </main>
    </div>
  );
};

export default Auth;
