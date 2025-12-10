import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Order {
  id: string;
  email: string;
  total_amount: number;
  status: string;
  created_at: string;
  shipping_address: any;
}

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      // Wait for auth session to be ready
      const { data: { session } } = await supabase.auth.getSession();
      
      // Extract session ID from URL if it's a Stripe session ID
      let orderIdToFetch = orderId;
      
      if (orderId?.startsWith('cs_')) {
        // This is a Stripe session ID, verify payment first
        try {
          const response = await fetch(
            `https://waldggnsstpxasmauwda.functions.supabase.co/verify-payment`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              },
              body: JSON.stringify({ sessionId: orderId }),
            }
          );

          const verifyData = await response.json();
          console.log('verify-payment fetch response', { status: response.status, verifyData });

          if (!response.ok) {
            const message = verifyData?.error || 'Payment verification failed';
            console.error('verify-payment HTTP error:', message);
            toast.error(`Payment verification error: ${message}`);
            throw new Error(message);
          }
          
          if (verifyData?.orderId) {
            orderIdToFetch = verifyData.orderId;
            // Update URL to show the actual order ID
            navigate(`/order-confirmation/${orderIdToFetch}`, { replace: true });
          }
        } catch (error) {
          console.error('Error verifying payment:', error);
          setLoading(false);
          return;
        }
      }

      if (!orderIdToFetch) {
        setLoading(false);
        return;
      }

      console.log('Fetching order:', orderIdToFetch, 'User authenticated:', !!session);

      // Use service role via edge function if user not authenticated (coming from Stripe redirect)
      if (!session) {
        // Fetch order via verify-payment which already has the order data
        // Or call a public order lookup function
        try {
          const response = await fetch(
            `https://waldggnsstpxasmauwda.functions.supabase.co/verify-payment`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              },
              body: JSON.stringify({ sessionId: orderId, getOrder: true }),
            }
          );
          const data = await response.json();
          if (data?.order) {
            setOrder(data.order);
          }
        } catch (error) {
          console.error('Error fetching order without auth:', error);
        }
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderIdToFetch)
        .maybeSingle();

      console.log('Order fetch result:', { data, error });

      if (error) {
        console.error('Error fetching order:', error);
      } else if (data) {
        setOrder(data);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-12 px-4 flex items-center justify-center">
          <p>Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-12 px-4 flex items-center justify-center">
          <Card className="p-8 text-center max-w-md">
            <p className="text-lg mb-4">Order not found</p>
            <Button onClick={() => navigate('/')}>Return to Home</Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-primary" />
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-black mb-2">
                {order.status === 'paid' ? 'ORDER CONFIRMED!' : 'ORDER RECEIVED - PAYMENT PENDING'}
              </h1>
              <p className="text-muted-foreground">
                {order.status === 'paid'
                  ? `Thanks for your order. We've sent a confirmation to ${order.email}`
                  : `We created an order record for ${order.email}, but no successful payment was detected yet. You won't be charged and nothing will be sent to Printify until payment completes.`}
              </p>
            </div>

            <div className="bg-muted p-6 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Order Number</span>
                <span className="font-mono text-sm font-bold">
                  {order.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-bold">${order.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="font-bold uppercase">{order.status}</span>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-primary mt-1" />
                <div className="text-left">
                  <h3 className="font-bold mb-1">What's Next?</h3>
                  <p className="text-sm text-muted-foreground">
                    {order.status === 'paid'
                      ? "Your order is being processed and will be sent to Printify for fulfillment. You'll receive tracking information once your items ship."
                      : "No successful payment was found for this order yet. If you believe this is a mistake, please try checking out again or contact support."}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button onClick={() => navigate(`/order-tracking/${orderId}`)} variant="default">
                TRACK YOUR ORDER
              </Button>
              <Button onClick={() => navigate('/')} variant="outline">
                CONTINUE SHOPPING
              </Button>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
