import Container from "@/components/layout/Container";
import Pagination from "@/components/ui/Pagination";
import { formatDateTimeEs, formatUsdEs } from "@/lib/i18n";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";

async function fetchOrdersWithAuth(page: number) {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "development" ? "http" : "https");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${proto}://${host}`;
  const cookieHeader = (await cookies()).toString();

  const res = await fetch(`${baseUrl}/api/orders?page=${page}`, {
    cache: "no-store",
    headers: { cookie: cookieHeader },
  });
  if (!res.ok) throw new Error("Failed to fetch orders");
  return (await res.json()) as {
    items: Array<{
      id: string;
      createdAt: string;
      quantity: number;
      product: { id: string; name: string; price: number };
    }>;
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/sign-in?callbackUrl=/orders");

  const currentPage = Math.max(1, Number(searchParams?.page || 1));
  const data = await fetchOrdersWithAuth(currentPage);

  return (
    <div className="py-6">
      <Container>
        <h1 className="text-xl font-semibold">Mis órdenes</h1>
        <ul className="mt-6 space-y-2">
          {data.items.map((o) => (
            <li
              key={o.id}
              className="rounded-md border bg-white p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{o.product.name}</p>
                <p className="text-xs text-gray-600">
                  {formatUsdEs(o.product.price)} × {o.quantity}
                </p>
              </div>
              <span className="text-xs text-gray-500">
                {formatDateTimeEs(o.createdAt)}
              </span>
            </li>
          ))}
        </ul>
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          prevHref={`/orders?page=${Math.max(1, data.page - 1)}`}
          nextHref={`/orders?page=${Math.min(data.totalPages, data.page + 1)}`}
        />
      </Container>
    </div>
  );
}
