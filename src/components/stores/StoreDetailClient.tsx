"use client";

import Container from "@/components/layout/Container";
import ResponsiveGrid from "@/components/layout/ResponsiveGrid";
import ProductCard from "@/components/products/ProductCard";
import ProductQuickAddModal from "@/components/products/ProductQuickAddModal";
import { useState } from "react";

type StoreData = {
  id: string;
  name: string;
  products: { id: string; name: string; price: number }[];
};

export default function StoreDetailClient({ store }: { store: StoreData }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<{
    id: string;
    name: string;
    price: number;
  } | null>(null);

  return (
    <div className="py-6">
      <Container>
        <h1 className="text-xl font-semibold">{store.name}</h1>
        <div className="mt-6">
          <ResponsiveGrid>
            {store.products.map((p) => (
              <div key={p.id}>
                <ProductCard
                  id={p.id}
                  name={p.name}
                  price={p.price}
                  href={`/products/${p.id}`}
                  onAddClick={() => {
                    setSelected(p);
                    setOpen(true);
                  }}
                />
              </div>
            ))}
          </ResponsiveGrid>
        </div>
      </Container>
      <ProductQuickAddModal
        open={open}
        onClose={() => setOpen(false)}
        product={selected}
      />
    </div>
  );
}
