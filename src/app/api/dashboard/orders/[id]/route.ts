import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { orderUpdateSchema } from "@/lib/schemas";

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "BUSINESS") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json = await request.json().catch(() => null);
  const parsed = orderUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Ownership check: order.product.store.ownerId === session.user.id
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    select: { product: { select: { store: { select: { ownerId: true } } } } },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.product.store.ownerId !== (session.user as { id: string }).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const updated = await prisma.order.update({
    where: { id: params.id },
    data: { status: parsed.data.status as any },
    select: { id: true, status: true },
  });
  return NextResponse.json(updated);
}
