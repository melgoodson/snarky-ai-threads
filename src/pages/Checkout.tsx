import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, CartItem } from '@/contexts/CartContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTikTokTracking } from '@/hooks/useTikTokTracking';
import { toast } from 'sonner';
import { z } from 'zod';
import { getOverlayStyle, getSimpleHash } from '@/lib/variantUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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

interface AddressSuggestion {
  display: string;
  address1: string;
  city: string;
  state: string;
  zip: string;
}

const US_STATES = [
  { val: 'AL', name: 'Alabama' },
  { val: 'AK', name: 'Alaska' },
  { val: 'AZ', name: 'Arizona' },
  { val: 'AR', name: 'Arkansas' },
  { val: 'CA', name: 'California' },
  { val: 'CO', name: 'Colorado' },
  { val: 'CT', name: 'Connecticut' },
  { val: 'DE', name: 'Delaware' },
  { val: 'FL', name: 'Florida' },
  { val: 'GA', name: 'Georgia' },
  { val: 'HI', name: 'Hawaii' },
  { val: 'ID', name: 'Idaho' },
  { val: 'IL', name: 'Illinois' },
  { val: 'IN', name: 'Indiana' },
  { val: 'IA', name: 'Iowa' },
  { val: 'KS', name: 'Kansas' },
  { val: 'KY', name: 'Kentucky' },
  { val: 'LA', name: 'Louisiana' },
  { val: 'ME', name: 'Maine' },
  { val: 'MD', name: 'Maryland' },
  { val: 'MA', name: 'Massachusetts' },
  { val: 'MI', name: 'Michigan' },
  { val: 'MN', name: 'Minnesota' },
  { val: 'MS', name: 'Mississippi' },
  { val: 'MO', name: 'Missouri' },
  { val: 'MT', name: 'Montana' },
  { val: 'NE', name: 'Nebraska' },
  { val: 'NV', name: 'Nevada' },
  { val: 'NH', name: 'New Hampshire' },
  { val: 'NJ', name: 'New Jersey' },
  { val: 'NM', name: 'New Mexico' },
  { val: 'NY', name: 'New York' },
  { val: 'NC', name: 'North Carolina' },
  { val: 'ND', name: 'North Dakota' },
  { val: 'OH', name: 'Ohio' },
  { val: 'OK', name: 'Oklahoma' },
  { val: 'OR', name: 'Oregon' },
  { val: 'PA', name: 'Pennsylvania' },
  { val: 'RI', name: 'Rhode Island' },
  { val: 'SC', name: 'South Carolina' },
  { val: 'SD', name: 'South Dakota' },
  { val: 'TN', name: 'Tennessee' },
  { val: 'TX', name: 'Texas' },
  { val: 'UT', name: 'Utah' },
  { val: 'VT', name: 'Vermont' },
  { val: 'VA', name: 'Virginia' },
  { val: 'WA', name: 'Washington' },
  { val: 'WV', name: 'West Virginia' },
  { val: 'WI', name: 'Wisconsin' },
  { val: 'WY', name: 'Wyoming' }
];

