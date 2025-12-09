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
  user_name: string;
  profile_picture?: string;
  text: string;
  created_at: string;
  updated_at: string;
  reactions: CommentReaction[];
}

export type CommentWithReactions = Comment & {
  userReaction?: ReactionType;
  reactionCounts: ReactionCounts;
};

export type BookWithFavorite = Book & {
  isFavorited: boolean;
};

export enum LoanStatus {
  REQUESTED = "REQUESTED",
  APPROVED = "APPROVED",
  ACTIVE = "ACTIVE",
  RETURNED = "RETURNED",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED",
}

export interface Loan {
  id: string;
  user_copy: UserCopy;
  borrower_id: string;
  borrower_name: string;
  borrower_email: string;
  status: LoanStatus;
  request_date: string;
  loan_start_date: string;
  due_date: string;
  return_date: string;
}

export interface UserCopy {
  id?: string;
  book_id: string;
  book_title?: string;
  owner_id?: string;
  owner_name?: string;
  owner_email?: string;
  is_available_for_loan: boolean;
  loan_location_lat: number;
  loan_location_lon: number;
  date_added?: string;
}

export interface ChatMessage{
    id: string;
    loan_id: string;
    sender_id: string;
    sender_name: string;
    message_text: string;
    date_sent: string;
}