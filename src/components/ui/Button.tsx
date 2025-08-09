import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
};

function baseClasses(
  variant: ButtonProps["variant"],
  size: ButtonProps["size"]
) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const byVariant =
    variant === "secondary"
      ? "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus:ring-gray-300"
      : variant === "ghost"
      ? "bg-transparent text-gray-900 hover:bg-gray-100 focus:ring-gray-300"
      : "bg-black text-white hover:bg-gray-900 focus:ring-gray-300";
  const bySize =
    size === "sm"
      ? "h-9 px-3 text-sm"
      : size === "lg"
      ? "h-12 px-5 text-base"
      : "h-10 px-4 text-sm";
  return `${base} ${byVariant} ${bySize}`;
}

export default function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${baseClasses(variant, size)} ${className ?? ""}`.trim()}
      {...props}
    />
  );
}
