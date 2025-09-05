import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCompany, useCreateUpload, uploadFile } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload as UploadIcon, ImageIcon, VideoIcon, Gift, User, Mail, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useMobile } from '@/hooks/use-mobile';

const Upload = () => {
  const { companyId } = useParams<{ companyId?: string }>();
  const navigate = useNavigate();
  const { isMobile } = useMobile();

  const { data: company, isLoading: companyLoading } = useCompany(companyId || '');
  const createUpload = useCreateUpload();

  const [file, setFile] = useState<File | null>(null);
  const [review, setReview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const step1Done = !!file;
  const step2Done = !!customerName.trim() && !!customerEmail.trim() && emailRegex.test(customerEmail);


  if (companyLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className={`min-h-screen bg-background flex items-center justify-center ${isMobile ? 'p-3' : 'p-4'}`}>
        <Card className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-md'}`}>
          <CardContent className={`${isMobile ? 'p-4' : 'p-6'} text-center`}>
            <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-2`}>Company not found</h1>
            <p className="text-muted-foreground">This company does not exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'video/mp4'];
    const maxSize = 20 * 1024 * 1024; // 20MB

    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, PNG and MP4 files are allowed.");
      return false;
    }

    if (file.size > maxSize) {
      toast.error("File must be at most 20MB.");
      return false;
    }

    return true;
  };

  const validateForm = (): boolean => {
    if (!customerName.trim()) {
      toast.error('Please enter your name.');
      return false;
    }
    
    if (!customerEmail.trim()) {
      toast.error('Please enter your email.');
      return false;
    }
    
    if (!emailRegex.test(customerEmail)) {
      toast.error('Please enter a valid email address.');
      return false;
    }
    
    if (!file) {
      toast.error('Please choose an image or video to upload.');
      return false;
    }
    
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Använd Edge Function för säker uppladdning (kringgår RLS)
      const formData = new FormData();
      formData.append('file', file!);
      formData.append('companyId', company.id);
      formData.append('customerName', customerName.trim());
      formData.append('customerEmail', customerEmail.trim().toLowerCase());
      formData.append('review', review || '');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/secure-upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        navigate(`/thank-you/${result.upload.id}`);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      toast.error('An error occurred while submitting your upload.');
      console.error('Upload error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get company discount settings
  const discountPercent = company?.discount_percentage as number | undefined;
  const discountActive = company?.discount_active as boolean | undefined;
  const discountExpires = company?.discount_expires_at as string | undefined;
  const contentDescription = company?.content_description as string | undefined;

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
              <p className="text-sm text-muted-foreground">Share your contribution</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Hero */}
        <div className="text-center space-y-3 mt-2">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-card border shadow-sm grid place-items-center">
            {company?.logo ? (
              <img src={company.logo} alt={company.name} className="h-10 w-10 object-cover rounded" />
            ) : (
              <span className="text-lg font-bold text-foreground">{company?.name.charAt(0)}</span>
            )}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{company?.name}</h1>
          <p className="text-sm text-muted-foreground">Welcome to our campaign!</p>
        </div>
        {/* Stepper */}
        <div className="grid grid-cols-3 items-start gap-2">
          {[{label:'Choose file', done: step1Done}, {label:'Your details', done: step2Done}, {label:'Submit', done: step1Done && step2Done}].map((s, i) => (
            <div key={s.label} className="flex flex-col items-center text-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium border ${s.done ? 'bg-primary text-primary-foreground border-transparent' : 'bg-secondary text-foreground/80 border-border'}`}>
                {s.done ? <Check className="h-4 w-4" /> : i+1}
              </div>
              <span className="mt-2 text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
        {/* Offer + Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Gift className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Discount offer</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {typeof discountPercent === 'number' ? `${discountPercent}% off` : 'Discount coupon'}
                    {discountExpires ? ` • Valid until ${new Date(discountExpires).toLocaleDateString('en-GB')}` : ''}
                  </p>
                  {contentDescription && (
                    <p className="text-sm text-muted-foreground mt-2">{contentDescription}</p>
                  )}
                </div>
              </div>
              <div>
                <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium ${
                  discountActive === false ? 'bg-warning/10 text-warning border-warning/20' : 'bg-success/10 text-success border-success/20'
                }`}>
                  {discountActive === false ? 'Paused' : 'Active'}
                </span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Steps card */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm">How it works</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="text-sm space-y-2 text-muted-foreground">
              <li>1. Click "Choose file" below</li>
              <li>2. Upload your image or video</li>
              <li>3. Enter your name and email to receive the coupon</li>
            </ol>
          </CardContent>
        </Card>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Information */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="customer-name" className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Your name *
              </Label>
              <Input
                id="customer-name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                className="mt-1"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="customer-email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Your email *
              </Label>
              <Input
                id="customer-email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="name@email.com"
                className="mt-1"
                required
              />
            </div>
          </div>

          {/* File Upload */}
          <div>
            <Label htmlFor="file-upload" className="text-sm font-medium">
              Upload image or video *
            </Label>
            <div
              className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                dragActive
                  ? 'border-primary bg-accent shadow-sm'
                  : file
                  ? 'border-success bg-success/5 shadow-sm'
                  : 'border-border hover:border-primary/70 hover:shadow-sm'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                id="file-upload"
                type="file"
                accept="image/jpeg,image/png,video/mp4"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {file ? (
                <div className="space-y-2">
                  {file.type.startsWith('image/') ? (
                    <ImageIcon className="w-8 h-8 mx-auto text-success" />
                  ) : (
                    <VideoIcon className="w-8 h-8 mx-auto text-success" />
                  )}
                  <p className="text-sm font-medium text-success">
                    {file.name}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Change file
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <UploadIcon className="w-8 h-8 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Click or drag to upload
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or MP4 (max 20MB)
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Choose file
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Optional review */}
          <div>
            <Label htmlFor="review" className="text-sm font-medium">
              Review (optional)
            </Label>
            <Textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience with this company..."
              className="mt-1"
            />
          </div>


          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={isLoading || discountActive === false}
          >
            {discountActive === false ? 'Offer paused' : isLoading ? 'Uploading...' : 'Upload'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Upload;