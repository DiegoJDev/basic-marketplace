"use client";

import Button from "@/components/ui/Button";
import { useCart } from "@/components/providers/CartProvider";
import React, { useState } from "react";

type AddToCartButtonProps = {
  productId: string;
  name: string;
  price: number; // cents
};

export default function AddToCartButton({
  productId,
  name,
  price,
}: AddToCartButtonProps) {
  const { addItem, state } = useCart();
  const [quantity, setQuantity] = useState<number>(1);
  const currentQty =
    state.items.find((i) => i.productId === productId)?.quantity ?? 0;
  const maxQty = 10;
  const canAdd = currentQty + quantity <= maxQty && quantity > 0;

  function onClick() {
    if (!canAdd) return;
    for (let i = 0; i < quantity; i += 1) {
      addItem({ productId, name, price });
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={1}
        max={maxQty}
        value={quantity}
        onChange={(e) =>
          setQuantity(
            Math.max(1, Math.min(maxQty, Number(e.target.value) || 1))
          )
        }
        className="w-16 rounded-md border border-gray-300 px-2 py-2 text-sm"
      />
      <Button disabled={!canAdd} onClick={onClick}>
        Agregar al carrito
      </Button>
    </div>
  );
}
