import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ShoppingCart, Trash2, Plus, Minus, Gift, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getOverlayStyle } from '@/lib/variantUtils';

export const Cart = () => {
  const {
    items,
    removeItem,
    updateQuantity,
    totalItems,
    subtotalPrice,
    bogoDiscount,
    freeItemsCount,
    totalPrice,
  } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpenCart = () => setOpen(true);
    window.addEventListener('open-cart', handleOpenCart);
    return () => window.removeEventListener('open-cart', handleOpenCart);
  }, []);

  const handleCheckout = async () => {
    setOpen(false);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth', { state: { returnTo: '/checkout' } });
    } else {
      navigate('/checkout');
    }
  };

  const FREE_SHIPPING_THRESHOLD = 50;
  const isFreeShipping = totalPrice >= FREE_SHIPPING_THRESHOLD;
  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice);
  const progressPercentage = Math.min((totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100);

  const rem = totalItems % 4;
  const itemsNeededForFree = rem === 0 ? 0 : 4 - rem;

  const handleClaimFreeFourthItem = () => {
    if (items.length === 0) return;
    // Increment the lowest-priced item in cart by 1 so the 4th item is immediately FREE
    const target = [...items].sort((a, b) => a.price - b.price)[0];
    updateQuantity(target.id, target.quantity + 1);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
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

        <div className="flex flex-col h-full pt-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                Your cart is empty
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Add some snarky threads to get started
              </p>
              <div className="mt-4 inline-flex items-center gap-2 bg-primary/10 border border-primary/25 text-primary px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider">
                <Gift className="h-4 w-4" />
                Sale: Buy 3, Get 1 FREE Storewide
              </div>
            </div>
          ) : (
            <>
              {/* Buy 3, Get 1 Free Promotion Banner */}
              <div className="p-3.5 bg-primary/10 rounded-xl border border-primary/30 mb-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-primary">
                    <Gift className="h-4 w-4 shrink-0" />
                    <span>
                      {freeItemsCount > 0 && rem === 0
                        ? `🎉 BUY 3, GET 1 FREE APPLIED! (${freeItemsCount} item${freeItemsCount > 1 ? 's' : ''} FREE)`
                        : rem === 3
                        ? "🎁 You have 3 items! Your 4th item is 100% FREE!"
                        : `🔥 Buy 3, Get 1 FREE: Add ${itemsNeededForFree} more for a FREE item!`}
                    </span>
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full shrink-0">
                    {totalItems % 4 === 0 && freeItemsCount > 0 ? 'UNLOCKED' : `${totalItems % 4}/4`}
                  </span>
                </div>
                {rem === 3 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="default"
                    className="w-full h-8 text-xs font-black uppercase tracking-wider"
                    onClick={handleClaimFreeFourthItem}
                  >
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    + Add 4th Item for FREE ($0.00)
                  </Button>
                )}
              </div>

              {/* Free Shipping Progress */}
              <div className="p-3 bg-muted/40 rounded-xl border border-border/50 mb-4 space-y-1.5">
                <p className="text-xs font-semibold flex justify-between">
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
                <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-500 ease-out" 
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-auto space-y-4">
                {items.map(item => {
                  const isCustomized = item.title.toLowerCase().startsWith('custom');
                  const hasLargeMockup = isCustomized && item.mockupUrl;
                  const hasLargeFallback = isCustomized && !item.mockupUrl && item.productImageUrl && item.designImageUrl;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 p-4 border border-border rounded-lg bg-card"
                    >
                      {hasLargeMockup ? (
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
                      ) : hasLargeFallback && (
                        <div className="relative aspect-square max-h-48 overflow-hidden rounded-lg border border-border/50 bg-muted">
                          <img
                            src={item.productImageUrl}
                            alt={`${item.title} base product`}
                            className="h-full w-full object-cover"
                          />
                          {(() => {
                            const overlay = getOverlayStyle(item.title);
                            return (
                              <div className={overlay.containerClass}>
                                <img
                                  src={item.designImageUrl}
                                  alt={`${item.title} custom design`}
                                  className={`${overlay.imageClass} opacity-90`}
                                  style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.15))", mixBlendMode: "multiply" }}
                                />
                              </div>
                            );
                          })()}
                          <span className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                            Custom Preview
                          </span>
                        </div>
                      )}

                      <div className="flex gap-4">
                        {(() => {
                          if (item.mockupUrl) {
                            return (
                              <img
                                src={item.mockupUrl}
                                alt={item.title}
                                className="w-20 h-20 object-cover rounded flex-shrink-0 border border-border/50"
                              />
                            );
                          }
                          if (item.productImageUrl && item.designImageUrl) {
                            const overlay = getOverlayStyle(item.title, 'small');
                            return (
                              <div className="w-20 h-20 relative aspect-square overflow-hidden rounded border border-border/50 bg-muted flex-shrink-0">
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
                              src={item.image}
                              alt={item.title}
                              className="w-20 h-20 object-cover rounded flex-shrink-0 border border-border/50"
                            />
                          );
                        })()}
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

              <div className="border-t border-border pt-4 space-y-2.5">
                {bogoDiscount > 0 && (
                  <>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Subtotal ({totalItems} items)</span>
                      <span>${subtotalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-green-500">
                      <span>Buy 3, Get 1 Free ({freeItemsCount} FREE)</span>
                      <span>-${bogoDiscount.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-lg font-black">
                  <span>TOTAL</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full font-black"
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
