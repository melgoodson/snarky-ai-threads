import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, CartItem } from '@/contexts/CartContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const checkoutSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  address1: z.string().trim().min(1, 'Address is required').max(200),
  address2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1, 'City is required').max(100),
  state: z.string().trim().min(1, 'State is required').max(100),
  zip: z.string().trim().min(1, 'ZIP code is required').max(20),
  country: z.string().trim().min(1, 'Country is required').max(100),
  phone: z.string().trim().min(1, 'Phone is required').max(30),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

type CheckoutItem = CartItem;

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  
  console.log('Checkout page - cart items:', items);
  console.log('Checkout page - total price:', totalPrice);
  const [loading, setLoading] = useState(false);
  const [designData, setDesignData] = useState<any>(null);
  const [formData, setFormData] = useState<CheckoutForm>({
    email: '',
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    phone: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({});

  useEffect(() => {
    const stored = localStorage.getItem("customDesign");
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('Parsed design data from localStorage:', parsed);
      console.log('Price from design data:', parsed.price, typeof parsed.price);
      setDesignData(parsed);
    } else if (items.length === 0) {
      navigate('/');
    }
  }, [items.length, navigate]);

  const checkoutItems: CheckoutItem[] = items.length
    ? items
    : designData
      ? [{
          id: `custom-${designData.productId}`,
          productId: designData.productId,
          title: designData.title,
          price: Number(designData.price) || 0,
          size: designData.size || 'M',
          image: designData.image || designData.mockupUrl,
          quantity: 1,
          printifyProductId: designData.printifyProductId,
          variantId: undefined,
        }]
      : [];

  console.log('Checkout items:', checkoutItems);
  console.log('Checkout items prices:', checkoutItems.map(item => ({ title: item.title, price: item.price, type: typeof item.price })));

  const effectiveTotal = checkoutItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * item.quantity,
    0
  );

  if (!designData && checkoutItems.length === 0) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = checkoutSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof CheckoutForm, string>> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof CheckoutForm] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error('Please fix the form errors');
      return;
    }

    setLoading(true);

    try {
      // Create Stripe checkout session
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
        'create-checkout',
        {
          body: {
            cartItems: checkoutItems,
            shippingAddress: formData,
          },
        }
      );

      if (checkoutError) throw checkoutError;

      // Redirect to Stripe checkout
      if (checkoutData?.url) {
        window.location.href = checkoutData.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Failed to create checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-12 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div>
            <h1 className="text-3xl font-black mb-6">CHECKOUT</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Contact Information</h2>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="address1">Address Line 1 *</Label>
                  <Input
                    id="address1"
                    name="address1"
                    value={formData.address1}
                    onChange={handleChange}
                    required
                  />
                  {errors.address1 && (
                    <p className="text-sm text-destructive mt-1">{errors.address1}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address2">Address Line 2</Label>
                  <Input
                    id="address2"
                    name="address2"
                    value={formData.address2}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                    {errors.state && (
                      <p className="text-sm text-destructive mt-1">{errors.state}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zip">ZIP Code *</Label>
                    <Input
                      id="zip"
                      name="zip"
                      value={formData.zip}
                      onChange={handleChange}
                      required
                    />
                    {errors.zip && (
                      <p className="text-sm text-destructive mt-1">{errors.zip}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                    />
                    {errors.country && (
                      <p className="text-sm text-destructive mt-1">{errors.country}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'PROCESSING...' : 'PLACE ORDER'}
              </Button>
            </form>
          </div>

          <div>
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-black mb-4">ORDER SUMMARY</h2>
              <div className="space-y-4">
                {checkoutItems.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Size: {item.size} | Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-bold mt-1">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${effectiveTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>Calculated at fulfillment</span>
                  </div>
                  <div className="flex justify-between text-lg font-black border-t pt-2">
                    <span>TOTAL</span>
                    <span>${effectiveTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
