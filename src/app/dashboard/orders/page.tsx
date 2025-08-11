"use client";

import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import { useEffect, useMemo, useState } from "react";

type Row = {
  id: string;
  createdAt: string;
  quantity: number;
  status: "PLACED" | "PROCESSING" | "SHIPPED" | "CANCELLED";
  user: { email: string | null };
  product: { id: string; name: string; price: number };
};

export default function DashboardOrdersPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  async function load(p = 1, st = "") {
    const params = new URLSearchParams();
    params.set("page", String(p));
    if (st) params.set("status", st);
    const res = await fetch(`/api/dashboard/orders?${params.toString()}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      setRows(data.items);
      setPage(data.page);
      setTotalPages(data.totalPages);
    }
  }

  useEffect(() => {
    load(1, "");
  }, []);

  return (
    <div className="py-6">
      <Container>
        <h1 className="text-xl font-semibold">Pedidos (Business)</h1>

        <div className="mt-4 flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => {
              const v = e.target.value;
              setStatus(v);
              load(1, v);
            }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            <option value="PLACED">PLACED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Fecha</th>
                <th className="py-2 pr-4">Cliente</th>
                <th className="py-2 pr-4">Producto</th>
                <th className="py-2 pr-4">Cantidad</th>
                <th className="py-2 pr-4">Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="py-2 pr-4 tabular-nums">
                    {o.id.slice(0, 8)}…
                  </td>
                  <td className="py-2 pr-4">
                    {new Date(o.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2 pr-4">{o.user.email}</td>
                  <td className="py-2 pr-4">{o.product.name}</td>
                  <td className="py-2 pr-4">{o.quantity}</td>
                  <td className="py-2 pr-4">
                    <select
                      value={o.status}
                      onChange={async (e) => {
                        const status = e.target.value as Row["status"];
                        await fetch(`/api/dashboard/orders/${o.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status }),
                        });
                        load(page, status);
                      }}
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs"
                    >
                      <option value="PLACED">PLACED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="secondary"
            disabled={page <= 1}
            onClick={() => load(page - 1, status)}
          >
            ← Anterior
          </Button>
          <span className="text-sm text-gray-600">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => load(page + 1, status)}
          >
            Siguiente →
          </Button>
        </div>
      </Container>
    </div>
  );
}
