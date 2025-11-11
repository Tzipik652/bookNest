import supabase from "../config/supabaseClient.js";

/**
 * Add a book to user's favorites
 */
export async function addFavorite(userId, bookId) {
  const { error } = await supabase
    .from("user_favorites")
    .insert([{ user_id: userId, book_id: bookId }])
    .select();

  if (error && error.code !== "23505") throw error; // ignore "already exists"
  return true;
}

/**
 * Remove a book from user's favorites
 */
export async function removeFavorite(userId, bookId) {
  const { error } = await supabase
    .from("user_favorites")
    .delete()
    .eq("user_id", userId)
    .eq("book_id", bookId);

  if (error) throw error;
  return true;
}

/**
 * Check if a book is in user's favorites
 */
export async function isFavorite(userId, bookId) {
  const { data, error } = await supabase
    .from("user_favorites")
    .select("book_id")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

/**
 * Get list of favorite book IDs for a user
 */
export async function getFavoriteBooksList(userId) {
  const { data, error } = await supabase
    .from("user_favorites")
    .select("book_id")
    .eq("user_id", userId);

  if (error) throw error;
  return data.map((row) => row.book_id);
}

/**
 * Get all favorite books (joined with books table)
 */
export async function getFavoriteBooks(userId) {
  const { data, error } = await supabase
    .from("user_favorites")
    .select("book_id, books(*)")
    .eq("user_id", userId)
    .order("date_added", { ascending: false });

  if (error) throw error;
  return data.map((entry) => entry.books);
}

export async function countBookFavorites(bookId) {
   const { count, error } = await supabase
    .from("user_favorites")
    .select("book_id", { count: "exact", head: true })
    .eq("book_id", bookId);

  if (error) throw error;
  return count || 0;
}

export default {
  addFavorite,
  removeFavorite,
  isFavorite,
  getFavoriteBooksList,
  getFavoriteBooks,
  countBookFavorites
};
