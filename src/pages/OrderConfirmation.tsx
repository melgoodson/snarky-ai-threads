import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
      if (!orderId) return;

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching order:', error);
      } else if (data) {
        setOrder(data);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

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
              <h1 className="text-3xl font-black mb-2">ORDER CONFIRMED!</h1>
              <p className="text-muted-foreground">
                Thanks for your order. We've sent a confirmation to {order.email}
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
                    Your order is being processed and will be sent to Printify for
                    fulfillment. You'll receive tracking information once your items ship.
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
