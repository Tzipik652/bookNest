export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  imageUrl: string;
  price?: number;
  aiSummary: string;
  uploaderId: string;
  uploaderName: string;
  createdAt: string;
}

export interface Favorite {
  userId: string;
  bookId: string;
}
