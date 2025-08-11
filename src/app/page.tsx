import Container from "@/components/layout/Container";
import ProductGridWithQuickAdd from "@/components/products/ProductGridWithQuickAdd";
import prisma from "@/lib/prisma";
import { categoryLabel } from "@/lib/i18n";

// using shared Prisma client

export default async function Home() {
  // Distinct categories via Prisma
  const categories = await prisma.product.findMany({
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  });

  // For each category, obtain up to 5 products ordered by name
  const sections = await Promise.all(
    categories.map(async (c) => {
      const items = await prisma.product.findMany({
        where: { category: c.category },
        select: { id: true, name: true, price: true },
        orderBy: { name: "asc" },
        take: 5,
      });
      return { category: c.category, items };
    })
  );

  return (
    <div className="py-6">
      <Container>
        <h1 className="text-2xl font-semibold">
          Descubre nuestras mejores selecciones
        </h1>

        <div className="mt-6 space-y-10">
          {sections.map((section) => (
            <section key={section.category}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">
                  {categoryLabel(
                    section.category as unknown as import("@/lib/i18n").ProductCategory
                  )}
                </h2>
              </div>
              <div className="mt-4">
                <ProductGridWithQuickAdd
                  products={section.items}
                  hrefBase="/products/"
                />
              </div>
            </section>
          ))}
        </div>
      </Container>
    </div>
  );
}
