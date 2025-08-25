import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, CheckCircle, AlertCircle, Clock, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Coupon = () => {
  const { couponId } = useParams<{ couponId: string }>();
  const navigate = useNavigate();
  const { getCouponById, redeemCoupon, company } = useApp();
  const [isRedeeming, setIsRedeeming] = useState(false);
  
  const coupon = couponId ? getCouponById(couponId) : null;

  if (!coupon) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h1 className="text-xl font-semibold mb-2">Kupong hittades inte</h1>
            <p className="text-muted-foreground">Den här kupongen existerar inte eller har tagits bort.</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Tillbaka till start
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = new Date() > new Date(coupon.expiresAt);
  const isActive = coupon.status === 'active' && !isExpired;
  const isUsed = coupon.status === 'used' || coupon.used;

  const getStatusInfo = () => {
    if (isUsed) {
      return {
        icon: CheckCircle,
        title: 'Kupong använd',
        description: `Inlöst ${coupon.usedAt ? new Date(coupon.usedAt).toLocaleString('sv-SE') : ''}`,
        color: 'text-muted-foreground',
        bgColor: 'bg-muted',
        badgeVariant: 'secondary' as const
      };
    } else if (isExpired) {
      return {
        icon: AlertCircle,
        title: 'Kupong utgången',
        description: `Gick ut ${new Date(coupon.expiresAt).toLocaleDateString('sv-SE')}`,
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        badgeVariant: 'destructive' as const
      };
    } else {
      return {
        icon: Gift,
        title: 'Aktiv kupong',
        description: `Gäller till ${new Date(coupon.expiresAt).toLocaleDateString('sv-SE')}`,
        color: 'text-success',
        bgColor: 'bg-success/10',
        badgeVariant: 'default' as const
      };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const handleCopyCouponCode = () => {
    navigator.clipboard.writeText(coupon.id);
    toast({
      title: "Kupongkod kopierad",
      description: "Kupongkoden har kopierats till urklipp.",
    });
  };

  const handleRedeem = async () => {
    if (!isActive) return;
    
    setIsRedeeming(true);
    
    try {
      const success = redeemCoupon(coupon.id);
      if (success) {
        toast({
          title: "Kupong inlöst!",
          description: "Kupongen har använts framgångsrikt.",
        });
      } else {
        toast({
          title: "Kunde inte lösa in kupong",
          description: "Kupongen är inte giltig eller redan använd.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Något gick fel",
        description: "Försök igen senare.",
        variant: "destructive",
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-center gap-3">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} className="w-8 h-8 rounded" />
            ) : (
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-bold">
                  {company.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h1 className="font-semibold text-foreground">{company.name}</h1>
              <p className="text-sm text-muted-foreground">Din rabattkupong</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Coupon Card */}
        <Card className={`border-2 ${isActive ? 'border-success' : isUsed ? 'border-muted' : 'border-destructive'}`}>
          <CardHeader className="text-center">
            <div className={`p-3 rounded-full ${statusInfo.bgColor} w-fit mx-auto`}>
              <StatusIcon className={`w-8 h-8 ${statusInfo.color}`} />
            </div>
            <CardTitle className="text-2xl font-bold">
              {coupon.discount}% RABATT
            </CardTitle>
            <Badge variant={statusInfo.badgeVariant}>
              {statusInfo.title}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Coupon Code */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">KUPONGKOD</p>
              <div className="bg-muted p-3 rounded-lg font-mono text-lg font-bold tracking-wider">
                {coupon.id}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyCouponCode}
                className="mt-2"
              >
                <Copy className="w-4 h-4 mr-2" />
                Kopiera kod
              </Button>
            </div>

            {/* Campaign Info */}
            <div className="text-center border-t pt-4">
              <h3 className="font-medium">{coupon.campaign}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {statusInfo.description}
              </p>
            </div>

            {/* Customer Info */}
            {coupon.customerName && (
              <div className="text-center text-sm text-muted-foreground">
                Utfärdad till: {coupon.customerName}
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Code Simulation */}
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-32 h-32 mx-auto bg-foreground rounded-lg flex items-center justify-center mb-4">
              <div className="text-background text-xs font-mono">
                QR CODE
                <br />
                {coupon.id.slice(-6)}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Visa denna QR-kod i kassan för att använda kupongen
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          {isActive && (
            <Button 
              onClick={handleRedeem}
              disabled={isRedeeming}
              className="w-full h-12"
              size="lg"
            >
              {isRedeeming ? (
                <>
                  <Clock className="w-5 h-5 mr-2 animate-spin" />
                  Löser in...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Lös in nu
                </>
              )}
            </Button>
          )}

          {isUsed && (
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                ✅ Denna kupong har redan använts
              </p>
            </div>
          )}

          {isExpired && (
            <div className="text-center p-4 bg-destructive/10 rounded-lg">
              <p className="text-sm text-destructive">
                ⏰ Denna kupong har gått ut
              </p>
            </div>
          )}

          <Button 
            variant="outline" 
            onClick={() => navigate(`/landing/${company.id}`)}
            className="w-full"
          >
            Se fler kampanjer
          </Button>
        </div>

        {/* Terms */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Villkor</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Kupongen kan endast användas en gång</li>
              <li>• Gäller endast för fullpris-artiklar</li>
              <li>• Kan inte kombineras med andra erbjudanden</li>
              <li>• Visa denna kupong i kassan</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Coupon;