import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCampaign, useCompany, useCreateUpload, uploadFile } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload as UploadIcon, ImageIcon, VideoIcon } from 'lucide-react';
import { toast } from 'sonner';

const Upload = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const { data: campaign, isLoading: campaignLoading } = useCampaign(campaignId || '');
  const { data: company, isLoading: companyLoading } = useCompany(campaign?.company_id || '');
  const createUpload = useCreateUpload();
  
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  if (campaignLoading || companyLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h1 className="text-xl font-semibold mb-2">Kampanjen kunde inte hittas</h1>
            <p className="text-muted-foreground">Den här kampanjen existerar inte eller har tagits bort.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (campaign.status !== 'active') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h1 className="text-xl font-semibold mb-2">Kampanjen är inte aktiv</h1>
            <p className="text-muted-foreground">Den här kampanjen har avslutats eller är inte tillgänglig just nu.</p>
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
      toast.error("Endast JPG, PNG och MP4 filer är tillåtna.");
      return false;
    }

    if (file.size > maxSize) {
      toast.error("Filen får max vara 20MB stor.");
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
    
    if (!file) {
      toast.error('Vänligen välj en bild eller video att ladda upp.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Upload file to Supabase Storage
      const imageUrl = await uploadFile(file);
      
      // Create upload record with minimal data
      const upload = await createUpload.mutateAsync({
        campaign_id: campaignId!,
        image_url: imageUrl,
        message: 'Uploaded content' // Default message since field is removed
      });
      
      navigate(`/thank-you/${upload.id}`);
    } catch (error) {
      toast.error('Ett fel uppstod när bilden skulle skickas in.');
      console.error('Upload error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
              <p className="text-sm text-muted-foreground">Dela ditt bidrag</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Campaign Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{campaign.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Få {campaign.discount} • Gäller till {new Date(campaign.valid_to).toLocaleDateString('sv-SE')}
            </p>
          </CardHeader>
        </Card>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload */}
          <div>
            <Label htmlFor="file-upload" className="text-sm font-medium">
              Ladda upp bild eller video *
            </Label>
            <div
              className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-accent'
                  : file
                  ? 'border-success bg-success/5'
                  : 'border-border hover:border-primary'
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
                    Byt fil
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <UploadIcon className="w-8 h-8 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Klicka eller dra för att ladda upp
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG eller MP4 (max 20MB)
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Välj fil
                  </Button>
                </div>
              )}
            </div>
          </div>


          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={isLoading}
          >
            {isLoading ? "Uploading..." : "Upload"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Upload;