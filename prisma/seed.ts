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

  // Crear usuario Cliente
  const client = await prisma.user.create({
    data: {
      email: "client@example.com",
      name: "John Doe",
      role: "CLIENT",
    },
  });

  // Crear tienda para el Business
  const store = await prisma.store.create({
    data: {
      name: "Demo Store",
      ownerId: business.id,
    },
  });

  // Más tiendas para paginación
  const extraStoresData = Array.from({ length: 15 }).map((_, i) => ({
    name: `Store ${i + 1}`,
    ownerId: business.id,
  }));
  await prisma.store.createMany({ data: extraStoresData });

  // Crear producto en la tienda
  const product = await prisma.product.create({
    data: {
      name: "Awesome Widget",
      price: 1999,
      storeId: store.id,
    },
  });

  // Productos para las tiendas extra
  const allStores = await prisma.store.findMany({ select: { id: true } });
  for (const s of allStores) {
    const productsData = Array.from({ length: 6 }).map((_, i) => ({
      name: `Product ${i + 1} of ${s.id.slice(0, 4)}`,
      price: 1000 + i * 250,
      storeId: s.id,
    }));
    await prisma.product.createMany({ data: productsData });
  }

  console.log({
    business,
    client,
    stores: 1 + extraStoresData.length,
    product,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
