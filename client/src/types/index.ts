export interface User {
  _id: string;
  email: string;
  name: string;
  auth_provider: string;
  favorites: string[];
  profile_picture?: string;
}

export interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  img_url: string;
  price?: number;
  ai_summary: string;
  uploaderId: string;
  uploaderName: string;
  createdAt: string;
}

export interface Favorite {
  userId: string;
  bookId: string;
}
