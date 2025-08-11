import Container from "@/components/layout/Container";

export default function AboutPage() {
  return (
    <div className="py-10">
      <Container>
        <h1 className="text-2xl font-semibold">Acerca de</h1>
        <p className="mt-4 text-sm text-gray-700">
          Esta es una prueba técnica (Basic Marketplace) desarrollada para
          demostrar autenticación, autorización por roles, panel de negocio,
          catálogo y flujo de compra.
        </p>

        <h2 className="mt-8 text-lg font-medium">Tecnologías utilizadas</h2>
        <ul className="mt-3 list-disc pl-6 text-sm text-gray-700 space-y-1">
          <li>Next.js (App Router) y React con TypeScript</li>
          <li>NextAuth para autenticación (JWT, middleware)</li>
          <li>Prisma ORM con SQLite</li>
          <li>Tailwind CSS v4 + Headless UI</li>
          <li>Zod + React Hook Form</li>
          <li>Lucide React (iconos)</li>
        </ul>

        <p className="mt-8 text-xs text-gray-500">
          Nota: el objetivo es cumplir los requerimientos de la prueba con
          enfoque en claridad de código y coherencia de UX.
        </p>
      </Container>
    </div>
  );
}
