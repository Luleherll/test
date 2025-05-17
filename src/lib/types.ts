export interface ProductMedia {
  id: number;
  productId: number;
  url: string;
  type: 'image' | 'video';
}

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  createdAt: string;
  views: number;
  media?: ProductMedia[];
}

export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video';
}

export type ProductFormData = {
  title: string;
  price: number;
  description: string;
  category: string;
  media: File[];
};
