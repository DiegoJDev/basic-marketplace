"use client";

import ResponsiveGrid from "@/components/layout/ResponsiveGrid";
import ProductCard from "@/components/products/ProductCard";
import ProductQuickAddModal from "@/components/products/ProductQuickAddModal";
import { useState } from "react";

type Product = { id: string; name: string; price: number };

export default function ProductGridWithQuickAdd({
  products,
  hrefBase,
}: {
  products: Product[];
  hrefBase?: string; // e.g. "/products/"
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);

  return (
    <>
      <ResponsiveGrid>
        {products.map((p) => (
          <div key={p.id}>
            <ProductCard
              id={p.id}
              name={p.name}
              price={p.price}
              href={hrefBase ? `${hrefBase}${p.id}` : undefined}
              onAddClick={() => {
                setSelected(p);
                setOpen(true);
              }}
            />
          </div>
        ))}
      </ResponsiveGrid>
      <ProductQuickAddModal
        open={open}
        onClose={() => setOpen(false)}
        product={selected}
      />
    </>
  );
}
