import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

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
    const parsed = saved ? JSON.parse(saved) : [];
    console.log('Cart initialized from localStorage:', parsed);
    return parsed;
  });

  useEffect(() => {
    try {
      // For localStorage, we need to handle large data URLs carefully
      // Keep URLs that start with http/https, truncate or skip very large data URLs
      const itemsToStore = items.map(item => {
        const isLargeDataUrl = (url: string) => url?.startsWith('data:') && url.length > 50000;
        return {
          ...item,
          // Keep normal URLs and small data URLs, skip very large ones to prevent quota exceeded
          image: isLargeDataUrl(item.image) ? '' : item.image,
          designImageUrl: isLargeDataUrl(item.designImageUrl || '') ? '' : item.designImageUrl,
        };
      });
      localStorage.setItem('cart', JSON.stringify(itemsToStore));
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
      // Clear cart from localStorage if quota exceeded
      localStorage.removeItem('cart');
    }
  }, [items]);

  const addItem = (newItem: Omit<CartItem, 'id' | 'quantity'>) => {
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
