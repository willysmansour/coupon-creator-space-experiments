import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCoupon, useRedeemCoupon } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, CheckCircle, AlertCircle, Clock, Copy } from 'lucide-react';
import { toast } from 'sonner';

const Coupon = () => {
  const { couponId } = useParams<{ couponId: string }>();
  const navigate = useNavigate();
  const { data: coupon, isLoading } = useCoupon(couponId || '');
  const redeemCoupon = useRedeemCoupon();
  const [isRedeeming, setIsRedeeming] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

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

  const isExpired = new Date() > new Date(coupon.expires_at);
  const isActive = !coupon.is_used && !isExpired;
  const isUsed = coupon.is_used;

  const getStatusInfo = () => {
    if (isUsed) {
      return {
        icon: CheckCircle,
        title: 'Kupong använd',
        description: `Inlöst ${coupon.used_at ? new Date(coupon.used_at).toLocaleString('sv-SE') : ''}`,
        color: 'text-muted-foreground',
        bgColor: 'bg-muted',
        badgeVariant: 'secondary' as const
      };
    } else if (isExpired) {
      return {
        icon: AlertCircle,
        title: 'Kupong utgången',
        description: `Gick ut ${new Date(coupon.expires_at).toLocaleDateString('sv-SE')}`,
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        badgeVariant: 'destructive' as const
      };
    } else {
      return {
        icon: Gift,
        title: 'Aktiv kupong',
        description: `Gäller till ${new Date(coupon.expires_at).toLocaleDateString('sv-SE')}`,
        color: 'text-success',
        bgColor: 'bg-success/10',
        badgeVariant: 'default' as const
      };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const handleCopyCouponCode = () => {
    navigator.clipboard.writeText(coupon.code);
    toast.success("Kupongkod kopierad till urklipp.");
  };

  const handleRedeem = async () => {
    if (!isActive) return;
    
    setIsRedeeming(true);
    
    try {
      await redeemCoupon.mutateAsync(coupon.code);
    } catch (error) {
      console.error('Redeem error:', error);
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Coupon Card */}
        <Card className={`border-2 ${isActive ? 'border-success' : isUsed ? 'border-muted' : 'border-destructive'}`}>
          <CardHeader className="text-center">
            <div className={`p-3 rounded-full ${statusInfo.bgColor} w-fit mx-auto`}>
              <StatusIcon className={`w-8 h-8 ${statusInfo.color}`} />
            </div>
            <CardTitle className="text-2xl font-bold">
              {coupon.discount}
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
                {coupon.code}
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

            {/* Expiry Info */}
            <div className="text-center border-t pt-4">
              <p className="text-sm text-muted-foreground mt-1">
                {statusInfo.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Simulation */}
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-32 h-32 mx-auto bg-foreground rounded-lg flex items-center justify-center mb-4">
              <div className="text-background text-xs font-mono">
                QR CODE
                <br />
                {coupon.code.slice(-6)}
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
            onClick={() => navigate('/')}
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