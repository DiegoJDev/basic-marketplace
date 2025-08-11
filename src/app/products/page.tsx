import Container from "@/components/layout/Container";
import ProductGridWithQuickAdd from "@/components/products/ProductGridWithQuickAdd";
import Pagination from "@/components/ui/Pagination";
import { headers } from "next/headers";

async function fetchProducts(baseUrl: string, page: number, perPage: number) {
  const res = await fetch(
    `${baseUrl}/api/products?page=${page}&perPage=${perPage}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json() as Promise<{
    items: Array<{ id: string; name: string; price: number }>;
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  }>;
}

export default async function ProductsPage({
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
  const data = await fetchProducts(baseUrl, currentPage, perPage);

  return (
    <div className="py-6">
      <Container>
        <h1 className="text-xl font-semibold">Productos</h1>
        <div className="mt-6">
          <ProductGridWithQuickAdd
            products={data.items}
            hrefBase="/products/"
          />
        </div>
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          prevHref={`/products?page=${Math.max(1, data.page - 1)}`}
          nextHref={`/products?page=${Math.min(
            data.totalPages,
            data.page + 1
          )}`}
        />
      </Container>
    </div>
  );
}
