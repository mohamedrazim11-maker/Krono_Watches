"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { Product } from "@/lib/api";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  wishlist: Product[];
  isCartReady: boolean;
  totalItems: number;
  subtotal: number;
  grandTotal: number;
  discountAmount: number;
  appliedCoupon: string;
  couponDiscountPercent: number;
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  isCheckoutOpen: boolean;
  toastMessage: string | null;
  setIsCartOpen: (open: boolean) => void;
  setIsWishlistOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  applyCoupon: (code: string) => boolean;
  showToast: (msg: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "krono_cart";
const WISHLIST_STORAGE_KEY = "krono_wishlist";
const COUPON_STORAGE_KEY = "krono_coupon";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string>("");
  const [couponDiscountPercent, setCouponDiscountPercent] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState<boolean>(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  }, []);

  // Load saved state before enabling persistence so hydration cannot overwrite it.
  useEffect(() => {
    try {
      // Ensure initial cart is completely empty by default by purging any stale demo items
      const RESET_FLAG = "krono_cart_clean_v3";
      if (!localStorage.getItem(RESET_FLAG)) {
        localStorage.removeItem(CART_STORAGE_KEY);
        sessionStorage.removeItem(CART_STORAGE_KEY);
        localStorage.setItem(RESET_FLAG, "true");
        setCart([]);
        setHydrated(true);
        return;
      }

      const rawCart =
        sessionStorage.getItem(CART_STORAGE_KEY) ||
        localStorage.getItem(CART_STORAGE_KEY);
      if (rawCart) {
        const parsed: unknown = JSON.parse(rawCart);
        if (Array.isArray(parsed)) {
          const restoredCart = parsed.filter(
            (item): item is CartItem =>
              Boolean(
                item &&
                  typeof item === "object" &&
                  item.product &&
                  typeof item.product.id === "string" &&
                  Number.isFinite(item.product.price) &&
                  Number.isInteger(item.quantity) &&
                  item.quantity > 0
              )
          );
          setCart(restoredCart);
        }
      }

      const rawCoupon =
        sessionStorage.getItem(COUPON_STORAGE_KEY) ||
        localStorage.getItem(COUPON_STORAGE_KEY);
      if (rawCoupon === "MONO20" || rawCoupon === "ROYAL20" || rawCoupon === "KRONO20") {
        setAppliedCoupon(rawCoupon);
        setCouponDiscountPercent(20);
      }

      const rawWishlist =
        sessionStorage.getItem(WISHLIST_STORAGE_KEY) ||
        localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (rawWishlist) {
        const parsedWish: unknown = JSON.parse(rawWishlist);
        if (Array.isArray(parsedWish)) {
          setWishlist(
            parsedWish.filter(
              (product): product is Product =>
                Boolean(
                  product &&
                    typeof product === "object" &&
                    typeof product.id === "string"
                )
            )
          );
        }
      }
    } catch (e) {
      console.error("Failed to load cart from storage:", e);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Step 3 - Sync state persistence to sessionStorage & localStorage
  useEffect(() => {
    if (!hydrated) return;
    try {
      const cartJson = JSON.stringify(cart);
      sessionStorage.setItem(CART_STORAGE_KEY, cartJson);
      localStorage.setItem(CART_STORAGE_KEY, cartJson);
    } catch (e) {
      console.error("Failed to save cart to storage:", e);
    }
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const wishJson = JSON.stringify(wishlist);
      sessionStorage.setItem(WISHLIST_STORAGE_KEY, wishJson);
      localStorage.setItem(WISHLIST_STORAGE_KEY, wishJson);
    } catch (e) {
      console.error("Failed to save wishlist to storage:", e);
    }
  }, [wishlist, hydrated]);

  // Step 1 - The "Add to Cart" Logic
  // 1. Listen for click event on Add to Cart button
  // 2. Pass Product Data (ProductID, Title, Price, Image)
  // 3. Check existing items: If yes, increment quantity; If no, add new item with quantity
  // 4. Update Badge Counter dynamically
  const addToCart = useCallback(
    (product: Product, quantity = 1) => {
      if (
        !product ||
        !product.id ||
        product.in_stock === false ||
        (typeof product.stock_count === "number" && product.stock_count <= 0)
      ) {
        showToast("This item is currently out of stock.");
        return;
      }

      const requestedQuantity = Number.isFinite(quantity)
        ? Math.max(1, Math.floor(quantity))
        : 1;
      const existingQuantity =
        cart.find((item) => item.product.id === product.id)?.quantity || 0;
      const availableQuantity =
        typeof product.stock_count === "number"
          ? Math.max(0, product.stock_count - existingQuantity)
          : requestedQuantity;
      const safeQuantity = Math.min(requestedQuantity, availableQuantity);
      if (safeQuantity === 0) {
        showToast("The maximum available quantity is already in your cart.");
        return;
      }

      setCart((prevCart) => {
        const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);

        if (existingIndex > -1) {
          const updatedItem = {
            ...prevCart[existingIndex],
            product,
            quantity:
              typeof product.stock_count === "number"
                ? Math.min(prevCart[existingIndex].quantity + safeQuantity, product.stock_count)
                : prevCart[existingIndex].quantity + safeQuantity,
          };
          // Move the updated product to the top so it is immediately visible
          return [updatedItem, ...prevCart.filter((_, index) => index !== existingIndex)];
        } else {
          // Prepend new item to the top of the cart
          return [
            {
              product,
              quantity: safeQuantity,
            },
            ...prevCart,
          ];
        }
      });

      showToast(`Added ${safeQuantity > 1 ? `${safeQuantity} × ` : ""}"${product.name}" to Cart`);
    },
    [cart, showToast]
  );

  // Step 2 - "Remove Item" Feature using Array filter()
  const removeFromCart = useCallback(
    (productId: string) => {
      setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
      showToast("Item removed from Cart");
    },
    [showToast]
  );

  // Step 2 - Quantity Up/Down Controls & Edge Case Rule (< 1 removes item)
  const updateQuantity = useCallback(
    (productId: string, delta: number) => {
      if (!Number.isFinite(delta) || delta === 0) return;
      setCart((prevCart) =>
        prevCart
          .map((item) => {
            if (item.product.id === productId) {
              const newQuantity = item.quantity + Math.trunc(delta);
              if (
                newQuantity <= 0 ||
                (typeof item.product.stock_count === "number" &&
                  item.product.stock_count <= 0)
              ) {
                return null;
              }
              const maxQuantity =
                typeof item.product.stock_count === "number"
                  ? item.product.stock_count
                  : Number.POSITIVE_INFINITY;
              return {
                ...item,
                quantity: Math.min(newQuantity, maxQuantity),
              };
            }
            return item;
          })
          .filter((item): item is CartItem => item !== null)
      );
    },
    []
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedCoupon("");
    setCouponDiscountPercent(0);
    try {
      sessionStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(CART_STORAGE_KEY);
      sessionStorage.removeItem(COUPON_STORAGE_KEY);
      localStorage.removeItem(COUPON_STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear cart storage:", e);
    }
  }, []);

  const toggleWishlist = useCallback(
    (product: Product) => {
      if (!product || !product.id) return;
      setWishlist((prevWishlist) => {
        const exists = prevWishlist.some((item) => item.id === product.id);
        if (exists) {
          showToast(`Removed "${product.name}" from Wishlist`);
          return prevWishlist.filter((item) => item.id !== product.id);
        } else {
          showToast(`Added "${product.name}" to Wishlist`);
          return [...prevWishlist, product];
        }
      });
    },
    [showToast]
  );

  const isInWishlist = useCallback(
    (productId: string) => {
      return wishlist.some((item) => item.id === productId);
    },
    [wishlist]
  );

  const applyCoupon = useCallback(
    (code: string) => {
      const clean = code.trim().toUpperCase();
      if (clean === "MONO20" || clean === "ROYAL20" || clean === "KRONO20") {
        setAppliedCoupon(clean);
        setCouponDiscountPercent(20);
        try {
          sessionStorage.setItem(COUPON_STORAGE_KEY, clean);
          localStorage.setItem(COUPON_STORAGE_KEY, clean);
        } catch (e) {
          console.error("Failed to save coupon:", e);
        }
        showToast(`Promo code applied: 20% discount`);
        return true;
      }
      return false;
    },
    [showToast]
  );

  // Step 1 - Dynamically updated badge counter (total item quantity)
  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }, [cart]);

  // Step 2 - Live Total Calculation based on Price x Quantity
  const subtotal = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + (Number(item.product.price) || 0) * (Number(item.quantity) || 0),
      0
    );
  }, [cart]);

  const discountAmount = useMemo(() => {
    return Math.round((subtotal * couponDiscountPercent) / 100);
  }, [subtotal, couponDiscountPercent]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const value = {
    cart,
    wishlist,
    isCartReady: hydrated,
    totalItems,
    subtotal,
    grandTotal,
    discountAmount,
    appliedCoupon,
    couponDiscountPercent,
    isCartOpen,
    isWishlistOpen,
    isCheckoutOpen,
    toastMessage,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsCheckoutOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleWishlist,
    isInWishlist,
    applyCoupon,
    showToast,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
