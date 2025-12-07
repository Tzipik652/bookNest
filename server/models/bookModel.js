// bookModel.js - using Supabase client
import supabase from "../config/supabaseClient.js";
import { getFavoriteBooksList } from "./userModel.js";

const bookSelectQuery = `
  _id,
  title,
  author,
  description,
  img_url,
  price,
  ai_summary,
  user_id,
  date_created,
  user: user_id ( name, email ),
  category_details: category ( name ),
  user_favorites: user_favorites_book_id_fkey(count)
`;

function normalizeBook(book) {
  if (!book) return null;

  const { category_details, user_favorites, ...rest } = book;
  const favorites_count =
    Array.isArray(user_favorites) && user_favorites.length > 0
      ? user_favorites[0].count
      : 0;
  return {
    ...rest,
    category: category_details?.name ?? null,
    favorites_count: favorites_count,
  };
}
export async function create(bookData) {
  const { data: categoryData, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .eq("name", bookData.category)
    .single();

  if (categoryError) {
    console.error("Error fetching category ID:", categoryError);
    throw new Error(`Category not found: ${bookData.category}`);
  }

  const categoryId = categoryData.id;

  const { data, error } = await supabase
    .from("books")
    .insert({
      title: bookData.title,
      author: bookData.author,
      description: bookData.description,
      category: categoryId,
      img_url: bookData.img_url,
      price: bookData.price,
      ai_summary: bookData.ai_summary,
      user_id: bookData.user_id,
    })
    .select()
    .single();

  if (error && error.code === "23505") {
    console.warn(
      `duplication,Category name '${bookData.category}' already exists.`
    );
    throw error;
  } else if (error) {
    console.error("Error creating book:", error);
    throw error;
  }
  return data;
}
/**
 * Get all books
 */
export async function findAll() {
  //join with users to get uploader name
  const { data, error } = await supabase
    .from("books")
    .select(bookSelectQuery)
    .order("title", { ascending: true });

  if (error) {
    throw error;
  }

  return data.map(normalizeBook);
}

/**
 * Fetch a paginated list of books with pagination support.
 * @param {number} page - Current page number (starting at 1).
 * @param {number} limit - Maximum items per page.
 * @param {string | null} category - The category NAME (e.g., 'Fiction', 'Romance') or null.
 * @returns {Promise<{data: Object[], count: number}>} - The data and total record count.
 */
export async function findPaginated(page = 1, limit = 10, category = null) {
  try {
    const pageNum = Math.max(1, page);
    const limitNum = Math.max(1, limit);
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum - 1;

    let categoryId = null;

    if (category) {
      const { data, error } = await supabase
        .from("categories")
        .select("id")
        .eq("name", category)
        .single();

      categoryId = data?.id ?? null;
    }

    let query = supabase
      .from("books")
      .select(bookSelectQuery, { count: "exact" })
      .order("title", { ascending: true })
      .range(start, end);

    if (categoryId) {
      query = query.eq("category", categoryId);
    }

    const { data, count, error } = await query;

    if (error) throw error;

    return { data: data.map(normalizeBook), count };
  } catch (err) {
    console.error("Failed to fetch books in findPaginated model:", err);
    throw err;
  }
}
/**
 * Get book by ID
 */
// export async function findById(id) {
//   const { data, error } = await supabase
//     .from("books")
//     .select(bookSelectQuery)
//     .eq("_id", id)
//     .single();

//   if (error && error.code !== "PGRST116") throw error; // not found case

//   return normalizeBook(data);
// }

export async function findById(bookId) {
  const query = `${bookSelectQuery}, 
    comments (
      id, text, created_at, user_id, book_id,
      users (name, email, profile_picture)
    )
  `;

  const { data: book, error } = await supabase
    .from('books')
    .select(query)
    .eq('_id', bookId)
    .single();

  if (error) throw error;

  if (book.comments && book.comments.length > 0) {
    const commentIds = book.comments.map((c) => c.id);

    const { data: reactionsData } = await supabase
      .from("comment_reactions")
      .select("comment_id, reaction_type")
      .in("comment_id", commentIds);

    book.comments = book.comments.map((comment) => {
      const myReactions =
        reactionsData?.filter((r) => r.comment_id === comment.id) || [];

      const counts = {
        like: myReactions.filter((r) => r.reaction_type === "like").length,
        dislike: myReactions.filter((r) => r.reaction_type === "dislike").length,
        happy: myReactions.filter((r) => r.reaction_type === "happy").length,
        angry: myReactions.filter((r) => r.reaction_type === "angry").length,
      };

      return {
        ...comment,
        user_name: comment.users?.name || "Unknown",
        profile_picture: comment.users?.profile_picture,
        reaction_counts: counts,
      };
    });
  }

  // שימוש בפונקציית הנרמול הקיימת (הערות יעברו כחלק מה-rest)
  return normalizeBook(book);
}
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

  let updatesToDb = { ...updates };

  if (updates.category) {
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("name", updates.category)
      .single();

    if (categoryError) {
      throw new Error(`Category not found: ${updates.category}`);
    }

    updatesToDb.category = categoryData.id;
  }

  const filteredUpdates = Object.fromEntries(
    Object.entries(updatesToDb).filter(
      ([key, value]) => validKeys.includes(key) && value !== undefined
    )
  );

  if (Object.keys(filteredUpdates).length === 0) return null;

  const { data, error } = await supabase
    .from("books")
    .update(filteredUpdates)
    .eq("_id", id)
    .select(bookSelectQuery)
    .single();

  if (error) throw error;

  return normalizeBook(data);
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
  const favoriteBooksList = await getFavoriteBooksList(userId);
  if (!favoriteBooksList || favoriteBooksList.length === 0) {
    return [];
  }
  const { data, error } = await supabase
    .from("books")
    .select(bookSelectQuery)
    .in("_id", favoriteBooksList)
    .order("title", { ascending: true });

  if (error) throw error;

  return data.map(normalizeBook);
}
/**
 * Fetch a list of complete books by an array of UUID identifiers.
 * @param {string[]} ids - Array of recommended book identifiers.
 * @returns {Promise<Object[]>} - List of complete book objects.
 */
