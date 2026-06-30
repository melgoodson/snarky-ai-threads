import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getOverlayStyle } from '@/lib/variantUtils';

const TTP_COOKIE_KEY = '_ttp';
const STORED_TTCLID_KEY = 'sah_ttclid';
const STORED_USER_EMAIL = 'sah_user_email';
const STORED_USER_PHONE = 'sah_user_phone';

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  size: string;
  image: string;
  quantity: number;
  printifyProductId?: string;
  variantId?: string;
  designImageUrl?: string; // The actual design artwork URL for printing
  mockupUrl?: string; // AI-generated product mockup preview
  productImageUrl?: string; // Base product image used for fallback previews
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id' | 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    try {
      // Strip large data URLs before saving to prevent quota exceeded errors
      const itemsToStore = items.map(item => ({
        ...item,
        image: item.image?.startsWith('data:') ? '' : item.image,
        designImageUrl: item.designImageUrl?.startsWith('data:') ? '' : item.designImageUrl,
        mockupUrl: item.mockupUrl?.startsWith('data:') ? '' : item.mockupUrl,
        productImageUrl: item.productImageUrl?.startsWith('data:') ? '' : item.productImageUrl,
      }));
      localStorage.setItem('cart', JSON.stringify(itemsToStore));
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
      // Clear cart from localStorage if quota exceeded
      localStorage.removeItem('cart');
    }
  }, [items]);

  const addItem = (newItem: Omit<CartItem, 'id' | 'quantity'>) => {
    // Dispatch AddToCart event to TikTok Events API
    try {
      const ttp = getCookie(TTP_COOKIE_KEY);
      const ttclid = sessionStorage.getItem(STORED_TTCLID_KEY);
      const email = localStorage.getItem(STORED_USER_EMAIL);
      const phone = localStorage.getItem(STORED_USER_PHONE);
      const eventId = crypto.randomUUID();

      // 1. Browser-side hybrid pixel tracking (standard client pixel)
      if (typeof window !== 'undefined' && (window as any).ttq) {
        try {
          if (email || phone) {
            (window as any).ttq.identify({
              email: email || undefined,
              phone_number: phone || undefined,
            });
          }
          (window as any).ttq.track('AddToCart', {
            value: newItem.price,
            currency: 'USD',
            contents: [{
              price: newItem.price,
              quantity: 1,
              content_id: newItem.productId || newItem.printifyProductId,
              content_type: 'product',
              content_name: newItem.title
            }]
          }, {
            event_id: eventId
          });
          console.log(`[TikTok Browser Event] AddToCart tracked with event_id: ${eventId}`);
        } catch (sdkError) {
          console.debug('Error in browser-side AddToCart tracking:', sdkError);
        }
      }

      // 2. Server-side hybrid Events API tracking (Supabase Edge Function)
      void supabase.functions.invoke('tiktok-events', {
        body: {
          event: 'AddToCart',
          event_id: eventId,
          timestamp: new Date().toISOString(),
          context: {
            ad: { callback: ttclid || null },
            user: {
              email: email || null,
              phone_number: phone || null,
              external_id: localStorage.getItem('snarky_visitor_id') || null,
              ttp: ttp || null
            },
            page: { url: window.location.href, referrer: document.referrer || null }
          },
          properties: {
            value: newItem.price,
            currency: 'USD',
            contents: [{
              price: newItem.price,
              quantity: 1,
              content_id: newItem.productId || newItem.printifyProductId,
              content_type: 'product',
              content_name: newItem.title
            }]
          }
        }
      }).catch(() => {});
    } catch (e) {
      console.debug('TikTok AddToCart error:', e);
    }

    setItems(prev => {
      const existing = prev.find(
        item => item.productId === newItem.productId && item.size === newItem.size
      );

      if (existing) {
        toast.success('Updated quantity in cart');
        return prev.map(item =>
          item.id === existing.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // Trigger custom toast confirmation with clear next steps
      toast.custom((t) => (
        <div className="bg-card text-card-foreground border border-border shadow-2xl p-5 rounded-2xl w-full max-w-sm space-y-4 pointer-events-auto flex flex-col animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex-shrink-0 border border-border relative">
              {(() => {
                if (newItem.mockupUrl) {
                  return (
                    <img
                      src={newItem.mockupUrl}
                      alt={newItem.title}
                      className="w-full h-full object-cover"
                    />
                  );
                }
                if (newItem.productImageUrl && newItem.designImageUrl) {
                  const overlay = getOverlayStyle(newItem.title, 'small');
                  return (
                    <div className="w-full h-full relative aspect-square overflow-hidden bg-muted">
                      <img
                        src={newItem.productImageUrl}
                        alt={newItem.title}
                        className="h-full w-full object-cover"
                      />
                      <div className={overlay.containerClass}>
                        <img
                          src={newItem.designImageUrl}
                          alt={newItem.title}
                          className={`${overlay.imageClass} opacity-90`}
                          style={{ filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.15))", mixBlendMode: "multiply" }}
                        />
                      </div>
                    </div>
                  );
                }
                return (
                  <img
                    src={newItem.image}
                    alt={newItem.title}
                    className="w-full h-full object-cover"
                  />
                );
              })()}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-black text-sm text-foreground uppercase tracking-wider">Added to Cart!</h4>
              <p className="text-xs text-muted-foreground truncate">{newItem.title}</p>
              <p className="text-xs font-bold text-primary mt-0.5">${newItem.price.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                toast.dismiss(t);
                window.dispatchEvent(new CustomEvent('open-cart'));
              }}
              className="px-2 py-2 bg-primary text-primary-foreground text-xs font-black rounded-lg shadow-sm hover:opacity-90 transition-opacity text-center uppercase tracking-wider"
            >
              View Cart
            </button>
            <button
              onClick={() => {
                toast.dismiss(t);
                window.location.href = '/checkout';
              }}
              className="px-2 py-2 bg-foreground text-background text-xs font-black rounded-lg shadow-sm hover:opacity-90 transition-opacity text-center uppercase tracking-wider"
            >
              Checkout
            </button>
            <button
              onClick={() => {
                toast.dismiss(t);
              }}
              className="px-2 py-2 bg-secondary text-secondary-foreground text-xs font-black rounded-lg shadow-sm hover:opacity-90 transition-opacity text-center uppercase tracking-wider border border-border"
            >
              Shop More
            </button>
          </div>
        </div>
      ), {
        duration: 6000,
      });

      return [...prev, { ...newItem, id: crypto.randomUUID(), quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    toast.success('Removed from cart');
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart');
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
