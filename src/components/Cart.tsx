import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const Cart = () => {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth', { state: { returnTo: '/checkout' } });
    } else {
      navigate('/checkout');
    }
  };

  const FREE_SHIPPING_THRESHOLD = 50;
  const isFreeShipping = totalPrice >= FREE_SHIPPING_THRESHOLD;
  const amountNeeded = FREE_SHIPPING_THRESHOLD - totalPrice;
  const progressPercentage = Math.min((totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs flex items-center justify-center text-primary-foreground font-bold">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-2xl font-black">YOUR CART</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full pt-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                Your cart is empty
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Add some snarky threads to get started
              </p>
            </div>
          ) : (
            <>
              <div className="p-4 bg-muted/40 rounded-xl border border-border/50 mb-4 space-y-2">
                <p className="text-sm font-semibold flex justify-between">
                  <span>
                    {isFreeShipping 
                      ? "🎉 You've unlocked FREE shipping!" 
                      : `You're only $${amountNeeded.toFixed(2)} away from FREE shipping!`
                    }
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    ${totalPrice.toFixed(2)} / $50
                  </span>
                </p>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-500 ease-out" 
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-auto space-y-4">
                {items.map(item => {
                  const hasFallbackPreview = !item.mockupUrl && item.productImageUrl && item.designImageUrl;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 p-4 border border-border rounded-lg bg-card"
                    >
                      {item.mockupUrl ? (
                        <div className="rounded-lg overflow-hidden border border-border/50 bg-muted relative">
                          <img
                            src={item.mockupUrl}
                            alt={`${item.title} preview`}
                            className="w-full h-auto object-contain max-h-48"
                          />
                          <span className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                            Custom Preview
                          </span>
                        </div>
                      ) : hasFallbackPreview && (
                        <div className="relative aspect-square max-h-48 overflow-hidden rounded-lg border border-border/50 bg-muted">
                          <img
                            src={item.productImageUrl}
                            alt={`${item.title} base product`}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center p-8">
                            <img
                              src={item.designImageUrl}
                              alt={`${item.title} custom design`}
                              className="max-h-[70%] max-w-[70%] object-contain opacity-90"
                              style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.15))" }}
                            />
                          </div>
                          <span className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                            Custom Preview
                          </span>
                        </div>
                      )}

                      <div className="flex gap-4">
                        {!item.mockupUrl && !hasFallbackPreview && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-20 h-20 object-cover rounded flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-bold text-sm">{item.title}</h4>
                              <p className="text-xs text-muted-foreground">
                                Size: {item.size}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-bold w-8 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="font-bold">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-border pt-4 space-y-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>TOTAL</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                >
                  CHECKOUT
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
