import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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

      void supabase.functions.invoke('tiktok-events', {
        body: {
          event: 'AddToCart',
          event_id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          context: {
            ad: { callback: ttclid || null },
            user: { email: email || null, phone_number: phone || null, ttp: ttp || null },
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

      toast.success('Added to cart');
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
