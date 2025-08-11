import Container from "@/components/layout/Container";
import AddToCartButton from "@/components/products/AddToCartButton";
import prisma from "@/lib/prisma";
import { formatUsdEs, categoryLabel } from "@/lib/i18n";

type Params = { params: { id: string } };

export default async function ProductDetailPage({ params }: Params) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      price: true,
      category: true,
      store: { select: { id: true, name: true } },
    },
  });

  if (!product) {
    return (
      <Container className="py-10">
        <p className="text-sm text-gray-600">Producto no encontrado.</p>
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
            <p className="mt-2 text-lg">{formatUsdEs(product.price)}</p>
            <p className="mt-2 text-sm text-gray-600">
              Categoría:{" "}
              {categoryLabel(
                product.category as unknown as import("@/lib/i18n").ProductCategory
              )}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Tienda: {product.store.name}
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
