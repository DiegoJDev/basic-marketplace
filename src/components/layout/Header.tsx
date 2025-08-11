"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import { ShoppingCart, LogIn } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useCart();
  const totalQuantity = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const isBusiness =
    (session?.user as { role?: "CLIENT" | "BUSINESS" } | undefined)?.role ===
    "BUSINESS";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
      <Container className="h-16 flex items-center gap-4">
        <div className="flex items-center gap-6 flex-1">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Basic Marketplace
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm text-gray-600">
            {isBusiness ? (
              <>
                <Link
                  href="/dashboard/stores"
                  className={navClass(pathname.startsWith("/dashboard/stores"))}
                >
                  Tiendas
                </Link>
                <Link
                  href="/dashboard/products"
                  className={navClass(
                    pathname.startsWith("/dashboard/products")
                  )}
                >
                  Productos
                </Link>
                <Link
                  href="/dashboard/orders"
                  className={navClass(pathname.startsWith("/dashboard/orders"))}
                >
                  Pedidos
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/stores"
                  className={navClass(pathname === "/stores")}
                >
                  Tiendas
                </Link>
                <Link
                  href="/products"
                  className={navClass(pathname === "/products")}
                >
                  Productos
                </Link>
                <Link
                  href="/orders"
                  className={navClass(pathname === "/orders")}
                >
                  Órdenes
                </Link>
              </>
            )}
            {/* About link moved to footer */}
          </nav>
        </div>

        {/* Search removed per requirements */}

        <div className="flex items-center gap-2">
          {isBusiness ? null : (
            <Button
              variant="ghost"
              aria-label="Carrito"
              onClick={() => router.push("/cart")}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Carrito</span>
              {totalQuantity > 0 ? (
                <span className="ml-1 text-xs tabular-nums">
                  {totalQuantity}
                </span>
              ) : null}
            </Button>
          )}
          {session?.user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-sm text-gray-600">
                {session.user.email}
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Cerrar sesión
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => router.push("/sign-in")}>
                <LogIn className="mr-2 h-4 w-4" /> Iniciar sesión
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => router.push("/sign-up")}
              >
                Crear cuenta
              </Button>
            </div>
          )}
        </div>
      </Container>
    </header>
  );
}

function navClass(active: boolean) {
  return `hover:text-black ${active ? "text-black" : "text-gray-600"}`;
}
