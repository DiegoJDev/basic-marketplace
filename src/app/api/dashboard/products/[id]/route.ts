import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { productUpdateSchema } from "@/lib/schemas";

const prisma = new PrismaClient();

export async function PUT(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "BUSINESS") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await _req.json().catch(() => null);
  const parsed = productUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Ownership check
  const product = await prisma.product.findUnique({
    select: { storeId: true },
    where: { id: params.id },
  });
  if (!product)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const store = await prisma.store.findFirst({
    where: {
      id: product.storeId,
      ownerId: (session.user as { id: string }).id,
    },
    select: { id: true },
  });
  if (!store)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const updated = await prisma.product.update({
    where: { id: params.id },
    data: parsed.data,
    select: { id: true, name: true, price: true, storeId: true },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "BUSINESS") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const product = await prisma.product.findUnique({
    select: { storeId: true },
    where: { id: params.id },
  });
  if (!product)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const store = await prisma.store.findFirst({
    where: {
      id: product.storeId,
      ownerId: (session.user as { id: string }).id,
    },
    select: { id: true },
  });
  if (!store)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
