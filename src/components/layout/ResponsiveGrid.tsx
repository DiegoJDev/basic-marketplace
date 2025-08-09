import React from "react";

type ResponsiveGridProps = {
  children: React.ReactNode;
  className?: string;
};

export default function ResponsiveGrid({
  children,
  className,
}: ResponsiveGridProps) {
  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 ${
        className ?? ""
      }`.trim()}
    >
      {children}
    </div>
  );
}
