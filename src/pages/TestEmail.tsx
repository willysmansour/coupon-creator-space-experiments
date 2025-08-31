import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const TestEmail = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testEmail = async () => {
    if (!email.trim()) {
      toast.error('Ange en e-postadress');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-email', {
        body: { testEmail: email.trim() }
      });

      if (error) {
        console.error('Test email error:', error);
        toast.error(`E-post-test misslyckades: ${error.message}`);
      } else if (data?.success) {
        toast.success('Test-e-post skickad! Kolla din inkorg.');
        console.log('Test email result:', data);
      } else {
        toast.error('E-post-test misslyckades');
        console.log('Test email result:', data);
      }
    } catch (err) {
      console.error('Test email exception:', err);
      toast.error('E-post-test misslyckades');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Testa E-postfunktionen</CardTitle>
            <CardDescription>
              Testa om e-postmeddelanden skickas korrekt när inlägg godkänns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-postadress</Label>
              <Input
                id="email"
                type="email"
                placeholder="din@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={testEmail} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Skickar...' : 'Skicka Test-e-post'}
            </Button>

            <div className="text-sm text-muted-foreground">
              <p>Denna test skickar en enkel e-post för att verifiera att systemet fungerar.</p>
              <p className="mt-2">
                <strong>För att lösa problemet med e-post vid godkännande:</strong>
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Kontrollera att inlägget har kundnamn och e-post</li>
                <li>Verifiera att Edge Function är deployad</li>
                <li>Kontrollera Resend API-nyckel</li>
                <li>Se till att inlägget är markerat som "approved"</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestEmail;
