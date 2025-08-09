export type CartItem = {
  productId: string;
  name: string;
  price: number; // in cents
  quantity: number;
};

export type CartState = {
  items: CartItem[];
};
