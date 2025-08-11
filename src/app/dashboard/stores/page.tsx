"use client";

import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { storeCreateSchema, type StoreCreateInput } from "@/lib/schemas";

type Store = { id: string; name: string };

export default function DashboardStoresPage() {
  const [items, setItems] = useState<Store[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StoreCreateInput>({ resolver: zodResolver(storeCreateSchema) });

  async function load(p = 1) {
    const res = await fetch(`/api/dashboard/stores?page=${p}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      setItems(data.items);
      setPage(data.page);
      setTotalPages(data.totalPages);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const onCreate = handleSubmit(async (values) => {
    setLoading(true);
    const res = await fetch("/api/dashboard/stores", {
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
        <h1 className="text-xl font-semibold">Mis tiendas</h1>

        <form
          onSubmit={onCreate}
          className="mt-6 flex flex-col sm:flex-row sm:items-center gap-2 max-w-lg"
        >
          <div className="flex-1">
            <input
              type="text"
              {...register("name")}
              placeholder="Nombre de la tienda"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            {errors.name ? (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            ) : null}
          </div>
          <Button disabled={loading}>Crear</Button>
        </form>

        <ul className="mt-6 space-y-2">
          {items.map((s) => (
            <li key={s.id} className="rounded-md border bg-white p-4">
              {s.name}
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
