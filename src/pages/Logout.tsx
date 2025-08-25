import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Logout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    // Här skulle du normalt rensa session data, tokens, etc.
    localStorage.clear();
    sessionStorage.clear();
    
    toast({
      title: "Utloggad",
      description: "Du har loggats ut från ditt konto.",
    });
    
    // Simulera redirect till login-sida
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  const handleCancel = () => {
    navigate(-1); // Gå tillbaka till föregående sida
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <LogOut className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Logga ut</CardTitle>
          <CardDescription>
            Är du säker på att du vill logga ut från ditt konto?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              Du kommer att behöva logga in igen för att komma åt din dashboard och dina kampanjer.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleLogout} 
              variant="destructive" 
              className="w-full flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Ja, logga ut
            </Button>
            
            <Button 
              onClick={handleCancel} 
              variant="outline" 
              className="w-full flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Avbryt
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Om du loggar ut kommer du att förlora eventuellt osparade ändringar.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Logout;