import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types
export interface Campaign {
  id: string;
  title: string;
  discount: number;
  validUntil: string;
  description?: string;
  submissions: number;
  couponsIssued: number;
  status: "active" | "inactive" | "expired";
  createdAt: string;
}

export interface Upload {
  id: string;
  customerName: string;
  email: string;
  image: string;
  message: string;
  campaignId: string;
  campaign: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

export interface Coupon {
  id: string;
  customerName: string;
  email: string;
  campaignId: string;
  campaign: string;
  discount: number;
  issuedAt: string;
  expiresAt: string;
  status: "active" | "used" | "expired";
  used: boolean;
  usedAt?: string;
  uploadId: string;
}

interface AppState {
  campaigns: Campaign[];
  uploads: Upload[];
  coupons: Coupon[];
}

interface AppActions {
  addCampaign: (campaign: Omit<Campaign, 'id' | 'submissions' | 'couponsIssued' | 'createdAt'>) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  addUpload: (upload: Omit<Upload, 'id' | 'submittedAt'>) => void;
  updateUpload: (id: string, updates: Partial<Upload>) => void;
  addCoupon: (coupon: Omit<Coupon, 'id' | 'issuedAt'>) => void;
  updateCoupon: (id: string, updates: Partial<Coupon>) => void;
  approveUpload: (uploadId: string) => void;
  rejectUpload: (uploadId: string) => void;
}

const AppContext = createContext<(AppState & AppActions) | undefined>(undefined);

// Initial mock data
const initialCampaigns: Campaign[] = [
  {
    id: "1",
    title: "Ladda upp bild → få 20% rabatt",
    discount: 20,
    validUntil: "2024-12-31",
    submissions: 47,
    couponsIssued: 32,
    status: "active",
    createdAt: "2024-11-01"
  },
  {
    id: "2", 
    title: "Vinterkampanj - Visa din style",
    discount: 15,
    validUntil: "2025-01-15",
    submissions: 23,
    couponsIssued: 18,
    status: "active",
    createdAt: "2024-11-15"
  },
  {
    id: "3",
    title: "Sommarerbjudande 2024",
    discount: 25,
    validUntil: "2024-08-30",
    submissions: 89,
    couponsIssued: 67,
    status: "expired",
    createdAt: "2024-06-01"
  }
];

const initialUploads: Upload[] = [
  {
    id: "1",
    customerName: "Anna Andersson",
    email: "anna@example.com",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face",
    message: "Älskar er nya kollektion! Här är min favorit look.",
    campaignId: "1",
    campaign: "Ladda upp bild → få 20% rabatt",
    submittedAt: "2024-12-20T12:30:00Z",
    status: "pending"
  },
  {
    id: "2",
    customerName: "Erik Svensson", 
    email: "erik@example.com",
    image: "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=300&h=300&fit=crop&crop=face",
    message: "Fantastisk service och snabb leverans!",
    campaignId: "2",
    campaign: "Vinterkampanj - Visa din style",
    submittedAt: "2024-12-20T07:30:00Z",
    status: "approved"
  },
  {
    id: "3",
    customerName: "Maria Johansson",
    email: "maria@example.com", 
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b977?w=300&h=300&fit=crop&crop=face",
    message: "Perfekt kvalitet och snabb leverans!",
    campaignId: "1",
    campaign: "Ladda upp bild → få 20% rabatt",
    submittedAt: "2024-12-19T14:20:00Z",
    status: "pending"
  }
];

const initialCoupons: Coupon[] = [
  {
    id: "SAVE15-DEF456",
    customerName: "Erik Svensson",
    email: "erik@example.com",
    campaignId: "2", 
    campaign: "Vinterkampanj - Visa din style",
    discount: 15,
    issuedAt: "2024-12-20T07:35:00Z",
    expiresAt: "2025-01-15T23:59:59Z",
    status: "used",
    used: true,
    usedAt: "2024-12-20T16:45:00Z",
    uploadId: "2"
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [uploads, setUploads] = useState<Upload[]>(initialUploads);
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);

  const addCampaign = (campaignData: Omit<Campaign, 'id' | 'submissions' | 'couponsIssued' | 'createdAt'>) => {
    const newCampaign: Campaign = {
      ...campaignData,
      id: Date.now().toString(),
      submissions: 0,
      couponsIssued: 0,
      createdAt: new Date().toISOString()
    };
    setCampaigns(prev => [...prev, newCampaign]);
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === id ? { ...campaign, ...updates } : campaign
    ));
  };

  const addUpload = (uploadData: Omit<Upload, 'id' | 'submittedAt'>) => {
    const newUpload: Upload = {
      ...uploadData,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString()
    };
    setUploads(prev => [...prev, newUpload]);
    
    // Update campaign submission count
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === uploadData.campaignId 
        ? { ...campaign, submissions: campaign.submissions + 1 }
        : campaign
    ));
  };

  const updateUpload = (id: string, updates: Partial<Upload>) => {
    setUploads(prev => prev.map(upload => 
      upload.id === id ? { ...upload, ...updates } : upload
    ));
  };

  const addCoupon = (couponData: Omit<Coupon, 'id' | 'issuedAt'>) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `SAVE${couponData.discount}-${Date.now().toString().slice(-6)}`,
      issuedAt: new Date().toISOString()
    };
    setCoupons(prev => [...prev, newCoupon]);
    
    // Update campaign coupon count
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === couponData.campaignId 
        ? { ...campaign, couponsIssued: campaign.couponsIssued + 1 }
        : campaign
    ));
  };

  const updateCoupon = (id: string, updates: Partial<Coupon>) => {
    setCoupons(prev => prev.map(coupon => 
      coupon.id === id ? { ...coupon, ...updates } : coupon
    ));
  };

  const approveUpload = (uploadId: string) => {
    const upload = uploads.find(u => u.id === uploadId);
    if (!upload) return;

    // Update upload status
    updateUpload(uploadId, { status: "approved" });
    
    // Create coupon
    const campaign = campaigns.find(c => c.id === upload.campaignId);
    if (campaign) {
      const expirationDate = new Date(campaign.validUntil);
      addCoupon({
        customerName: upload.customerName,
        email: upload.email,
        campaignId: upload.campaignId,
        campaign: upload.campaign,
        discount: campaign.discount,
        expiresAt: expirationDate.toISOString(),
        status: "active",
        used: false,
        uploadId: uploadId
      });
    }
  };

  const rejectUpload = (uploadId: string) => {
    updateUpload(uploadId, { status: "rejected" });
  };

  const value = {
    campaigns,
    uploads,
    coupons,
    addCampaign,
    updateCampaign,
    addUpload,
    updateUpload,
    addCoupon,
    updateCoupon,
    approveUpload,
    rejectUpload
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};