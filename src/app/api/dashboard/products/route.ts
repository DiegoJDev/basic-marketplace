import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { productCreateSchema } from "@/lib/schemas";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "BUSINESS") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const stores = await prisma.store.findMany({
    where: { ownerId: (session.user as { id: string }).id },
    select: { id: true },
  });
  const storeIds = stores.map((s: { id: string }) => s.id);
  const products = await prisma.product.findMany({
    where: { storeId: { in: storeIds } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, price: true, storeId: true },
  });
  return NextResponse.json({ items: products });
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
  const { name, price, storeId } = parsed.data;

  // Validate ownership of store
  const store = await prisma.store.findFirst({
    where: { id: storeId, ownerId: (session.user as { id: string }).id },
    select: { id: true },
  });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const product = await prisma.product.create({
    data: { name, price, storeId },
    select: { id: true, name: true, price: true, storeId: true },
  });
  return NextResponse.json(product, { status: 201 });
}
