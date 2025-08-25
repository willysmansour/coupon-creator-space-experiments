import { ModernSidebar } from "@/components/ModernSidebar";
import { ModernHeader } from "@/components/ModernHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MessageCircle, Mail, Phone, FileText, Video } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Meddelande skickat",
      description: "Vi återkommer till dig inom 24 timmar.",
    });
  };

  const faqItems = [
    {
      question: "Hur laddar jag upp bilder till systemet?",
      answer: "Du kan ladda upp bilder genom att gå till 'Uppladdningar' i menyn och dra och släppa dina filer eller klicka på 'Välj filer'. Systemet stöder JPG, PNG, GIF och MP4-format."
    },
    {
      question: "Vilka filformat stöds?",
      answer: "Vi stöder följande format: JPEG (.jpg, .jpeg), PNG (.png), GIF (.gif), och MP4 (.mp4) för videor. Maximal filstorlek är 50MB per fil."
    },
    {
      question: "Hur skapar jag en ny kampanj?",
      answer: "Klicka på 'Skapa kampanj' i headern eller gå till 'Kampanjer'-sidan. Fyll i kampanjdetaljer som titel, rabatt, och giltighetstid. Din kampanj kommer att generera QR-koder automatiskt."
    },
    {
      question: "Kan jag se vem som har laddat ner mina bilder?",
      answer: "Ja, i 'Analytics'-sektionen kan du se detaljerad statistik över nedladdningar, inklusive tidpunkt och geografisk plats för nedladdningarna."
    },
    {
      question: "Hur fungerar QR-koderna?",
      answer: "Varje kampanj genererar unika QR-koder som kunder kan skanna. Detta leder dem till en sida där de kan ladda upp bilder och få rabattkuponger."
    },
    {
      question: "Kan jag anpassa utseendet på uppladdningssidan?",
      answer: "Ja, i 'Inställningar' kan du anpassa färger, logotyp och text som visas för dina kunder när de skannar QR-koden."
    },
    {
      question: "Hur hanteras kunders personuppgifter?",
      answer: "Vi följer GDPR och all data krypteras. Kundernas bilder sparas säkert och du kan ställa in automatisk radering efter en viss tid."
    },
    {
      question: "Kan jag exportera data från systemet?",
      answer: "Ja, du kan exportera kampanjdata, kundstatistik och bildmetadata i CSV- eller Excel-format från Analytics-sektionen."
    }
  ];

  const filteredFaq = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ModernSidebar />
        
        <div className="flex-1">
          <ModernHeader />
          
          <main className="p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Hjälp & Support</h1>
                <p className="text-muted-foreground mt-2">
                  Hitta svar på vanliga frågor eller kontakta oss för hjälp
                </p>
              </div>

              <Tabs defaultValue="faq" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="faq" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    FAQ
                  </TabsTrigger>
                  <TabsTrigger value="contact" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Kontakt
                  </TabsTrigger>
                  <TabsTrigger value="guides" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Guider
                  </TabsTrigger>
                  <TabsTrigger value="videos" className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Videor
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="faq" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Vanliga frågor</CardTitle>
                      <CardDescription>
                        Sök efter svar på dina frågor
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Sök i FAQ..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      
                      <Accordion type="single" collapsible className="w-full">
                        {filteredFaq.map((item, index) => (
                          <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-left">
                              {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                              {item.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                      
                      {filteredFaq.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          Inga frågor hittades. Prova en annan sökning eller kontakta oss direkt.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Kontakta oss</CardTitle>
                        <CardDescription>
                          Skicka ett meddelande så återkommer vi
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleContactSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Namn</Label>
                            <Input id="name" required />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="email">E-post</Label>
                            <Input id="email" type="email" required />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="subject">Ämne</Label>
                            <Input id="subject" required />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="message">Meddelande</Label>
                            <Textarea id="message" rows={5} required />
                          </div>
                          
                          <Button type="submit" className="w-full">
                            Skicka meddelande
                          </Button>
                        </form>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Kontaktinformation</CardTitle>
                        <CardDescription>
                          Andra sätt att nå oss
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">E-post</p>
                            <p className="text-sm text-muted-foreground">
                              support@donezo.se
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Telefon</p>
                            <p className="text-sm text-muted-foreground">
                              +46 8 123 45 67
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <MessageCircle className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Live Chat</p>
                            <p className="text-sm text-muted-foreground">
                              Måndag-Fredag 9:00-17:00
                            </p>
                          </div>
                        </div>
                        
                        <Button variant="outline" className="w-full mt-4">
                          Starta Live Chat
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="guides" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">Komma igång</CardTitle>
                        <CardDescription>
                          Lär dig grunderna i att använda Donezo
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          En steg-för-steg guide som visar hur du skapar din första kampanj och kommer igång med systemet.
                        </p>
                        <Button variant="outline" className="mt-3">
                          Läs guide
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">Kampanjhantering</CardTitle>
                        <CardDescription>
                          Skapa och hantera effektiva kampanjer
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Lär dig hur du skapar engagerande kampanjer, optimerar QR-koder och ökar kundengagemang.
                        </p>
                        <Button variant="outline" className="mt-3">
                          Läs guide
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">Analytics & Rapporter</CardTitle>
                        <CardDescription>
                          Förstå dina kampanjresultat
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Upptäck hur du tolkar data, skapar rapporter och optimerar dina kampanjer baserat på resultat.
                        </p>
                        <Button variant="outline" className="mt-3">
                          Läs guide
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">API Integration</CardTitle>
                        <CardDescription>
                          Integrera med dina system
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Teknisk dokumentation för att integrera Donezo med dina befintliga system och verktyg.
                        </p>
                        <Button variant="outline" className="mt-3">
                          Läs guide
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="videos" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Introduktionsvideo</CardTitle>
                        <CardDescription>5 minuter</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-3">
                          <Video className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          En snabb genomgång av Donezos huvudfunktioner och hur du kommer igång.
                        </p>
                        <Button variant="outline" className="mt-3 w-full">
                          Spela video
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Skapa din första kampanj</CardTitle>
                        <CardDescription>8 minuter</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-3">
                          <Video className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Steg-för-steg genomgång av hur du skapar och lanserar din första kampanj.
                        </p>
                        <Button variant="outline" className="mt-3 w-full">
                          Spela video
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Analytics djupdykning</CardTitle>
                        <CardDescription>12 minuter</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-3">
                          <Video className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Lär dig tolka och använda analytics-data för att optimera dina kampanjer.
                        </p>
                        <Button variant="outline" className="mt-3 w-full">
                          Spela video
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Avancerade funktioner</CardTitle>
                        <CardDescription>15 minuter</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-3">
                          <Video className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Upptäck avancerade funktioner som API-integration, webhooks och automatisering.
                        </p>
                        <Button variant="outline" className="mt-3 w-full">
                          Spela video
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Help;