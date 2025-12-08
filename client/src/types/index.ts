export interface User {
  _id: string;
  email: string;
  name: string;
  auth_provider: string;
  favorites: string[];
  profile_picture?: string;
  role: "user" | "admin";
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
  user_id: string;
  user: {
    name: string;
    email: string;
  };
  date_created: string;
  favorites_count?: number;
}

export interface Favorite {
  userId: string;
  bookId: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export type ReactionType = "like" | "dislike" | "happy" | "angry";

export interface ReactionCounts {
  like: number;
  dislike: number;
  happy: number;
  angry: number;
}

export interface CommentReaction {
  id: string;
  comment_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

export interface Comment {
  id: string;
  book_id: string;
  user_id: string;
  text: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  profile_picture?: string | null;
  user?: {
    name: string;
    email: string;
    profile_picture?: string | null;
  };
  book?: {
    id: string;
    title: string;
  };
  reaction_counts?: {
    like: number;
    dislike: number;
    happy: number;
    angry: number;
  };
  reactions?: CommentReaction[];
}

export interface CommentWithReactions extends Omit<Comment, 'reaction_counts'> {
  reaction_counts: ReactionCounts;
  user_reaction?: ReactionType | null;
}

export type BookWithFavorite = Book & {
  isFavorited: boolean;
};
export type PaginatedResponse<T> = {
  [key: string]: T[] | number; 
  totalItems: number;
  totalPages: number;
  currentPage: number;
} & { comments?: T[]; books?: T[]; users?: T[] };