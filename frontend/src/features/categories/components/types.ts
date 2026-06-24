export interface Category {
  id: string;
  name: string;
  color: string;
  image: string | null; // base64 uploaded image or null
  productCount: number;
  revenue: string;
  createdAt: string;
}
