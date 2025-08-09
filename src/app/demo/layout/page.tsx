"use client";

import Container from "@/components/layout/Container";
import ResponsiveGrid from "@/components/layout/ResponsiveGrid";

export default function LayoutDemoPage() {
  return (
    <div className="py-6">
      <Container>
        <h1 className="text-xl font-semibold">Demo: Responsive Layout</h1>
        <div className="mt-6">
          <ResponsiveGrid>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4 h-40 bg-white" />
            ))}
          </ResponsiveGrid>
        </div>
      </Container>
    </div>
  );
}