const findBooksByIds = async (ids) => {
  if (!ids || ids.length === 0) return [];

  const { data, error } = await supabase
    .from("books")
    .select(bookSelectQuery)
    .in("_id", ids)
    .order("title", { ascending: true });

  if (error) {
    console.error("Error fetching books by IDs:", error);
    throw new Error(error.message);
  }

  return data.map(normalizeBook);
};

export const getBooksByCategory = async (category) => {
  const { data: categoryData } = await supabase
    .from("categories")
    .select("id")
    .eq("name", category)
    .single();

  if (!categoryData) return [];

  const { data, error } = await supabase
    .from("books")
    .select(bookSelectQuery)
    .eq("category", categoryData.id)
    .order("title", { ascending: true });

  if (error) {
    console.error("Error fetching books by category:", error);
    throw new Error(error.message);
  }

  return data.map(normalizeBook);
};

export async function searchBooks(searchTerm, page, limit, categoryId) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("books")
    .select(bookSelectQuery, { count: "exact" })
    .order("title", { ascending: true });

  if (searchTerm) {
    query = query.or(
      `title.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%`
    );
  }
  if (categoryId) {
    query = query.eq("category", categoryId);
  }
  const { data, count, error } = await query.range(from, to);

  if (error) throw error;

  return {
    books: data.map(normalizeBook),
    totalPages: Math.ceil(count / limit),
  };
}

export default {
  create,
  findAll,
  findById,
  update,
  remove,
  findBooksByIds,
  getFavoriteBooks,
  findPaginated,
  getBooksByCategory,
  searchBooks,
};
