import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { orderCreateSchema } from "@/lib/schemas";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const perPage = 5;
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId: (session.user as { id: string }).id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        quantity: true,
        product: { select: { id: true, name: true, price: true } },
      },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.order.count({
      where: { userId: (session.user as { id: string }).id },
    }),
  ]);
  return NextResponse.json({
    items,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  });
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
