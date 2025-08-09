"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
      <Container className="h-16 flex items-center gap-4">
        <div className="flex items-center gap-6 flex-1">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Basic Marketplace
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm text-gray-600">
            <Link href="/stores" className={navClass(pathname === "/stores")}>
              Stores
            </Link>
            <Link
              href="/products"
              className={navClass(pathname === "/products")}
            >
              Products
            </Link>
            <Link href="/about" className={navClass(pathname === "/about")}>
              About
            </Link>
          </nav>
        </div>

        <div className="flex-1 hidden lg:block">
          <Input placeholder="Search furniture, brands..." />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" aria-label="Cart">
            Cart
          </Button>
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
                Sign out
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => router.push("/sign-in")}>
              Sign in
            </Button>
          )}
        </div>
      </Container>
    </header>
  );
}

function navClass(active: boolean) {
  return `hover:text-black ${active ? "text-black" : "text-gray-600"}`;
}
