"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import GuestCheckoutForm from "./GuestCheckoutForm";

export const CartSheet = () => {
  const { items, removeItem, updateQuantity, getTotalItems, getTotalPrice, clearCart } = useCartStore();
  const { toast } = useToast();
  const [showGuestCheckout, setShowGuestCheckout] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCheckout = () => {
    toast({
      title: "Order Placed!",
      description: "Your order has been successfully placed.",
    });
    clearCart();
  };

  const handleGuestCheckoutComplete = () => {
    setShowGuestCheckout(false);
  };

  // Only show the badge on the client side to avoid hydration mismatches
  const totalItems = isClient ? getTotalItems() : 0;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription>
            {totalItems} item(s) in your cart
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          {!showGuestCheckout ? (
            <>
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Your cart is empty
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                      <div className="h-16 w-16 rounded bg-muted flex items-center justify-center">
                        <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          KSh {item.price.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 ml-auto"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t pt-4 space-y-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>KSh {getTotalPrice().toLocaleString()}</span>
                  </div>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => setShowGuestCheckout(true)}
                    >
                      Checkout as Guest
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <GuestCheckoutForm onComplete={handleGuestCheckoutComplete} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};