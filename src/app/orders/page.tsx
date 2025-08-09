import Container from "@/components/layout/Container";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";

async function fetchOrdersWithAuth() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "development" ? "http" : "https");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${proto}://${host}`;
  const cookieHeader = (await cookies()).toString();

  const res = await fetch(`${baseUrl}/api/orders`, {
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
  };
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/sign-in?callbackUrl=/orders");

  const data = await fetchOrdersWithAuth();

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
                  {(o.product.price / 100).toLocaleString(undefined, {
                    style: "currency",
                    currency: "USD",
                  })}{" "}
                  × {o.quantity}
                </p>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(o.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
