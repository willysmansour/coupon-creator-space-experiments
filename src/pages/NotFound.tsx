import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <span className="text-4xl font-bold text-muted-foreground">404</span>
          </div>
          <CardTitle className="text-2xl">Sidan hittades inte</CardTitle>
          <CardDescription>
            Sidan du letar efter finns inte eller har flyttats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              URL: <code className="bg-muted px-1 rounded">{location.pathname}</code>
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link to="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Tillbaka till startsidan
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.history.back()} 
              className="w-full flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Gå tillbaka
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
