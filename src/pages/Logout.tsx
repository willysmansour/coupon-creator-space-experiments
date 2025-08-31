import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const Logout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      // Properly sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        toast({
          title: "Logout error",
          description: "Failed to sign out properly. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Clear React Query cache
      queryClient.clear();
      
      // Clear local storage
      localStorage.clear();
      sessionStorage.clear();
      
      toast({
        title: "Signed out",
        description: "You have been signed out of your account.",
      });
      
      // Redirect to home page
      navigate("/");
    } catch (error) {
      console.error('Unexpected logout error:', error);
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred during logout.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <LogOut className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Sign out</CardTitle>
          <CardDescription>
            Are you sure you want to sign out of your account?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              You will need to sign in again to access your dashboard and campaigns.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleLogout} 
              variant="destructive" 
              className="w-full flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Yes, sign out
            </Button>
            
            <Button 
              onClick={handleCancel} 
              variant="outline" 
              className="w-full flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancel
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              If you sign out you may lose any unsaved changes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Logout;