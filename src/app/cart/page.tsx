"use client";

import Container from "@/components/layout/Container";
import { useCart } from "@/components/providers/CartProvider";
import Button from "@/components/ui/Button";

export default function CartPage() {
  const { state, removeItem, clear } = useCart();
  const total = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="py-6">
      <Container>
        <h1 className="text-xl font-semibold">Cart</h1>
        {state.items.length === 0 ? (
          <p className="mt-4 text-sm text-gray-600">Your cart is empty.</p>
        ) : (
          <div className="mt-6 space-y-4">
            <ul className="divide-y rounded-md border bg-white">
              {state.items.map((i) => (
                <li
                  key={i.productId}
                  className="p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{i.name}</p>
                    <p className="text-sm text-gray-600">
                      {(i.price / 100).toLocaleString(undefined, {
                        style: "currency",
                        currency: "USD",
                      })}{" "}
                      × {i.quantity}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => removeItem(i.productId)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between">
              <p className="text-sm">Total</p>
              <p className="font-medium">
                {(total / 100).toLocaleString(undefined, {
                  style: "currency",
                  currency: "USD",
                })}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={clear}>
                Clear
              </Button>
              <Button>Checkout</Button>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
