import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageParam = Number(searchParams.get("page") || "1");
  const perPageParam = Number(searchParams.get("perPage") || "12");

  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const perPage =
    Number.isFinite(perPageParam) && perPageParam > 0 && perPageParam <= 50
      ? perPageParam
      : 12;
  const skip = (page - 1) * perPage;

  const [items, total] = await Promise.all([
    prisma.store.findMany({
      skip,
      take: perPage,
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.store.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return NextResponse.json({ items, total, page, perPage, totalPages });
}
