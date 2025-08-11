export type OrderStatus = "PLACED" | "PROCESSING" | "SHIPPED" | "CANCELLED";
export type UserRole = "CLIENT" | "BUSINESS";
export type ProductCategory =
  | "Electronics"
  | "Clothing"
  | "Home"
  | "Beauty"
  | "Sports";

export function orderStatusLabel(status: OrderStatus): string {
  switch (status) {
    case "PLACED":
      return "Realizada";
    case "PROCESSING":
      return "Procesando";
    case "SHIPPED":
      return "Enviada";
    case "CANCELLED":
      return "Cancelada";
    default:
      return String(status);
  }
}

export function roleLabel(role: UserRole): string {
  return role === "BUSINESS" ? "Negocio" : "Cliente";
}

export function formatUsdEs(amountInCents: number): string {
  return (amountInCents / 100).toLocaleString("es-ES", {
    style: "currency",
    currency: "USD",
  });
}

export function categoryLabel(category: ProductCategory): string {
  switch (category) {
    case "Electronics":
      return "Electrónica";
    case "Clothing":
      return "Ropa y accesorios";
    case "Home":
      return "Hogar y cocina";
    case "Beauty":
      return "Belleza y cuidado personal";
    case "Sports":
      return "Deportes y aire libre";
    default:
      return String(category);
  }
}
