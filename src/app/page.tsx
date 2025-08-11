import Container from "@/components/layout/Container";
import ProductGridWithQuickAdd from "@/components/products/ProductGridWithQuickAdd";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function Home() {
  // Obtener categorías distintas
  const categories = await prisma.$queryRawUnsafe<
    {
      category: string;
    }[]
  >(`SELECT DISTINCT category FROM Product ORDER BY category ASC`);

  // Para cada categoría, obtener top 5 por ventas (suma de quantity)
  const sections = await Promise.all(
    categories.map(async (c) => {
      const items = await prisma.$queryRawUnsafe<
        {
          id: string;
          name: string;
          price: number;
        }[]
      >(
        `SELECT id, name, price FROM Product WHERE category = ? ORDER BY name ASC LIMIT 5`,
        c.category
      );
      return { category: c.category, items };
    })
  );

  return (
    <div className="py-6">
      <Container>
        <h1 className="text-2xl font-semibold">Discover our top picks</h1>

        <div className="mt-6 space-y-10">
          {sections.map((section) => (
            <section key={section.category}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">{section.category}</h2>
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
