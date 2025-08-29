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
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 rounded-full bg-muted">
            <Gift className="h-6 w-6 text-muted-foreground animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground">Fetching information...</p>
        </div>
      </div>
    );
  }

  if (!upload || !company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground">We could not find your submission.</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Back to home
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
        title: 'Thank you for your contribution!',
        description: 'Your submission has been approved and your coupon is ready.',
        color: 'text-success',
        bgColor: 'bg-success/10'
      };
    } else if (upload.status === 'pending') {
      return {
        icon: Clock,
        title: 'Thank you for your contribution!',
        description: 'We are reviewing your submission and will get back soon.',
        color: 'text-warning',
        bgColor: 'bg-warning/10'
      };
    } else {
      return {
        icon: Clock,
        title: 'Thank you for your contribution!',
        description: 'We are reviewing your submission.',
        color: 'text-muted-foreground',
        bgColor: 'bg-muted'
      };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtil bakgrundsgradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 h-[420px] w-[720px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[360px] w-[560px] rounded-full bg-accent/40 blur-3xl" />
      </div>
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
              <p className="text-sm text-muted-foreground">Thank you for your contribution</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Hero */}
        <div className="text-center space-y-2 mt-2">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-card border shadow-sm grid place-items-center">
            {company?.logo ? (
              <img src={company.logo} alt={company.name} className="h-10 w-10 object-cover rounded" />
            ) : (
              <span className="text-lg font-bold text-foreground">{company?.name.charAt(0)}</span>
            )}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{company?.name}</h1>
          <p className="text-sm text-muted-foreground">Thank you for your contribution</p>
        </div>
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
                <h3 className="font-medium">Discount offer</h3>
                <p className="text-sm text-muted-foreground">
                  {typeof company?.discount_percentage === 'number'
                    ? `${company.discount_percentage}% off`
                    : 'Special discount'}
                </p>
              </div>
              <Badge variant={upload.status === 'approved' ? 'default' : 'secondary'}>
                {upload.status === 'approved' ? 'Approved' : 
                 upload.status === 'pending' ? 'Under review' : 'Pending'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Upload Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your submission</CardTitle>
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
                <span>Submitted:</span>
                <span>{new Date(upload.submitted_at).toLocaleString('en-GB')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Details Form - only show if not provided */}
        {showForm && !upload?.customer_name && !upload?.customer_email && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Get your coupon via email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Name *
                </Label>
                <Input
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="mt-1"
                />
              </div>
              
              <Button
                onClick={async () => {
                  if (!customerName.trim() || !email.trim()) {
                    toast.error('Please fill in both name and email');
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
                    const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-coupon-email', {
                      body: {
                        uploadId: uploadId!,
                        customerName: customerName.trim(),
                        customerEmail: email.trim()
                      },
                      headers: {
                        'x-app-origin': window.location.origin,
                      }
                    });

                    if (emailError || !emailResult?.success) {
                      console.error('Email error:', emailError || emailResult);
                      if (emailResult?.needsApproval) {
                        setShowForm(false);
                        toast.success('Details saved! You will receive a coupon when your submission is approved.');
                      } else {
                        toast.error('Details saved but the email failed to send');
                      }
                    } else {
                      setShowForm(false);
                      toast.success('Details saved! Your coupon will be sent to your email shortly.');
                    }
                  } catch (error) {
                    console.error('Error:', error);
                    toast.error('Failed to save details');
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Get coupon"}
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
                Your submission is under review. You will receive a coupon when it is approved.
              </p>
            </div>
          )}

          <Button 
            variant="outline" 
            onClick={() => navigate(`/company/${company?.id}`)}
            className="w-full"
          >
            Back to company
          </Button>
        </div>

        {/* Next steps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">What happens next?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• We will review your submission shortly.</p>
            <p>• Once approved, your coupon will be sent to your email.</p>
            <p>• Need to change anything? Reply to the email you receive.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ThankYou;