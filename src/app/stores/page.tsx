import Container from "@/components/layout/Container";
import ResponsiveGrid from "@/components/layout/ResponsiveGrid";
import StoreCard from "@/components/stores/StoreCard";
import Link from "next/link";
import Pagination from "@/components/ui/Pagination";
import { headers } from "next/headers";

async function fetchStores(baseUrl: string, page: number, perPage: number) {
  const res = await fetch(
    `${baseUrl}/api/stores?page=${page}&perPage=${perPage}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to fetch stores");
  return res.json() as Promise<{
    items: Array<{ id: string; name: string }>;
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  }>;
}

export default async function StoresPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams?.page ?? "1");
  const currentPage = Number.isFinite(page) && page > 0 ? page : 1;
  const perPage = 12;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "development" ? "http" : "https");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${proto}://${host}`;
  const data = await fetchStores(baseUrl, currentPage, perPage);

  return (
    <div className="py-6">
      <Container>
        <h1 className="text-xl font-semibold">Tiendas</h1>
        <div className="mt-6">
          <ResponsiveGrid>
            {data.items.map((s) => (
              <StoreCard key={s.id} id={s.id} name={s.name} />
            ))}
          </ResponsiveGrid>
        </div>

        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          prevHref={`/stores?page=${Math.max(1, data.page - 1)}`}
          nextHref={`/stores?page=${Math.min(data.totalPages, data.page + 1)}`}
        />
      </Container>
    </div>
  );
}
