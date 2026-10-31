"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { Product } from "@/lib/api";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CouponOffer {
  code: string;
  type: "percent" | "fixed";
  value: number; // percentage (e.g. 20) or fixed amount in LKR (e.g. 5000)
  minSpend?: number;
  description: string;
}

export const SPECIAL_OFFERS: CouponOffer[] = [
  { code: "ROYAL20", type: "percent", value: 20, description: "20% OFF all Swiss & Luxury Calibres" },
  { code: "WELCOME10", type: "percent", value: 10, description: "10% OFF first horological order" },
  { code: "VIP15", type: "percent", value: 15, description: "15% OFF for certified collectors" },
  { code: "KRONO500", type: "fixed", value: 500, minSpend: 3000, description: "Flat LKR 500 OFF on orders over LKR 3,000" },
  { code: "FESTIVE1000", type: "fixed", value: 1000, minSpend: 4000, description: "Flat LKR 1,000 Festive Season Voucher" },
  { code: "SAVE250", type: "fixed", value: 250, description: "Flat LKR 250 OFF on any timepiece order" },
];

interface CartContextType {
  cart: CartItem[];
  wishlist: Product[];
  isCartReady: boolean;
  totalItems: number;
  subtotal: number;
  grandTotal: number;
  discountAmount: number;
  appliedCoupon: string;
  couponType: "percent" | "fixed" | null;
  couponValue: number;
  couponDiscountPercent: number;
  specialOffers: CouponOffer[];
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
  setQuantity: (productId: string, quantity: number) => void;
  removeMultipleFromCart: (productIds: string[]) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  moveToCart: (product: Product) => void;
  moveAllWishlistToCart: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
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
  const [couponType, setCouponType] = useState<"percent" | "fixed" | null>(null);
  const [couponValue, setCouponValue] = useState<number>(0);
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
      const RESET_FLAG = "krono_cart_empty_v11";
      if (!localStorage.getItem(RESET_FLAG)) {
        localStorage.removeItem(CART_STORAGE_KEY);
        sessionStorage.removeItem(CART_STORAGE_KEY);
        // Clear any user-specific cart storage as well
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith("krono_cart_")) {
            localStorage.removeItem(key);
          }
        }
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
      if (rawCoupon) {
        try {
          const parsedCoupon = JSON.parse(rawCoupon);
          if (parsedCoupon && parsedCoupon.code) {
            setAppliedCoupon(parsedCoupon.code);
            setCouponType(parsedCoupon.type || "percent");
            setCouponValue(parsedCoupon.value || 0);
            if (parsedCoupon.type === "percent") {
              setCouponDiscountPercent(parsedCoupon.value || 0);
            }
          }
        } catch {
          const offer = SPECIAL_OFFERS.find((o) => o.code === rawCoupon);
          if (offer) {
            setAppliedCoupon(offer.code);
            setCouponType(offer.type);
            setCouponValue(offer.value);
            if (offer.type === "percent") {
              setCouponDiscountPercent(offer.value);
            }
          } else if (rawCoupon === "MONO20" || rawCoupon === "ROYAL20" || rawCoupon === "KRONO20") {
            setAppliedCoupon(rawCoupon);
            setCouponType("percent");
            setCouponValue(20);
            setCouponDiscountPercent(20);
          }
        }
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
          return prevCart.map((item, index) => (index === existingIndex ? updatedItem : item));
        } else {
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

  const setQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (!Number.isFinite(quantity)) return;
      const targetQty = Math.trunc(quantity);
      if (targetQty <= 0) {
        removeFromCart(productId);
        return;
      }
      setCart((prevCart) =>
        prevCart.map((item) => {
          if (item.product.id === productId) {
            const maxQuantity =
              typeof item.product.stock_count === "number"
                ? item.product.stock_count
                : Number.POSITIVE_INFINITY;
            return {
              ...item,
              quantity: Math.max(1, Math.min(targetQty, maxQuantity)),
            };
          }
          return item;
        })
      );
    },
    [removeFromCart]
  );

  const removeMultipleFromCart = useCallback(
    (productIds: string[]) => {
      if (!productIds || productIds.length === 0) return;
      const idSet = new Set(productIds);
      setCart((prevCart) => prevCart.filter((item) => !idSet.has(item.product.id)));
      showToast(`${productIds.length} item${productIds.length > 1 ? "s" : ""} removed from Cart`);
    },
    [showToast]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedCoupon("");
    setCouponType(null);
    setCouponValue(0);
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

  const removeCoupon = useCallback(() => {
    setAppliedCoupon("");
    setCouponType(null);
    setCouponValue(0);
    setCouponDiscountPercent(0);
    try {
      sessionStorage.removeItem(COUPON_STORAGE_KEY);
      localStorage.removeItem(COUPON_STORAGE_KEY);
    } catch {}
    showToast("Promo code removed.");
  }, [showToast]);

  // Wishlist Logic
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

  // 1. Wishlist: Move wishlist product to cart
  const moveToCart = useCallback(
    (product: Product) => {
      if (!product || !product.id) return;
      addToCart(product, 1);
      setWishlist((prev) => prev.filter((item) => item.id !== product.id));
      showToast(`Moved "${product.name}" to Cart.`);
    },
    [addToCart, showToast]
  );

  const moveAllWishlistToCart = useCallback(() => {
    if (wishlist.length === 0) return;
    const count = wishlist.length;
    wishlist.forEach((p) => {
      addToCart(p, 1);
    });
    setWishlist([]);
    showToast(`Moved all ${count} items from Wishlist to Cart.`);
  }, [wishlist, addToCart, showToast]);

  // 3. Coupon and Discount System: Percentage and fixed discounts
  const applyCoupon = useCallback(
    (code: string) => {
      const clean = code.trim().toUpperCase();
      if (!clean) return false;

      const offer = SPECIAL_OFFERS.find((o) => o.code === clean);
      if (offer) {
        setAppliedCoupon(offer.code);
        setCouponType(offer.type);
        setCouponValue(offer.value);
        if (offer.type === "percent") {
          setCouponDiscountPercent(offer.value);
        } else {
          setCouponDiscountPercent(0);
        }
        try {
          const serialized = JSON.stringify({ code: offer.code, type: offer.type, value: offer.value });
          sessionStorage.setItem(COUPON_STORAGE_KEY, serialized);
          localStorage.setItem(COUPON_STORAGE_KEY, serialized);
        } catch {}
        const desc = offer.type === "percent" ? `${offer.value}% off` : `LKR ${offer.value.toLocaleString()} fixed discount`;
        showToast(`Promo code applied: ${desc}`);
        return true;
      }

      if (clean === "KRONO5000") return applyCoupon("KRONO500");
      if (clean === "LUXURY10000") return applyCoupon("FESTIVE1000");
      if (clean === "FESTIVE2500") return applyCoupon("FESTIVE1000");

      if (clean === "MONO20" || clean === "ROYAL20" || clean === "KRONO20") {
        setAppliedCoupon(clean);
        setCouponType("percent");
        setCouponValue(20);
        setCouponDiscountPercent(20);
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

  // 3. Coupon and Discount System: Percentage & Fixed Discount calculation
  const discountAmount = useMemo(() => {
    if (!appliedCoupon || couponValue <= 0) return 0;
    if (couponType === "fixed") {
      return Math.min(subtotal, couponValue);
    }
    return Math.round((subtotal * couponValue) / 100);
  }, [subtotal, appliedCoupon, couponType, couponValue]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const value = useMemo(
    () => ({
      cart,
      wishlist,
      isCartReady: hydrated,
      totalItems,
      subtotal,
      grandTotal,
      discountAmount,
      appliedCoupon,
      couponType,
      couponValue,
      couponDiscountPercent,
      specialOffers: SPECIAL_OFFERS,
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
      setQuantity,
      removeMultipleFromCart,
      clearCart,
      toggleWishlist,
      isInWishlist,
      moveToCart,
      moveAllWishlistToCart,
      applyCoupon,
      removeCoupon,
      showToast,
    }),
    [
      cart,
      wishlist,
      hydrated,
      totalItems,
      subtotal,
      grandTotal,
      discountAmount,
      appliedCoupon,
      couponType,
      couponValue,
      couponDiscountPercent,
      isCartOpen,
      isWishlistOpen,
      isCheckoutOpen,
      toastMessage,
      addToCart,
      removeFromCart,
      updateQuantity,
      setQuantity,
      removeMultipleFromCart,
      clearCart,
      toggleWishlist,
      isInWishlist,
      moveToCart,
      moveAllWishlistToCart,
      applyCoupon,
      removeCoupon,
      showToast,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
