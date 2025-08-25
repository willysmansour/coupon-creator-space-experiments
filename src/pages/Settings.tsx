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
import { User, Shield, Bell, Key, Palette, Save, Building2, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";
import { useState, useRef } from "react";
import { QRCodeGenerator } from "@/components/QRCodeGenerator";

const Settings = () => {
  const { toast } = useToast();
  const { company, updateCompany } = useApp();
  const [companyName, setCompanyName] = useState(company.name);
  const [logoPreview, setLogoPreview] = useState<string | undefined>(company.logoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    updateCompany({ name: companyName, logoUrl: logoPreview });
    toast({
      title: "Inställningar sparade",
      description: "Dina ändringar har sparats framgångsrikt.",
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Fil för stor",
          description: "Logotypen får vara max 5MB.",
          variant: "destructive"
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Felaktigt filformat",
          description: "Endast bildfiler är tillåtna.",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profil
                  </TabsTrigger>
                  <TabsTrigger value="company" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Företag
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

                <TabsContent value="company" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Företagsinformation</CardTitle>
                      <CardDescription>
                        Hantera företagets logotyp och information som visas på QR-kod landningssidan
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Företagsnamn</Label>
                        <Input 
                          id="companyName" 
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Ditt företagsnamn"
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <Label>Företagslogotyp</Label>
                        <p className="text-sm text-muted-foreground">
                          Denna logotyp kommer att visas först när användare skannar QR-koden. Rekommenderad storlek: 200x200px eller större.
                        </p>
                        
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <div className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/30">
                              {logoPreview ? (
                                <div className="relative w-full h-full">
                                  <img
                                    src={logoPreview}
                                    alt="Företagslogotyp förhandsvisning"
                                    className="w-full h-full object-contain rounded-lg"
                                  />
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                                    onClick={removeLogo}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                  <p className="text-xs text-muted-foreground">Ingen logotyp</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                            <Button
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              className="flex items-center gap-2"
                            >
                              <Upload className="h-4 w-4" />
                              {logoPreview ? 'Ändra logotyp' : 'Ladda upp logotyp'}
                            </Button>
                            <p className="text-xs text-muted-foreground">
                              JPG, PNG eller GIF. Max 5MB.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <QRCodeGenerator companyId={company.id} />
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