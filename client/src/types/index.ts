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
  user_id: string;
  user: {
    name: string;
    email: string;
  };
  date_created: string;
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
  reactions: CommentReaction[];
}

export type CommentWithReactions = Comment & {
  userReaction?: ReactionType;
  reactionCounts: ReactionCounts;
};
