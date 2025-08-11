"use client";

import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productCreateSchema, type ProductCreateInput } from "@/lib/schemas";
import { formatUsdEs, categoryLabel } from "@/lib/i18n";
import FieldError from "@/components/ui/FieldError";

type Store = { id: string; name: string };
type Product = {
  id: string;
  name: string;
  price: number;
  storeId: string;
  category?: string;
};

export default function DashboardProductsPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ProductCreateInput>({
    resolver: zodResolver(productCreateSchema),
    mode: "onChange",
    defaultValues: { name: "", price: 0, storeId: "", category: "Electronics" },
  });

  async function load(p = 1) {
    const [storesRes, productsRes] = await Promise.all([
      fetch(`/api/dashboard/stores?perPage=all`, { cache: "no-store" }),
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
    const p = Math.max(1, Number(params.get("page") || 1));
    load(p);
  }, [params]);

  const canSubmit = isValid && !loading;

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

        <form onSubmit={onCreate} className="mt-6 space-y-3">
          <div>
            <input
              type="text"
              {...register("name")}
              placeholder="Nombre del producto"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <FieldError message={errors.name?.message} />
          </div>
          <div>
            <input
              type="number"
              min={1}
              {...register("price", { valueAsNumber: true })}
              placeholder="Precio (cents)"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <FieldError message={errors.price?.message} />
          </div>
          <div>
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
            <FieldError message={errors.storeId?.message} />
          </div>
          <div>
            <select
              {...register("category")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="Electronics">Electrónica</option>
              <option value="Clothing">Ropa y accesorios</option>
              <option value="Home">Hogar y cocina</option>
              <option value="Beauty">Belleza y cuidado personal</option>
              <option value="Sports">Deportes y aire libre</option>
            </select>
            <FieldError message={errors.category?.message} />
          </div>
          <div className="flex items-center justify-end">
            <Button disabled={!canSubmit}>Crear</Button>
          </div>
          <div className="rounded-md bg-gray-50 p-3 text-xs text-gray-700">
            <p className="font-medium">Condiciones para crear un producto</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Nombre: mínimo 2 y máximo 120 caracteres.</li>
              <li>Precio: entero positivo en centavos (ej. 1299 = $12.99).</li>
              <li>Tienda: debes seleccionar una de tus tiendas.</li>
              <li>Categoría: una de las opciones disponibles.</li>
            </ul>
            <p className="mt-2">
              Ejemplo: &quot;Nombre: Basic Chair&quot;, &quot;Precio:
              12999&quot;, &quot;Tienda: Store 1&quot;, &quot;Categoría:
              Home&quot;.
            </p>
          </div>
        </form>

        <ul className="mt-6 space-y-2">
          {products.map((p) => (
            <li key={p.id} className="rounded-md border bg-white p-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">{p.name}</span>
                {p.category ? (
                  <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                    {categoryLabel(
                      p.category as unknown as import("@/lib/i18n").ProductCategory
                    )}
                  </span>
                ) : null}
                <span className="ml-auto text-sm text-gray-600">
                  {formatUsdEs(p.price)}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <Pagination
          page={page}
          totalPages={totalPages}
          hrefBuilder={(p) => `/dashboard/products?page=${p}`}
        />
      </Container>
    </div>
  );
}
