import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { productCreateSchema } from "@/lib/schemas";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "BUSINESS") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const stores = await prisma.store.findMany({
    where: { ownerId: (session.user as { id: string }).id },
    select: { id: true },
  });
  const storeIds = stores.map((s: { id: string }) => s.id);
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const perPage = 5;
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where: { storeId: { in: storeIds } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, price: true, storeId: true },
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
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "BUSINESS") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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
    where: { id: storeId, ownerId: (session.user as { id: string }).id },
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
