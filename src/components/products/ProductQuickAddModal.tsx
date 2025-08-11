"use client";

import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  open: boolean;
  onClose: () => void;
  product: { id: string; name: string; price: number } | null;
};

export default function ProductQuickAddModal({
  open,
  onClose,
  product,
}: Props) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const router = useRouter();

  if (!product) return null;

  function add(times: number) {
    if (!product) return;
    for (let i = 0; i < times; i += 1)
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
      });
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-end p-4 text-center sm:items-center sm:justify-center">
          <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-4 text-left align-middle shadow-xl transition-all">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold">{product.name}</h3>
              <button
                className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-gray-100"
                aria-label="Cerrar"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600">
              ${(product.price / 100).toFixed(2)}
            </p>

            <div className="mt-4 flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) =>
                  setQty(Math.max(1, Number(e.target.value) || 1))
                }
                className="w-20 rounded-md border border-gray-300 px-2 py-2 text-sm"
              />
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                onClick={() => {
                  add(qty);
                  router.push("/cart");
                }}
              >
                Agregar e ir al carrito
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  add(qty);
                  onClose();
                }}
              >
                Agregar y seguir comprando
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
