import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Package, Truck, MapPin, Clock, ExternalLink, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Order {
  id: string;
  email: string;
  total_amount: number;
  status: string;
  fulfillment_status: string | null;
  created_at: string;
  shipping_address: any;
  user_id: string | null;
  updated_at: string;
}

interface PrintifyOrder {
  printify_order_id: string;
  printify_status: string;
  tracking_number: string;
  tracking_url: string;
  updated_at: string;
}

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [printifyOrder, setPrintifyOrder] = useState<PrintifyOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('order-tracking')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          console.log('Order updated:', payload);
          if (payload.new) {
            setOrder(payload.new as Order);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'printify_orders',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          console.log('Printify order updated:', payload);
          if (payload.new) {
            setPrintifyOrder(payload.new as PrintifyOrder);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError) {
      console.error('Error fetching order:', orderError);
    } else if (orderData) {
      setOrder(orderData as Order);
    }

    const { data: printifyData, error: printifyError } = await supabase
      .from('printify_orders')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();

    if (!printifyError && printifyData) {
      setPrintifyOrder(printifyData);
    }

    setLoading(false);
  };

  const getStatusSteps = () => {
    const fulfillmentStatus = order?.fulfillment_status || 'pending';
    const steps = [
      { label: 'Order Placed', icon: CheckCircle, completed: true },
      { label: 'In Production', icon: Package, completed: order?.status !== 'pending' },
      { label: 'Shipped', icon: Truck, completed: fulfillmentStatus === 'shipped' || fulfillmentStatus === 'delivered' },
      { label: 'Delivered', icon: MapPin, completed: fulfillmentStatus === 'delivered' },
    ];
    return steps;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500';
      case 'shipped':
        return 'bg-blue-500';
      case 'processing':
        return 'bg-yellow-500';
      default:
        return 'bg-muted';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-12 px-4 flex items-center justify-center">
          <p>Loading your order...</p>
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

  const statusSteps = getStatusSteps();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          {/* Order Header */}
          <Card className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black mb-2">Track Your Order</h1>
                <p className="text-muted-foreground">
                  Order #{order.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Badge className={getStatusColor(order.fulfillment_status || 'pending')} variant="secondary">
                  {(order.fulfillment_status || 'pending').toUpperCase()}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Ordered on {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>

          {/* Status Timeline */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-6">Order Status</h2>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
              <div className="space-y-6">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={index} className="relative flex items-start gap-4">
                      <div
                        className={`relative z-10 h-8 w-8 rounded-full flex items-center justify-center ${
                          step.completed ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className={`font-medium ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {step.label}
                        </p>
                        {step.completed && (
                          <p className="text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            Completed
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Tracking Information */}
          {printifyOrder?.tracking_number && (
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4">Shipping Information</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tracking Number</p>
                    <p className="font-mono font-bold">{printifyOrder.tracking_number}</p>
                  </div>
                  {printifyOrder.tracking_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(printifyOrder.tracking_url, '_blank')}
                    >
                      Track Package
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
                {printifyOrder.printify_status && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Carrier Status</p>
                    <p className="font-medium capitalize">{printifyOrder.printify_status.replace(/_/g, ' ')}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Order Details */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Order Details</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-bold">${order.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span>{order.email}</span>
              </div>
              {order.shipping_address && (
                <div>
                  <p className="text-muted-foreground mb-2">Shipping Address</p>
                  <div className="p-4 bg-muted rounded-lg text-sm">
                    <p>{order.shipping_address.name}</p>
                    <p>{order.shipping_address.address1}</p>
                    {order.shipping_address.address2 && <p>{order.shipping_address.address2}</p>}
                    <p>
                      {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}
                    </p>
                    <p>{order.shipping_address.country}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Help Section */}
          <Card className="p-6 bg-muted">
            <h3 className="font-bold mb-2">Need Help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              If you have any questions about your order, please contact our support team.
            </p>
            <Button variant="outline" onClick={() => navigate('/faq')}>
              Visit FAQ
            </Button>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderTracking;
