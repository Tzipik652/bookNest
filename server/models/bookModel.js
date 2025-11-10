// bookModel.js - using Supabase client
import supabase from "../config/supabaseClient.js";
import { getFavoriteBooksList } from "./userModel.js";

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
      ai_summary: bookData.ai_summary,
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
  try {
    // const { data, error } = await supabase
    //   .from("books")
    //   .select("*")
    //   .order("date_created", { ascending: false });

    // if (error) {
    //   throw error;
    // }

    // return data;
    //join with users to get uploader name
    const { data, error } = await supabase
      .from("books")
      .select(`
        *,
        user: user_id (
      name,
      email
    )
      `)
      .order("date_created", { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Failed to fetch books:", err);
    throw err;
  }
}

/**
 * Get book by ID
 */
export async function findById(id) {
  const { data, error } = await supabase
    .from("books")
    .select("* , user: user_id ( name, email )")
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
export async function getFavoriteBooks(userId) {
  try {
    const favoriteBooksList=await getFavoriteBooksList(userId);
    const { data, error } = await supabase
    .from("books")
    .select("* , user: user_id ( name, email )")
    .eq("user_id", userId)
    .in("_id", favoriteBooksList)
    .order("date_created", { ascending: false });

  if (error) throw error;
  return data;
  } catch (error) {
    console.log(error);
    return [];    
  }
  
}
/**
 * Fetch a list of complete books by an array of UUID identifiers.
 * @param {string[]} ids - Array of recommended book identifiers.
 * @returns {Promise<Object[]>} - List of complete book objects.
 */
const findBooksByIds = async (ids) => {
    // Supabase (Postgres) uses `.in()` to execute SQL query with WHERE id IN (...)
    const { data: books, error } = await supabase
        .from('books')
        .select('*') // fetch all columns of the book
        .in('_id', ids); // where the 'id' field is in the ids array we received

    if (error) {
        console.error("Error fetching books by IDs:", error);
        throw new Error(error.message);
    }
    
    return books || [];
};

export default { create, findAll, findById, update, remove, getFavoriteBooks ,findBooksByIds};