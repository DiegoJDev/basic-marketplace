import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { orderCreateSchema } from "@/lib/schemas";
import { PER_PAGE } from "@/lib/config";

export async function GET(request: Request) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const perPage = PER_PAGE;
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId: auth.userId },
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
    prisma.order.count({ where: { userId: auth.userId } }),
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
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

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
  const userId = auth.userId;
  await prisma.$transaction(
    items.map((i) =>
      prisma.order.create({
        data: { userId, productId: i.productId, quantity: i.quantity },
      })
    )
  );

  return NextResponse.json({ ok: true }, { status: 201 });
}
