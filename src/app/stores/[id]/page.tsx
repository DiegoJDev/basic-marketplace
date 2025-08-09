import Container from "@/components/layout/Container";
import ResponsiveGrid from "@/components/layout/ResponsiveGrid";
import ProductCard from "@/components/products/ProductCard";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Params = { params: { id: string } };

export default async function StoreDetailPage({ params }: Params) {
  const store = await prisma.store.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      products: {
        select: { id: true, name: true, price: true },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!store) {
    return (
      <Container className="py-10">
        <p className="text-sm text-gray-600">Store not found.</p>
      </Container>
    );
  }

  return (
    <div className="py-6">
      <Container>
        <h1 className="text-xl font-semibold">{store.name}</h1>

        <div className="mt-6">
          <ResponsiveGrid>
            {store.products.map(
              (p: { id: string; name: string; price: number }) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  price={p.price}
                />
              )
            )}
          </ResponsiveGrid>
        </div>
      </Container>
    </div>
  );
}
