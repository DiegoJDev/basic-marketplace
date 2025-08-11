import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const business = await prisma.user.create({
    data: {
      email: "business@example.com",
      name: "Business Owner",
      role: "BUSINESS",
    },
  });

  const client = await prisma.user.create({
    data: {
      email: "client@example.com",
      name: "John Doe",
      role: "CLIENT",
    },
  });

  const stores = await Promise.all(
    Array.from({ length: 8 }).map((_, i) =>
      prisma.store.create({
        data: { name: `Store ${i + 1}`, ownerId: business.id },
      })
    )
  );

  // Categorías en inglés de una sola palabra
  const categories = [
    "Electronics", // Electrónica
    "Clothing", // Ropa y accesorios
    "Home", // Hogar y cocina
    "Beauty", // Belleza y cuidado personal
    "Sports", // Deportes y aire libre
  ] as const;

  for (const s of stores) {
    const count = 3 + Math.floor(Math.random() * 3); // 3..5
    const data = Array.from({ length: count }).map((_, i) => {
      const category =
        categories[Math.floor(Math.random() * categories.length)];
      const base = 1000 + Math.floor(Math.random() * 3000);
      return {
        name: `${category} Product ${i + 1}`,
        price: base,
        category,
        storeId: s.id,
      };
    });
    await prisma.product.createMany({ data });
  }

  const totalStores = await prisma.store.count();
  const totalProducts = await prisma.product.count();
  console.log({ business, client, totalStores, totalProducts });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
