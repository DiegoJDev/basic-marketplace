"use client";

import Container from "@/components/layout/Container";
import { useCart } from "@/components/providers/CartProvider";
import Button from "@/components/ui/Button";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { state, removeItem, clear } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const total = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const isEmpty = state.items.length === 0;

  async function checkout() {
    if (!session?.user) {
      await signIn(undefined, { callbackUrl: "/cart" });
      return;
    }
    if (isEmpty) return;
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: state.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      }),
    });
    if (res.ok) {
      clear();
      router.push("/orders");
    } else {
      const err = await res.json().catch(() => ({}));
      alert("Error en checkout: " + (err?.error ?? ""));
    }
  }

  return (
    <div className="py-6">
      <Container>
        <h1 className="text-xl font-semibold">Cart</h1>
        {isEmpty ? (
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
              <Button onClick={checkout} disabled={isEmpty}>
                Checkout
              </Button>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
