import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireBusiness } from "@/lib/api-auth";
import { PER_PAGE } from "@/lib/config";

export async function GET(request: Request) {
  const auth = await requireBusiness();
  if ("error" in auth) return auth.error;
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const perPage = PER_PAGE;
  const status = searchParams.get("status") || undefined;

  const stores = await prisma.store.findMany({
    where: { ownerId: auth.userId },
    select: { id: true },
  });
  const storeIds = stores.map((s) => s.id);

  const where: NonNullable<
    Parameters<typeof prisma.order.findMany>[0]
  >["where"] = {
    product: { storeId: { in: storeIds } },
    ...(status
      ? { status: status as "PLACED" | "PROCESSING" | "SHIPPED" | "CANCELLED" }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        quantity: true,
        status: true,
        user: { select: { email: true } },
        product: { select: { id: true, name: true, price: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  });
}
