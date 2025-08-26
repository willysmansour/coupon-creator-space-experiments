import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUpload, useCompany, useCouponByUpload, useUpdateUploadWithCustomer } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Clock, Gift } from 'lucide-react';
import { toast } from 'sonner';

const ThankYou = () => {
  const { uploadId } = useParams<{ uploadId: string }>();
  const navigate = useNavigate();
  const { data: upload, isLoading: uploadLoading } = useUpload(uploadId || '');
  const { data: company, isLoading: companyLoading } = useCompany(upload?.company_id || '');
  const { data: coupon, isLoading: couponLoading } = useCouponByUpload(uploadId || '');
  const updateUploadWithCustomer = useUpdateUploadWithCustomer();
  
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [showForm, setShowForm] = useState(!upload?.customer_name && !upload?.customer_email);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (uploadLoading || companyLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!upload || !company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h1 className="text-xl font-semibold mb-2">Något gick fel</h1>
            <p className="text-muted-foreground">Vi kunde inte hitta ditt bidrag.</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Tillbaka till start
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusInfo = () => {
    if (upload.status === 'approved' || coupon) {
      return {
        icon: CheckCircle,
        title: 'Tack för ditt bidrag!',
        description: 'Ditt bidrag har godkänts och din kupong är klar.',
        color: 'text-success',
        bgColor: 'bg-success/10'
      };
    } else if (upload.status === 'pending') {
      return {
        icon: Clock,
        title: 'Tack för ditt bidrag!',
        description: 'Vi granskar ditt bidrag och återkommer snart.',
        color: 'text-warning',
        bgColor: 'bg-warning/10'
      };
    } else {
      return {
        icon: Clock,
        title: 'Tack för ditt bidrag!',
        description: 'Vi granskar ditt bidrag.',
        color: 'text-muted-foreground',
        bgColor: 'bg-muted'
      };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-center gap-3">
            {company?.logo ? (
              <img src={company.logo} alt={company.name} className="w-8 h-8 rounded" />
            ) : (
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-bold">
                  {company?.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h1 className="font-semibold text-foreground">{company?.name}</h1>
              <p className="text-sm text-muted-foreground">Tack för ditt bidrag</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${statusInfo.bgColor}`}>
                <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
              </div>
              <div>
                <CardTitle className="text-lg">{statusInfo.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {statusInfo.description}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Discount Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Rabatterbjudande</h3>
                <p className="text-sm text-muted-foreground">
                  {typeof (company as any)?.discount_percentage === 'number' 
                    ? `${(company as any).discount_percentage}% rabatt` 
                    : 'Rabattkupong'}
                </p>
              </div>
              <Badge variant={upload.status === 'approved' ? 'default' : 'secondary'}>
                {upload.status === 'approved' ? 'Godkänt' : 
                 upload.status === 'pending' ? 'Under granskning' : 'Väntar'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Upload Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ditt bidrag</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-3">
              {upload.image_url && (
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={upload.image_url} 
                    alt="Upload preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <p className="text-sm">{upload.message}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Skickat:</span>
                <span>{new Date(upload.submitted_at).toLocaleString('sv-SE')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Details Form - only show if not provided */}
        {showForm && !upload?.customer_name && !upload?.customer_email && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Få din kupong via e-post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Namn *
                </Label>
                <Input
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ditt namn"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  E-post *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="din@email.se"
                  className="mt-1"
                />
              </div>
              
              <Button
                onClick={async () => {
                  if (!customerName.trim() || !email.trim()) {
                    toast.error('Vänligen fyll i både namn och e-post');
                    return;
                  }
                  
                  setIsSubmitting(true);
                  try {
                    // First update the upload with customer details
                    await updateUploadWithCustomer.mutateAsync({
                      id: uploadId!,
                      customer_name: customerName.trim(),
                      customer_email: email.trim()
                    });

                    // Then send the coupon email
                    const { error: emailError } = await supabase.functions.invoke('send-coupon-email', {
                      body: {
                        uploadId: uploadId!,
                        customerName: customerName.trim(),
                        customerEmail: email.trim()
                      }
                    });

                    if (emailError) {
                      console.error('Email error:', emailError);
                      toast.error('Detaljer sparade men e-post misslyckades');
                    } else {
                      setShowForm(false);
                      toast.success('Detaljer sparade! Din kupong skickas till din e-post inom kort.');
                    }
                  } catch (error) {
                    console.error('Error:', error);
                    toast.error('Misslyckades att spara detaljer');
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sparar..." : "Få kupong"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {coupon && (
            <Button 
              onClick={() => navigate(`/coupon/${coupon.id}`)}
              className="w-full h-12"
              size="lg"
            >
              <Gift className="w-5 h-5 mr-2" />
              View my coupon
            </Button>
          )}
          
          {!coupon && upload.status === 'pending' && !showForm && (
            <div className="text-center p-4 bg-accent rounded-lg">
              <p className="text-sm text-accent-foreground">
                Ditt bidrag granskas. Du får en kupong när det godkänns.
              </p>
            </div>
          )}

          <Button 
            variant="outline" 
            onClick={() => navigate(`/company/${company?.id}`)}
            className="w-full"
          >
            Tillbaka till företaget
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;