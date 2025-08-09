import { PrismaClient, Role } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  // Limpiar datos existentes (opcional)
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  // Crear usuario Business
  const business = await prisma.user.create({
    data: {
      email: "business@example.com",
      name: "Business Owner",
      role: Role.BUSINESS,
    },
  });

  // Crear usuario Cliente
  const client = await prisma.user.create({
    data: {
      email: "client@example.com",
      name: "John Doe",
      role: Role.CLIENT,
    },
  });

  // Crear tienda para el Business
  const store = await prisma.store.create({
    data: {
      name: "Demo Store",
      ownerId: business.id,
    },
  });

  // Crear producto en la tienda
  const product = await prisma.product.create({
    data: {
      name: "Awesome Widget",
      price: 1999,
      storeId: store.id,
    },
  });

  console.log({ business, client, store, product });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
