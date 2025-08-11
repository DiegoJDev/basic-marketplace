"use client";

import Button from "@/components/ui/Button";
import Link from "next/link";
import { useCart } from "@/components/providers/CartProvider";

type ProductCardProps = {
  id: string;
  name: string;
  price: number;
  onAddClick?: () => void;
  href?: string;
};

export default function ProductCard({
  id,
  name,
  price,
  onAddClick,
  href,
}: ProductCardProps) {
  const { addItem } = useCart();
  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      {href ? (
        <Link href={href} className="block h-36 bg-gray-100" />
      ) : (
        <div className="h-36 bg-gray-100" />
      )}
      <div className="p-4">
        {href ? (
          <Link href={href} className="font-medium hover:underline">
            {name}
          </Link>
        ) : (
          <h3 className="font-medium">{name}</h3>
        )}
        <p className="mt-1 text-sm text-gray-600">
          ${(price / 100).toFixed(2)}
        </p>
        <div className="mt-3">
          <Button
            size="sm"
            onClick={() => {
              if (onAddClick) return onAddClick();
              addItem({ productId: id, name, price });
            }}
          >
            Add to cart
          </Button>
        </div>
      </div>
    </div>
  );
}
