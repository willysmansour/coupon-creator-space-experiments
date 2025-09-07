import { ModernSidebar } from "@/components/layout/ModernSidebar";
import { ModernHeader } from "@/components/layout/ModernHeader";
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
import { notify } from "@/lib/notify";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");
  

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    notify.success("Message sent", { description: "We will get back to you within 24 hours." });
  };

  const faqItems = [
    {
      question: "How do I upload images to the system?",
      answer: "Go to 'Uploads' in the menu and drag & drop your files or click 'Choose files'. Supported formats: JPG, PNG, GIF and MP4."
    },
    {
      question: "Which file formats are supported?",
      answer: "We support JPEG (.jpg, .jpeg), PNG (.png), GIF (.gif), and MP4 (.mp4). Maximum file size is 50MB per file."
    },
    {
      question: "How do I create a new campaign?",
      answer: "Click 'Create campaign' in the header or go to the Campaigns page. Fill in title, discount, validity. QR codes are generated automatically."
    },
    {
      question: "Can I see who downloaded my images?",
      answer: "Yes, in Analytics you can see detailed download stats including time and location."
    },
    {
      question: "How do the QR codes work?",
      answer: "Each campaign generates unique QR codes. Customers scan them to upload content and receive discount coupons."
    },
    {
      question: "Can I customize the upload page?",
      answer: "Yes, in Settings you can customize colors, logo and copy shown to customers after scanning the QR code."
    },
    {
      question: "How is personal data handled?",
      answer: "We follow GDPR and encrypt all data. Customer images are stored securely and can be auto-deleted after a set time."
    },
    {
      question: "Can I export data?",
      answer: "Yes, export campaign data, customer stats and image metadata in CSV/Excel from Analytics."
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
                <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
                <p className="text-muted-foreground mt-2">
                  Find answers to common questions or contact us for help
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
                    Contact
                  </TabsTrigger>
                  <TabsTrigger value="guides" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Guides
                  </TabsTrigger>
                  <TabsTrigger value="videos" className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Videos
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="faq" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Frequently asked questions</CardTitle>
                      <CardDescription>
                        Search for answers to your questions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search the FAQ..."
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
                          No questions found. Try another search or contact us directly.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Contact us</CardTitle>
                        <CardDescription>
                          Send a message and we will get back to you
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleContactSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" required />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" required />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" required />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" rows={5} required />
                          </div>
                          
                          <Button type="submit" className="w-full">
                            Send message
                          </Button>
                        </form>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Contact information</CardTitle>
                        <CardDescription>
                          Andra sätt att nå oss
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Email</p>
                            <p className="text-sm text-muted-foreground">
                              support@donezo.se
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Phone</p>
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
                              Mon–Fri 9:00–17:00
                            </p>
                          </div>
                        </div>
                        
                        <Button variant="outline" className="w-full mt-4">
                          Start Live Chat
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="guides" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">Getting started</CardTitle>
                        <CardDescription>
                          Learn the basics of using Donezo
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          A step-by-step guide to create your first campaign and get started.
                        </p>
                        <Button variant="outline" className="mt-3">
                          Read guide
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">Campaign management</CardTitle>
                        <CardDescription>
                          Create and manage effective campaigns
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Learn how to create engaging campaigns, optimize QR codes and increase engagement.
                        </p>
                        <Button variant="outline" className="mt-3">
                          Read guide
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">Analytics & Reports</CardTitle>
                        <CardDescription>
                          Understand your campaign results
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Discover how to interpret data, build reports and optimize based on results.
                        </p>
                        <Button variant="outline" className="mt-3">
                          Read guide
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">API Integration</CardTitle>
                        <CardDescription>
                          Integrate with your systems
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Technical documentation for integrating Donezo with your systems and tools.
                        </p>
                        <Button variant="outline" className="mt-3">
                          Read guide
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="videos" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Introduction video</CardTitle>
                        <CardDescription>5 minutes</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-3">
                          <Video className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          A quick overview of Donezo's main features and how to get started.
                        </p>
                        <Button variant="outline" className="mt-3 w-full">
                          Play video
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Create your first campaign</CardTitle>
                        <CardDescription>8 minutes</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-3">
                          <Video className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Step-by-step walkthrough on creating and launching your first campaign.
                        </p>
                        <Button variant="outline" className="mt-3 w-full">
                          Play video
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Analytics deep dive</CardTitle>
                        <CardDescription>12 minutes</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-3">
                          <Video className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Learn to interpret and use analytics data to optimize campaigns.
                        </p>
                        <Button variant="outline" className="mt-3 w-full">
                          Play video
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Advanced features</CardTitle>
                        <CardDescription>15 minutes</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-3">
                          <Video className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Discover advanced features like API integration, webhooks and automation.
                        </p>
                        <Button variant="outline" className="mt-3 w-full">
                          Play video
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
