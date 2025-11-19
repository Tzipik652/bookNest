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
 * Get all favorite books (joined with books table, returning category name)
 */
export async function getFavoriteBooks(userId) {
  try {
    const { data, error } = await supabase
      .from("user_favorites")
      .select(`
        book_id, 
        books(
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
          category_details: category ( name ) 
        )
      `)
      .eq("user_id", userId)
      .order("date_added", { ascending: false });

    if (error) throw error;
    
    return data.map((entry) => {
        const book = entry.books;
        const { category_details, ...rest } = book;
        return {
            ...rest,
            category: category_details?.name || null
        };
    });
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function countBookFavorites(bookId) {
    const { count, error } = await supabase
     .from("user_favorites")
     .select("book_id", { count: "exact", head: true })
     .eq("book_id", bookId);

  if (error) throw error;
  return count || 0;
}

/**
 * Fetch a list of complete books by an array of UUID identifiers.
 * @param {string[]} ids - Array of recommended book identifiers.
 * @returns {Promise<Object[]>} - List of complete book objects.
 */
const findBooksByIds = async (ids) => {
  const { data: books, error } = await supabase
    .from('books')
    // בחירה מפורשת וצירוף שם קטגוריה
    .select(`
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
        category_details: category ( name ) 
    `) 
    .in('_id', ids) 
    .order("title", { ascending: true });

  if (error) {
    console.error("Error fetching books by IDs:", error);
    throw new Error(error.message);
  }

  // שיטוח הנתונים
  const cleanedBooks = (books || []).map(book => {
      const { category_details, ...rest } = book;
      return {
          ...rest,
          category: category_details?.name || null
      };
  });

  return cleanedBooks;
};

export const getBooksByCategory = async (category) => {
    
  // **1. איתור ה-UUID לפי שם הקטגוריה (הכרחי)**
  let categoryId = null;
  const { data: categoryData, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .eq("name", category)
    .single();

  if (categoryError) {
     console.warn(`Category name '${category}' not found, returning empty array.`);
     return [];
  }
  categoryId = categoryData.id;

  // **2. שליפת הספרים לפי ה-UUID וצירוף שם הקטגוריה**
  const { data: books, error } = await supabase
    .from('books')
    .select(`
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
      category_details: category ( name ) 
    `)
    .eq('category', categoryId) 
    .order("title", { ascending: true });

  if (error) {
    console.error("Error fetching books by category:", error);
    throw new Error(error.message);
  }
  
  const cleanedBooks = (books || []).map(book => {
      const { category_details, ...rest } = book;
      return {
          ...rest,
          category: category_details?.name || null
      };
  });
  
  return cleanedBooks;
}
export const getFavoritesCount = async () => {
  const { count, error } = await supabase
    .from('user_favorites')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error("Error fetching favorites count:", error);
    throw new Error(error.message);
  }

  return count || 0;
};




export default {
  addFavorite,
  removeFavorite,
  isFavorite,
  getFavoriteBooksList,
  getFavoriteBooks,
  countBookFavorites,
  getFavoritesCount
};