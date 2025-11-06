// bookModel.js - using Supabase client
import supabase from "../config/supabaseClient.js";

/**
 * Create a new book
 */
export async function create(bookData) {
  const { data, error } = await supabase
    .from("books")
    .insert({
      title: bookData.title,
      author: bookData.author,
      description: bookData.description,
      category: bookData.category,
      img_url: bookData.imgUrl,
      price: bookData.price,
      ai_summary: bookData.aiSummary,
      user_id: bookData.user_id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all books
 */
export async function findAll() {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .order("date_created", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get book by ID
 */
export async function findById(id) {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("_id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error; // not found case
  return data || null;
}

/**
 * Update book by ID
 */
export async function update(id, updates) {
  const validKeys = [
    "title",
    "author",
    "description",
    "category",
    "img_url",
    "price",
    "ai_summary",
  ];

  const filteredUpdates = Object.fromEntries(
    Object.entries(updates).filter(
      ([key, value]) => validKeys.includes(key) && value !== undefined
    )
  );

  if (Object.keys(filteredUpdates).length === 0) return null;

  const { data, error } = await supabase
    .from("books")
    .update(filteredUpdates)
    .eq("_id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete book
 */
export async function remove(id) {
  const { data, error } = await supabase
    .from("books")
    .delete()
    .eq("_id", id)
    .select("_id")
    .single();

  if (error && error.code !== "PGRST116") throw error; // not found
  return !!data;
}

export default { create, findAll, findById, update, remove };