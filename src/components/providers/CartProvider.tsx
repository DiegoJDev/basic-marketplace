"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem, CartState } from "@/lib/cart-types";

type CartContextValue = {
  state: CartState;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "bm_cart_v1";

export default function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<CartState>({ items: [] });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const value = useMemo<CartContextValue>(
    () => ({
      state,
      addItem: (item) => {
        setState((prev) => {
          const idx = prev.items.findIndex(
            (i) => i.productId === item.productId
          );
          if (idx >= 0) {
            const copy = [...prev.items];
            copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + 1 };
            return { items: copy };
          }
          return { items: [...prev.items, { ...item, quantity: 1 }] };
        });
      },
      removeItem: (productId) => {
        setState((prev) => ({
          items: prev.items.filter((i) => i.productId !== productId),
        }));
      },
      clear: () => setState({ items: [] }),
    }),
    [state]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
