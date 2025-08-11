import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireBusiness } from "@/lib/api-auth";
import { orderUpdateSchema } from "@/lib/schemas";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireBusiness();
  if ("error" in auth) return auth.error;
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
  if (order.product.store.ownerId !== auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const updated = await prisma.order.update({
    where: { id: params.id },
    data: { status: parsed.data.status },
    select: { id: true, status: true },
  });
  return NextResponse.json(updated);
}
