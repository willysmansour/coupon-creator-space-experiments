import { ModernSidebar } from "@/components/ModernSidebar";
import { ModernHeader } from "@/components/ModernHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Shield, Bell, Key, Palette, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Inställningar sparade",
      description: "Dina ändringar har sparats framgångsrikt.",
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ModernSidebar />
        
        <div className="flex-1">
          <ModernHeader />
          
          <main className="p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Inställningar</h1>
                <p className="text-muted-foreground mt-2">
                  Hantera dina kontoinställningar och preferenser
                </p>
              </div>

              <Tabs defaultValue="profile" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profil
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Säkerhet
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifikationer
                  </TabsTrigger>
                  <TabsTrigger value="api" className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    API
                  </TabsTrigger>
                  <TabsTrigger value="appearance" className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Utseende
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profilinformation</CardTitle>
                      <CardDescription>
                        Uppdatera din profil och kontoinformation
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback>AB</AvatarFallback>
                        </Avatar>
                        <Button variant="outline">Ändra profilbild</Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Förnamn</Label>
                          <Input id="firstName" defaultValue="Anna" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Efternamn</Label>
                          <Input id="lastName" defaultValue="Bergström" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">E-post</Label>
                        <Input id="email" type="email" defaultValue="anna.bergstrom@donezo.se" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="company">Företag</Label>
                        <Input id="company" defaultValue="Donezo AB" />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Säkerhetsinställningar</CardTitle>
                      <CardDescription>
                        Hantera ditt lösenord och säkerhetsinställningar
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Nuvarande lösenord</Label>
                        <Input id="currentPassword" type="password" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Nytt lösenord</Label>
                        <Input id="newPassword" type="password" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Bekräfta nytt lösenord</Label>
                        <Input id="confirmPassword" type="password" />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Tvåfaktorsautentisering</Label>
                          <p className="text-sm text-muted-foreground">
                            Lägg till extra säkerhet till ditt konto
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notifikationsinställningar</CardTitle>
                      <CardDescription>
                        Välj vilka notifikationer du vill få
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">E-postnotifikationer</Label>
                          <p className="text-sm text-muted-foreground">
                            Få uppdateringar via e-post
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Nya uppladdningar</Label>
                          <p className="text-sm text-muted-foreground">
                            Notifiering när nya filer laddas upp
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Kampanjuppdateringar</Label>
                          <p className="text-sm text-muted-foreground">
                            Få meddelanden om kampanjstatus
                          </p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Systemmeddelanden</Label>
                          <p className="text-sm text-muted-foreground">
                            Viktiga systemuppdateringar
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="api" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>API-nycklar</CardTitle>
                      <CardDescription>
                        Hantera dina API-nycklar för integrationer
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nuvarande API-nyckel</Label>
                        <div className="flex gap-2">
                          <Input value="sk_live_****************************" readOnly />
                          <Button variant="outline">Kopiera</Button>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline">Generera ny nyckel</Button>
                        <Button variant="destructive">Återkalla nyckel</Button>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <Label className="text-base">Webhook URL</Label>
                        <Input placeholder="https://yourdomain.com/webhook" />
                        <p className="text-sm text-muted-foreground">
                          URL för att ta emot webhook-meddelanden
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Utseende</CardTitle>
                      <CardDescription>
                        Anpassa hur applikationen ser ut
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-base">Tema</Label>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Ljust</Button>
                          <Button variant="outline" size="sm">Mörkt</Button>
                          <Button variant="default" size="sm">System</Button>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Kompakt vy</Label>
                          <p className="text-sm text-muted-foreground">
                            Visa mer information på mindre utrymme
                          </p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Animationer</Label>
                          <p className="text-sm text-muted-foreground">
                            Aktivera smidiga övergångar
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end">
                <Button onClick={handleSave} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Spara ändringar
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Settings;