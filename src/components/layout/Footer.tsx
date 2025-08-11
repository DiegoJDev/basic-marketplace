import Container from "@/components/layout/Container";

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <Container className="py-10 text-sm text-gray-600 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>
          © {new Date().getFullYear()} Basic Marketplace. All rights reserved.
        </p>
        <nav className="flex items-center gap-4">
          <a href="/about" className="hover:text-black">
            Acerca de
          </a>
        </nav>
      </Container>
    </footer>
  );
}