const getStateAbbreviation = (stateName: string): string => {
  const cleanName = stateName.trim().toLowerCase();
  const found = US_STATES.find(
    st => st.name.toLowerCase() === cleanName || st.val.toLowerCase() === cleanName
  );
  return found ? found.val : '';
};

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { trackTikTokEvent } = useTikTokTracking();

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
  const [userId, setUserId] = useState<string | null>(null);
  const [showPopupAlert, setShowPopupAlert] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const handleApplyCoupon = () => {
    if (appliedCoupon) return;
    const cleaned = couponCode.trim().toUpperCase();
    if (cleaned === 'TESTPURCHASE') {
      setAppliedCoupon(cleaned);
      setCouponError(null);
      toast.success("Test coupon applied! Total reduced to $0.50");
    } else {
      setCouponError("Invalid promo code");
      toast.error("Invalid promo code");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  };


  const fetchAddressSuggestions = async (query: string) => {
    if (query.trim().length < 5) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        const items: AddressSuggestion[] = [];
        
        for (const feature of data.features || []) {
          const props = feature.properties;
          if (!props) continue;
          
          const countryCode = props.countrycode || props.country || '';
          const isUS = countryCode.toLowerCase().includes('us') || countryCode.toLowerCase().includes('united states');
          if (!isUS) continue;

          const houseNumber = props.housenumber || '';
          const street = props.street || '';
          const road = props.road || '';
          const streetName = street || road || props.name || '';
          const address1 = houseNumber ? `${houseNumber} ${streetName}` : streetName;
          
          if (!address1) continue;

          const city = props.city || props.town || props.village || props.county || '';
          const stateName = props.state || '';
          const stateAbbr = getStateAbbreviation(stateName);
          const zip = props.postcode || '';

          const displayParts = [
            address1,
            city,
            stateAbbr || stateName,
            zip
          ].filter(Boolean);

          items.push({
            display: displayParts.join(', '),
            address1,
            city,
            state: stateAbbr,
            zip
          });
        }
        setSuggestions(items);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error('Error fetching address suggestions:', err);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, address1: val }));
    setErrors(prev => ({ ...prev, address1: undefined }));
    fetchAddressSuggestions(val);
  };

  const handleZipInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, zip: val }));
    setErrors(prev => ({ ...prev, zip: undefined }));

    const cleanZip = val.trim();
    if (/^\d{5}$/.test(cleanZip)) {
      handleZipLookup(cleanZip);
    }
  };

  const handleZipLookup = async (zipCode: string) => {
    try {
      const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
      if (response.ok) {
        const data = await response.json();
        const place = data.places?.[0];
        if (place) {
          const city = place['place name'];
          const stateAbbr = place['state abbreviation'];
          setFormData(prev => ({
            ...prev,
            city: city || prev.city,
            state: stateAbbr || prev.state,
          }));
          toast.success(`ZIP recognized: ${city}, ${stateAbbr}`);
        }
      }
    } catch (err) {
      console.error('ZIP lookup failed:', err);
    }
  };

  const loadGuestCheckoutData = () => {
    const stored = localStorage.getItem("customDesign");
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('Guest checkout: loaded custom design:', parsed);
      setDesignData(parsed);
    } else if (items.length === 0) {
      navigate('/');
    }
  };

  useEffect(() => {
    // Use onAuthStateChange with INITIAL_SESSION to wait for Supabase to confirm auth
    // before deciding to redirect.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') {
        if (!session?.user) {
          // Allow guest checkout instead of forcing login redirect
          loadGuestCheckoutData();
        } else {
          checkAuthAndLoadData(session.user);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [items.length, navigate]);

  const checkAuthAndLoadData = async (confirmedUser: any) => {
    setUserId(confirmedUser.id);

    // Load profile data for auto-fill
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', confirmedUser.id)
      .single();

    if (profile) {
      setFormData(prev => ({
        email: confirmedUser.email || prev.email,
        firstName: profile.first_name || prev.firstName,
        lastName: profile.last_name || prev.lastName,
        address1: profile.address1 || prev.address1,
        address2: profile.address2 || prev.address2 || '',
        city: profile.city || prev.city,
        state: profile.state || prev.state,
        zip: profile.zip || prev.zip,
        country: profile.country || prev.country,
        phone: profile.phone || prev.phone,
      }));
    }

    // Load custom design if exists
    const stored = localStorage.getItem("customDesign");
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('Parsed design data from localStorage:', parsed);
      console.log('Price from design data:', parsed.price, typeof parsed.price);
      setDesignData(parsed);
    } else if (items.length === 0) {
      navigate('/');
    }
  };

  const getPriceFromDesign = (design: any): number => {
    const title = (design?.title || '').toLowerCase();

    // If a valid numeric price was stored, use it
    const storedPrice = Number(design?.price);
    if (!Number.isNaN(storedPrice) && storedPrice > 0) {
      return storedPrice;
    }

    // Fallbacks based on product type in the title
    if (title.includes('hood')) return 69.99; // Hoodie
    if (title.includes('mug')) return 19.99;  // Mug
    if (title.includes('card')) return 8.99;  // Card
    if (title.includes('tee') || title.includes('shirt')) return 39.99; // Tee

    // Safe final fallback
    return 39.99;
  };

  const checkoutItems: CheckoutItem[] = items.length
    ? items
    : designData
      ? [{
        id: `custom-${designData.productId}`,
        productId: designData.productId,
        title: designData.title || 'Custom T-Shirt',
        price: getPriceFromDesign(designData),
        size: designData.size || 'M',
        image: designData.image || designData.mockupUrl,
        quantity: 1,
        printifyProductId: designData.printifyProductId,
        variantId: undefined,
        designImageUrl: designData.designImageUrl || designData.image || designData.mockupUrl, // Pass design artwork
        productImageUrl: designData.productImageUrl,
      }]
      : [];

  console.log('Checkout items:', checkoutItems);
  console.log('Checkout items prices:', checkoutItems.map(item => ({ title: item.title, price: item.price, type: typeof item.price })));

  const effectiveTotal = checkoutItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * item.quantity,
    0
  );

  const discountAmount = appliedCoupon ? Math.max(0, effectiveTotal - 0.50) : 0;
  const finalTotal = appliedCoupon ? 0.50 : effectiveTotal;


  // Track InitiateCheckout
  useEffect(() => {
    if (checkoutItems.length > 0) {
      trackTikTokEvent('InitiateCheckout', {
        value: effectiveTotal,
        currency: 'USD',
        contents: checkoutItems.map(item => ({
          price: item.price,
          quantity: item.quantity,
          content_id: item.productId || item.printifyProductId,
          content_type: 'product',
          content_name: item.title,
        })),
      });
    }
  }, [checkoutItems.length, effectiveTotal, trackTikTokEvent]);

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

    // Track AddPaymentInfo
    trackTikTokEvent('AddPaymentInfo', {
      value: finalTotal,
      currency: 'USD',
      contents: checkoutItems.map(item => ({
        price: item.price,
        quantity: item.quantity,
        content_id: item.productId || item.printifyProductId,
        content_type: 'product',
        content_name: item.title,
      })),
    }, {
      email: formData.email,
      phone_number: formData.phone,
    });

    setLoading(true);

    try {
      // Save shipping info to profile if not already saved
      if (userId) {
        await supabase
          .from('profiles')
          .update({
            first_name: formData.firstName,
            last_name: formData.lastName,
            address1: formData.address1,
            address2: formData.address2,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            country: formData.country,
            phone: formData.phone,
          })
          .eq('id', userId);
      }

      // Get auth session if available (guests can checkout without one)
      const { data: { session } } = await supabase.auth.getSession();

      // Build headers — include Authorization only for authenticated users
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      // Create Stripe checkout session via direct functions URL
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            cartItems: checkoutItems,
            shippingAddress: formData,
            guestEmail: formData.email,
            couponCode: appliedCoupon || undefined,
          }),
        }
      );

      const checkoutData = await response.json();

      if (!response.ok) {
        const message = checkoutData?.error || 'Checkout request failed';
        toast.error(`Checkout error: ${message}`);
        throw new Error(message);
      }

      // Show popup alert before opening Stripe checkout
      if (checkoutData?.url) {
        // Track PlaceAnOrder
        trackTikTokEvent('PlaceAnOrder', {
          value: finalTotal,
          currency: 'USD',
          contents: checkoutItems.map(item => ({
            price: item.price,
            quantity: item.quantity,
            content_id: item.productId || item.printifyProductId,
            content_type: 'product',
            content_name: item.title,
          })),
        }, {
          email: formData.email,
          phone_number: formData.phone,
        });

        setCheckoutUrl(checkoutData.url);
        setShowPopupAlert(true);
        setLoading(false);
      } else {
        throw new Error('No checkout URL returned from backend');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to create checkout: ${message}`);
      setLoading(false);
    }
  };

  const handleOpenStripeCheckout = () => {
    if (checkoutUrl) {
      clearCart();
      window.location.href = checkoutUrl;
    }
    setShowPopupAlert(false);
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

                <div className="relative">
                  <Label htmlFor="address1">Address Line 1 *</Label>
                  <Input
                    id="address1"
                    name="address1"
                    value={formData.address1}
                    onChange={handleAddressChange}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
                    required
                    autoComplete="off"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-card text-card-foreground border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              address1: sug.address1,
                              city: sug.city || prev.city,
                              state: sug.state || prev.state,
                              zip: sug.zip || prev.zip,
                            }));
                            setShowSuggestions(false);
                            setSuggestions([]);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors border-b last:border-b-0 border-border"
                        >
                          {sug.display}
                        </button>
                      ))}
                    </div>
                  )}
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
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={(e) => {
                        const { name, value } = e.target;
                        setFormData(prev => ({ ...prev, [name]: value }));
                        setErrors(prev => ({ ...prev, [name]: undefined }));
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="">Select State</option>
                      {US_STATES.map(st => (
                        <option key={st.val} value={st.val}>{st.name}</option>
                      ))}
                    </select>
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
                      onChange={handleZipInput}
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
                {checkoutItems.map(item => {
                  // Handle image being either a string or object with src property
                  const imageUrl = typeof item.image === 'string'
                    ? item.image
                    : (item.image as any)?.src || '/placeholder.svg';
                  // Use a real mockup if available. Otherwise compose the product base image
                  // with the custom artwork so checkout does not show raw artwork alone.
                  const legacyDesignData = items.length === 0 ? designData : null;
                  const hash = item.designImageUrl ? getSimpleHash(item.designImageUrl) : '';
                  const sessionMockup = hash ? (sessionStorage.getItem(`custom_mockup_${hash}`) || '') : '';
                  const mockupSrc = sessionMockup || item.mockupUrl || legacyDesignData?.mockupUrl;
                  const productPreviewSrc = item.productImageUrl || legacyDesignData?.productImageUrl;
                  const designPreviewSrc = item.designImageUrl;
                  const hasFallbackPreview = !mockupSrc && productPreviewSrc && designPreviewSrc;

                  return (
                    <div key={item.id} className="space-y-3">
                      {/* AI Mockup Preview */}
                      {mockupSrc ? (
                        <div className="rounded-lg overflow-hidden border border-border bg-muted">
                          <img
                            src={mockupSrc}
                            alt={`${item.title} mockup preview`}
                            className="w-full h-auto object-contain"
                          />
                          <p className="text-xs text-muted-foreground text-center py-1">Product Preview</p>
                        </div>
                      ) : hasFallbackPreview && (
                        <div className="rounded-lg overflow-hidden border border-border bg-muted">
                          <div className="relative aspect-square">
                            <img
                              src={productPreviewSrc}
                              alt={`${item.title} base product`}
                              className="h-full w-full object-cover"
                            />
                            {(() => {
                              const overlay = getOverlayStyle(item.title, 'large');
                              return (
                                <div className={overlay.containerClass}>
                                  <img
                                    src={designPreviewSrc}
                                    alt={`${item.title} custom design`}
                                    className={`${overlay.imageClass} opacity-90`}
                                    style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.15))", mixBlendMode: "multiply" }}
                                  />
                                </div>
                              );
                            })()}
                          </div>
                          <p className="text-xs text-muted-foreground text-center py-1">Product Preview</p>
                        </div>
                      )}
                      {/* Item details */}
                      <div className="flex gap-4">
                        {(() => {
                          const hash = item.designImageUrl ? getSimpleHash(item.designImageUrl) : '';
                          const sessionMockup = hash ? (sessionStorage.getItem(`custom_mockup_${hash}`) || '') : '';
                          const activeMockup = sessionMockup || item.mockupUrl;

                          if (activeMockup) {
                            return (
                              <img
                                src={activeMockup}
                                alt={item.title}
                                className="w-16 h-16 object-cover rounded border border-border/50 flex-shrink-0"
                              />
                            );
                          }
                          if (item.productImageUrl && item.designImageUrl) {
                            const overlay = getOverlayStyle(item.title, 'small');
                            return (
                              <div className="w-16 h-16 relative aspect-square overflow-hidden rounded border border-border/50 bg-muted flex-shrink-0">
                                <img
                                  src={item.productImageUrl}
                                  alt={item.title}
                                  className="h-full w-full object-cover"
                                />
                                <div className={overlay.containerClass}>
                                  <img
                                    src={item.designImageUrl}
                                    alt={item.title}
                                    className={`${overlay.imageClass} opacity-90`}
                                    style={{ filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.15))", mixBlendMode: "multiply" }}
                                  />
                                </div>
                              </div>
                            );
                          }
                          return (
                            <img
                              src={imageUrl || '/placeholder.svg'}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded border border-border/50 flex-shrink-0"
                            />
                          );
                        })()}
                        <div className="flex-1">
                          <p className="font-bold text-sm">{item.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {(() => {
                              const title = item.title?.toLowerCase() || '';
                              const isMug = title.includes('mug');
                              const isJournal = title.includes('journal') || title.includes('notebook');
                              const isCard = title.includes('card') || title.includes('greeting');
                              const sizeLabel = isMug ? 'Size' : isJournal || isCard ? 'Style' : 'Size';
                              return item.size && item.size !== 'undefined' && item.size !== 'null'
                                ? `${sizeLabel}: ${item.size} | Qty: ${item.quantity}`
                                : `Qty: ${item.quantity}`;
                            })()}
                          </p>
                          <p className="text-sm font-bold mt-1">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Coupon Code Input */}
                <div className="border-t pt-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Promo Code"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        setCouponError(null);
                      }}
                      className="uppercase"
                      disabled={loading || !!appliedCoupon}
                    />
                    <Button
                      type="button"
                      variant={appliedCoupon ? "outline" : "default"}
                      onClick={handleApplyCoupon}
                      disabled={loading || !couponCode.trim()}
                    >
                      {appliedCoupon ? 'Applied' : 'Apply'}
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-destructive mt-1">{couponError}</p>
                  )}
                  {appliedCoupon && (
                    <div className="flex justify-between items-center mt-2 bg-green-500/10 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-md text-xs font-semibold border border-green-500/20">
                      <span>Promo "{appliedCoupon}" applied</span>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-green-800 dark:text-green-300 hover:underline font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${effectiveTotal.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm text-green-600 font-semibold">
                      <span>Discount ({appliedCoupon})</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className="text-green-600 font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between text-lg font-black border-t pt-2">
                    <span>TOTAL</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />

      {/* Pop-up Warning Alert Dialog */}
      <AlertDialog open={showPopupAlert} onOpenChange={setShowPopupAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Secure Payment Opening
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Your secure Stripe payment page will open in a <strong>new browser tab</strong>.
              </p>
              <p className="text-sm bg-muted p-3 rounded-md">
                💡 <strong>Important:</strong> If you don't see the checkout page, please check if your browser blocked the pop-up. Look for a pop-up notification in your address bar and click "Allow" to continue.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleOpenStripeCheckout}>
              Continue to Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Checkout;
