"use client";

import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productCreateSchema, type ProductCreateInput } from "@/lib/schemas";

type Store = { id: string; name: string };
type Product = { id: string; name: string; price: number; storeId: string };

export default function DashboardProductsPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductCreateInput>({
    resolver: zodResolver(productCreateSchema),
    defaultValues: { name: "", price: 0, storeId: "" },
  });

  async function load(p = 1) {
    const [storesRes, productsRes] = await Promise.all([
      fetch(`/api/dashboard/stores?page=1`, { cache: "no-store" }),
      fetch(`/api/dashboard/products?page=${p}`, { cache: "no-store" }),
    ]);
    if (storesRes.ok) setStores((await storesRes.json()).items);
    if (productsRes.ok) {
      const data = await productsRes.json();
      setProducts(data.items);
      setPage(data.page);
      setTotalPages(data.totalPages);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const canSubmit = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const onCreate = handleSubmit(async (values) => {
    setLoading(true);
    const res = await fetch("/api/dashboard/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setLoading(false);
    if (res.ok) {
      reset();
      load();
    }
  });

  return (
    <div className="py-6">
      <Container>
        <h1 className="text-xl font-semibold">Productos</h1>

        <form
          onSubmit={onCreate}
          className="mt-6 grid grid-cols-1 sm:grid-cols-[1fr_160px_200px_auto] gap-2 items-center"
        >
          <input
            type="text"
            {...register("name")}
            placeholder="Nombre del producto"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          {errors.name ? (
            <p className="text-xs text-red-600">{errors.name.message}</p>
          ) : null}
          <input
            type="number"
            min={1}
            {...register("price", { valueAsNumber: true })}
            placeholder="Precio (cents)"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          {errors.price ? (
            <p className="text-xs text-red-600">{errors.price.message}</p>
          ) : null}
          <select
            {...register("storeId")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Seleccionar tienda</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {errors.storeId ? (
            <p className="text-xs text-red-600">{errors.storeId.message}</p>
          ) : null}
          <Button disabled={loading || !canSubmit}>Crear</Button>
        </form>

        <ul className="mt-6 space-y-2">
          {products.map((p) => (
            <li key={p.id} className="rounded-md border bg-white p-4">
              <span className="font-medium">{p.name}</span>
              <span className="ml-2 text-sm text-gray-600">
                ${(p.price / 100).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="secondary"
            disabled={page <= 1}
            onClick={() => load(page - 1)}
          >
            ← Anterior
          </Button>
          <span className="text-sm text-gray-600">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => load(page + 1)}
          >
            Siguiente →
          </Button>
        </div>
      </Container>
    </div>
  );
}
