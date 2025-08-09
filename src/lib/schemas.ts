import { z } from "zod";

export const storeCreateSchema = z.object({
  name: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(80, "Máximo 80 caracteres"),
});

export type StoreCreateInput = z.infer<typeof storeCreateSchema>;

export const productCreateSchema = z.object({
  name: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(120, "Máximo 120 caracteres"),
  price: z
    .number()
    .int("Debe ser entero (cents)")
    .positive("Debe ser mayor a 0"),
  storeId: z.string().uuid("ID de tienda inválido"),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;

export const productUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(120, "Máximo 120 caracteres")
    .optional(),
  price: z
    .number()
    .int("Debe ser entero (cents)")
    .positive("Debe ser mayor a 0")
    .optional(),
});

export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;

export const orderItemSchema = z.object({
  productId: z.string().uuid("ID de producto inválido"),
  quantity: z.number().int().positive("Cantidad inválida").max(50, "Máximo 50"),
});

export const orderCreateSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Agrega al menos 1 producto"),
});

export type OrderCreateInput = z.infer<typeof orderCreateSchema>;

export const orderStatusEnum = z.enum([
  "PLACED",
  "PROCESSING",
  "SHIPPED",
  "CANCELLED",
]);

export const orderUpdateSchema = z.object({
  status: orderStatusEnum,
});

export type OrderUpdateInput = z.infer<typeof orderUpdateSchema>;
