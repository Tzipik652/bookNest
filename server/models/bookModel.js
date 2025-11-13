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
      .order("title", { ascending: true });

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
 * Fetch a paginated list of books with pagination support.
 * @param {number} page - Current page number (starting at 1).
 * @param {number} limit - Maximum items per page.
 * @returns {Promise<{data: Object[], count: number}>} - The data and total record count.
 */
export async function findPaginated(page = 1, limit = 10, category = null) {
  try {
    const pageNum = Math.max(1, page);
    const limitNum = Math.max(1, limit);
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum - 1;

    let query = supabase
      .from("books")
      .select(
        `
          *,
          user: user_id (
            name,
            email
          )
        `,
        { count: 'exact' }
      )
      .order("title", { ascending: true })
    // .range(start, end);

    // אם קיימת קטגוריה, נוסיף filter
    if (category) {
      query = query.eq('category', category);
    }

    query = query.range(start, end);
    const { data, count } = await query;
    return { data, count };
  } catch (err) {
    console.error("Failed to fetch books in findAll model:", err);
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
    .in('_id', ids) // where the 'id' field is in the ids array we received
    .order("title", { ascending: true });

  if (error) {
    console.error("Error fetching books by IDs:", error);
    throw new Error(error.message);
  }

  return books || [];
};

export const getBooksByCategory = async (category) => {
  const { data: books, error } = await supabase
    .from('books')
    .select('*') // fetch all columns of the book
    .eq('category', category) // where the 'category' field matches the category we received
    .order("title", { ascending: true });

  if (error) {
    console.error("Error fetching books by category:", error);
    throw new Error(error.message);
  }
  return books;
}
export default { create, findAll, findById, update, remove, findBooksByIds, findPaginated, getBooksByCategory };