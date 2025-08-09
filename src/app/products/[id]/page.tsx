import Container from "@/components/layout/Container";
import AddToCartButton from "@/components/products/AddToCartButton";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Params = { params: { id: string } };

export default async function ProductDetailPage({ params }: Params) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      price: true,
      store: { select: { id: true, name: true } },
    },
  });

  if (!product) {
    return (
      <Container className="py-10">
        <p className="text-sm text-gray-600">Product not found.</p>
      </Container>
    );
  }

  return (
    <div className="py-6">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-lg border bg-white h-80" />
          <div>
            <h1 className="text-2xl font-semibold">{product.name}</h1>
            <p className="mt-2 text-lg">${(product.price / 100).toFixed(2)}</p>
            <p className="mt-2 text-sm text-gray-600">
              Store: {product.store.name}
            </p>
            <div className="mt-6">
              <AddToCartButton
                productId={product.id}
                name={product.name}
                price={product.price}
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
