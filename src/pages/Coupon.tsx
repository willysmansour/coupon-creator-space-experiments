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
  
  // Debug logging för mobil
  console.log('🔍 Coupon component mounted with ID:', couponId);
  
  const { data: coupon, isLoading, error } = useCoupon(couponId || '');
  
  // Debug logging för useCoupon resultat
  console.log('🔍 useCoupon result:', { coupon, isLoading, error, couponId });
  
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
            <h1 className="text-xl font-semibold mb-2">Coupon not found</h1>
            <p className="text-muted-foreground">This coupon does not exist or has been removed.</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Back to home
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
        title: 'Coupon used',
        description: `Redeemed ${coupon.used_at ? new Date(coupon.used_at).toLocaleString('en-GB') : ''}`,
        color: 'text-muted-foreground',
        bgColor: 'bg-muted',
        badgeVariant: 'secondary' as const
      };
    } else if (isExpired) {
      return {
        icon: AlertCircle,
        title: 'Coupon expired',
        description: `Expired on ${new Date(coupon.expires_at).toLocaleDateString('en-GB')}`,
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        badgeVariant: 'destructive' as const
      };
    } else {
      return {
        icon: Gift,
        title: 'Active coupon',
        description: `Valid until ${new Date(coupon.expires_at).toLocaleDateString('en-GB')}`,
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
    toast.success("Coupon code copied to clipboard.");
  };

  const handleRedeem = async () => {
    if (!isActive) return;
    
    setIsRedeeming(true);
    
    try {
      await redeemCoupon.mutateAsync(coupon.code);
      toast.success('🎉 Thank you! Your discount has been applied.');
    } catch (error) {
      console.error('Redeem error:', error);
      toast.error('Could not redeem the coupon. Please try again.');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Company Header */}
      {coupon.company && (
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-b">
          <div className="max-w-md mx-auto p-6 text-center">
            {coupon.company.logo && (
              <img 
                src={coupon.company.logo} 
                alt={`${coupon.company.name} logo`}
                className="w-16 h-16 mx-auto mb-3 rounded-lg object-contain bg-white/50 backdrop-blur-sm"
              />
            )}
            <h1 className="text-xl font-bold text-foreground">{coupon.company.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">Exclusive coupon</p>
          </div>
        </div>
      )}

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
              <p className="text-xs text-muted-foreground mb-2">COUPON CODE</p>
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
                Copy code
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
              Show this QR code at checkout to redeem the coupon
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          {isActive && (
            <div className="bg-gradient-to-r from-success/10 to-success/5 p-4 rounded-lg border border-success/20">
              <p className="text-sm text-center text-muted-foreground mb-3">
                🏪 <strong>For cashier:</strong> Press the button below to redeem the coupon
              </p>
              <Button 
                onClick={handleRedeem}
                disabled={isRedeeming}
                className="w-full h-12 bg-success hover:bg-success/90 text-white"
                size="lg"
              >
                {isRedeeming ? (
                  <>
                    <Clock className="w-5 h-5 mr-2 animate-spin" />
                    Redeeming coupon...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    ✅ Redeem coupon at checkout
                  </>
                )}
              </Button>
            </div>
          )}

          {isUsed && (
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                🎉 Thank you! This coupon has been used.
              </p>
            </div>
          )}

          {isExpired && (
            <div className="text-center p-4 bg-destructive/10 rounded-lg">
              <p className="text-sm text-destructive">
                ⏰ This coupon has expired
              </p>
            </div>
          )}

          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="w-full"
          >
            See more campaigns
          </Button>
        </div>

        {/* Terms */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Terms</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• The coupon can only be used once</li>
              <li>• Valid only for full-priced items</li>
              <li>• Cannot be combined with other offers</li>
              <li>• Show this coupon at checkout</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Coupon;