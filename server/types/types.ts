export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  description?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
}