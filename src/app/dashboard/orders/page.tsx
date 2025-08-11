"use client";

import Container from "@/components/layout/Container";
import Pagination from "@/components/ui/Pagination";
import { useEffect, useState } from "react";
import { formatDateTimeEs, orderStatusLabel } from "@/lib/i18n";
import { useSearchParams } from "next/navigation";

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
  const params = useSearchParams();

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
    const p = Math.max(1, Number(params.get("page") || 1));
    const st = params.get("status") || "";
    setStatus(st);
    load(p, st);
  }, [params]);

  return (
    <div className="py-6">
      <Container>
        <h1 className="text-xl font-semibold">Pedidos (Negocio)</h1>

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
                  <td className="py-2 pr-4">{formatDateTimeEs(o.createdAt)}</td>
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
                      {(
                        [
                          "PLACED",
                          "PROCESSING",
                          "SHIPPED",
                          "CANCELLED",
                        ] as const
                      ).map((v) => (
                        <option key={v} value={v}>
                          {orderStatusLabel(v)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          hrefBuilder={(p) =>
            `/dashboard/orders?page=${p}${status ? `&status=${status}` : ""}`
          }
        />
      </Container>
    </div>
  );
}
