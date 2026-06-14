export type ProductViewMode = "grid" | "list";

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  category: string;
  price: number;
  uom: string;
  tax: string;
  active: boolean;
  imageUrl: string;
  sizes: string[];
  defaultSize?: string;
}

export type ProductFormData = Pick<
  Product,
  "name" | "categoryId" | "price" | "uom" | "tax" | "active"
> & {
  id?: string;
};

export interface ProductCategoryOption {
  id: string;
  name: string;
}
