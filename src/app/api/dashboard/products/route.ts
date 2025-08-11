import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireBusiness } from "@/lib/api-auth";
import { productCreateSchema } from "@/lib/schemas";
import { PER_PAGE } from "@/lib/config";

export async function GET(request: Request) {
  const auth = await requireBusiness();
  if ("error" in auth) return auth.error;
  const stores = await prisma.store.findMany({
    where: { ownerId: auth.userId },
    select: { id: true },
  });
  const storeIds = stores.map((s: { id: string }) => s.id);
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const perPage = PER_PAGE;
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where: { storeId: { in: storeIds } },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        price: true,
        storeId: true,
        category: true,
      },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.product.count({ where: { storeId: { in: storeIds } } }),
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
  const auth = await requireBusiness();
  if ("error" in auth) return auth.error;
  const json = await request.json().catch(() => null);
  const parsed = productCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { name, price, storeId, category } = parsed.data;

  // Validate ownership of store
  const store = await prisma.store.findFirst({
    where: { id: storeId, ownerId: auth.userId },
    select: { id: true },
  });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const product = await prisma.product.create({
    data: { name, price, storeId, category },
    select: {
      id: true,
      name: true,
      price: true,
      storeId: true,
      category: true,
    },
  });
  return NextResponse.json(product, { status: 201 });
}
