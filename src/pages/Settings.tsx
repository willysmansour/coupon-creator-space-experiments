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
import { useCompanyAwareCompanies } from "@/hooks/useCompanyAwareData";
import { useCurrentProfile, useUpsertProfile, uploadProfileImage } from "@/hooks/useProfileData";
import { useUpdateCompany, uploadCompanyLogo } from "@/hooks/useCompanyData";
import { useState, useRef, useEffect } from "react";
import { QRCodeGenerator } from "@/components/QRCodeGenerator";
import { useMobile } from "@/hooks/use-mobile";

const Settings = () => {
  const { toast } = useToast();
  const { data: companies = [] } = useCompanyAwareCompanies();
  const { data: currentProfile } = useCurrentProfile();
  const upsertProfile = useUpsertProfile();
  const updateCompany = useUpdateCompany();
  const { isMobile } = useMobile();
  
  const company = companies[0]; // Get the user's company
  
  // Profile state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImagePreview, setProfileImagePreview] = useState<string | undefined>();
  
  // Company state
  const [companyName, setCompanyName] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | undefined>();
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  // Load existing data when component mounts or data changes
  useEffect(() => {
    if (currentProfile) {
      setFirstName(currentProfile.first_name || '');
      setLastName(currentProfile.last_name || '');
      setEmail(currentProfile.email || '');
      setProfileImagePreview(currentProfile.avatar_url);
    }
  }, [currentProfile]);

  useEffect(() => {
    if (company) {
      setCompanyName(company.name || '');
      setLogoPreview(company.logo);
    } else {
      // Default empty values for new users
      setCompanyName('');
      setLogoPreview(undefined);
    }
  }, [company]);

  const handleSave = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Validate company name
      if (companyName && companyName.trim().length < 2) {
        toast({
          title: "Invalid company name",
          description: "Company name must be at least 2 characters.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      let profileSaved = false;
      let companySaved = false;

      // Save profile data
      try {
        await upsertProfile.mutateAsync({
          id: currentProfile?.id,
          first_name: firstName,
          last_name: lastName,
          email: email,
          avatar_url: profileImagePreview,
        });
        profileSaved = true;
        // Profile saved successfully
      } catch (profileError) {
        console.error('Error saving profile:', profileError);
        toast({
          title: "Error saving profile",
          description: `Could not save profile information: ${profileError instanceof Error ? profileError.message : 'Unknown error'}`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Save company data if there are changes or create default company
      if (companyName && companyName.trim()) {
        try {
          const result = await updateCompany.mutateAsync({
            id: company?.id,
            name: companyName.trim(),
            logo: logoPreview,
          });
          companySaved = true;
          
          // If this is a new company, show success message
          if (!company?.id && result) {
            toast({
              title: "Company created",
              description: `Your company "${companyName.trim()}" was created successfully!`,
            });
          } else {
            toast({
              title: "Company updated",
              description: "Your company information was updated successfully.",
            });
          }
        } catch (companyError) {
          console.error('Error saving company:', companyError);
          toast({
            title: "Error saving company",
            description: `Could not save company information: ${companyError instanceof Error ? companyError.message : 'Unknown error'}`,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      // Force refresh of all related data after company save
      if (companySaved) {
        // Wait a moment for the database to update
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }

      // Success message
      const savedItems = [];
      if (profileSaved) savedItems.push('profile');
      if (companySaved) savedItems.push('company');
      
      toast({
        title: "Settings saved",
        description: `Your changes for ${savedItems.join(' and ')} were saved successfully.`,
      });
    } catch (error) {
      console.error('Unexpected error saving settings:', error);
      toast({
        title: "Unexpected error",
        description: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Logo must be at most 5MB.",
          variant: "destructive"
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file format",
          description: "Only image files are allowed.",
          variant: "destructive"
        });
        return;
      }

      try {
        setIsLoading(true);
        const logoUrl = await uploadCompanyLogo(file);
        setLogoPreview(logoUrl);
        
        toast({
          title: "Logo uploaded",
          description: "The logo has been uploaded. Remember to save to keep the changes.",
        });
      } catch (error) {
        console.error('Error uploading logo:', error);
        toast({
          title: "Upload error",
          description: "Failed to upload logo. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit for profile images
        toast({
          title: "File too large",
          description: "Profile image must be at most 2MB.",
          variant: "destructive"
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file format",
          description: "Only image files are allowed.",
          variant: "destructive"
        });
        return;
      }

      try {
        setIsLoading(true);
        const imageUrl = await uploadProfileImage(file);
        setProfileImagePreview(imageUrl);
        
        toast({
          title: "Profile image uploaded",
          description: "Profile image uploaded. Remember to save to keep the changes.",
        });
      } catch (error) {
        console.error('Error uploading profile image:', error);
        toast({
          title: "Upload error",
          description: "Failed to upload profile image. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
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
          
          <main className={`${isMobile ? 'p-3' : 'p-6'}`}>
            <div className={`${isMobile ? 'max-w-full' : 'max-w-4xl'} mx-auto space-y-6`}>
              <div>
                <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-foreground`}>Settings</h1>
                <p className="text-muted-foreground mt-2">
                  Manage your account settings and preferences
                </p>
              </div>

              <Tabs defaultValue="profile" className="space-y-4">
                <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3 gap-2' : 'grid-cols-6'}`}>
                  <TabsTrigger value="profile" className={`flex items-center gap-2 ${isMobile ? 'text-xs' : ''}`}>
                    <User className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    {!isMobile && 'Profile'}
                  </TabsTrigger>
                  <TabsTrigger value="company" className={`flex items-center gap-2 ${isMobile ? 'text-xs' : ''}`}>
                    <Building2 className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    {!isMobile && 'Company'}
                  </TabsTrigger>
                  <TabsTrigger value="security" className={`flex items-center gap-2 ${isMobile ? 'text-xs' : ''}`}>
                    <Shield className={`${isMobile ? 'h-3 w-3' : 'h-4 w-3'}`} />
                    {!isMobile && 'Security'}
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className={`flex items-center gap-2 ${isMobile ? 'text-xs' : ''}`}>
                    <Bell className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    {!isMobile && 'Notifications'}
                  </TabsTrigger>
                  <TabsTrigger value="api" className={`flex items-center gap-2 ${isMobile ? 'text-xs' : ''}`}>
                    <Key className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    {!isMobile && 'API'}
                  </TabsTrigger>
                  <TabsTrigger value="appearance" className={`flex items-center gap-2 ${isMobile ? 'text-xs' : ''}`}>
                    <Palette className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    {!isMobile && 'Appearance'}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile information</CardTitle>
                      <CardDescription>
                        Update your profile and account information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={profileImagePreview || "/placeholder.svg"} />
                          <AvatarFallback>
                            {firstName && lastName 
                              ? `${firstName[0]}${lastName[0]}`.toUpperCase()
                              : '?'
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                          <input
                            ref={profileImageInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageUpload}
                            className="hidden"
                            id="profile-upload"
                          />
                          <Button 
                            variant="outline"
                            onClick={() => profileImageInputRef.current?.click()}
                            disabled={isLoading}
                          >
                            {isLoading ? 'Uploading...' : 'Change profile picture'}
                          </Button>
                          <p className="text-xs text-muted-foreground">JPG or PNG, max 2MB</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First name</Label>
                          <Input 
                            id="firstName" 
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Your first name" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last name</Label>
                          <Input 
                            id="lastName" 
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Your last name" 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@example.com" 
                        />
                      </div>
                      
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="company" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Company information</CardTitle>
                      <CardDescription>
                        Manage the company logo and information shown on the QR landing page
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company name</Label>
                        <Input 
                          id="companyName" 
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Your company name"
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <Label>Company logo</Label>
                        <p className="text-sm text-muted-foreground">
                          This logo is shown first when users scan the QR code. Recommended size: 200x200px or larger.
                        </p>
                        
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <div className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/30">
                              {logoPreview ? (
                                <div className="relative w-full h-full">
                                  <img
                                    src={logoPreview}
                                    alt="Company logo preview"
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
                                  <p className="text-xs text-muted-foreground">No logo</p>
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
                              disabled={isLoading}
                              className="flex items-center gap-2"
                            >
                              <Upload className="h-4 w-4" />
                              {isLoading ? 'Uploading...' : (logoPreview ? 'Change logo' : 'Upload logo')}
                            </Button>
                            <p className="text-xs text-muted-foreground">
                              JPG, PNG or GIF. Max 5MB.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <QRCodeGenerator />
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Security settings</CardTitle>
                      <CardDescription>
                        Manage your password and security settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current password</Label>
                        <Input id="currentPassword" type="password" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New password</Label>
                        <Input id="newPassword" type="password" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm new password</Label>
                        <Input id="confirmPassword" type="password" />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Two-factor authentication</Label>
                          <p className="text-sm text-muted-foreground">
                            Add extra security to your account
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
                      <CardTitle>Notification settings</CardTitle>
                      <CardDescription>
                        Choose which notifications you want
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Email notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive updates via email
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">New uploads</Label>
                          <p className="text-sm text-muted-foreground">
                            Notify when new files are uploaded
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Campaign updates</Label>
                          <p className="text-sm text-muted-foreground">
                            Get notified about campaign status
                          </p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">System messages</Label>
                          <p className="text-sm text-muted-foreground">
                            Important system updates
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
                      <CardTitle>API keys</CardTitle>
                      <CardDescription>
                        Manage your API keys for integrations
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>API key</Label>
                        <div className="flex gap-2">
                          <Input placeholder="No API key generated" readOnly />
                          <Button variant="outline" disabled>Copy</Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Generate an API key to integrate with external systems.
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline">Generate new key</Button>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <Label className="text-base">Webhook URL</Label>
                        <Input placeholder="https://yourdomain.com/webhook" />
                        <p className="text-sm text-muted-foreground">
                          URL to receive webhook messages
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Appearance</CardTitle>
                      <CardDescription>
                        Customize how the application looks
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-base">Theme</Label>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Light</Button>
                          <Button variant="outline" size="sm">Dark</Button>
                          <Button variant="default" size="sm">System</Button>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Compact view</Label>
                          <p className="text-sm text-muted-foreground">
                            Show more information in less space
                          </p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Animations</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable smooth transitions
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end">
                <Button 
                  onClick={handleSave} 
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? 'Saving...' : 'Save changes'}
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