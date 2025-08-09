import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { orderCreateSchema } from "@/lib/schemas";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orders = await prisma.order.findMany({
    where: { userId: (session.user as { id: string }).id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      quantity: true,
      product: { select: { id: true, name: true, price: true } },
    },
  });
  return NextResponse.json({ items: orders });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = orderCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { items } = parsed.data;

  // Verify products exist
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true },
  });
  const found = new Set(products.map((p) => p.id));
  const missing = productIds.filter((id) => !found.has(id));
  if (missing.length)
    return NextResponse.json(
      { error: "Invalid products", missing },
      { status: 400 }
    );

  // Create orders (one row per item)
  const userId = (session.user as { id: string }).id;
  await prisma.$transaction(
    items.map((i) =>
      prisma.order.create({
        data: { userId, productId: i.productId, quantity: i.quantity },
      })
    )
  );

  return NextResponse.json({ ok: true }, { status: 201 });
}
