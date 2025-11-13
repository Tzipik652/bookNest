// bookModel.js - using Supabase client
import supabase from "../config/supabaseClient.js";
import { getFavoriteBooksList } from "./userModel.js";

/**
 * Create a new book
 */
// export async function create(bookData) {
//   const { data, error } = await supabase
//     .from("books")
//     .insert({
//       title: bookData.title,
//       author: bookData.author,
//       description: bookData.description,
//       category: bookData.category,
//       img_url: bookData.imgUrl,
//       price: bookData.price,
//       ai_summary: bookData.ai_summary,
//       user_id: bookData.user_id,
//     })
//     .select()
//     .single();

//   if (error) throw error;
//   return data;
// }
/**
 * Create a new book
 */
export async function create(bookData) {
  // 1. איתור מזהה הקטגוריה (UUID) לפי השם שסופק ב-bookData.category
  const { data: categoryData, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .eq("name", bookData.category)
    .single();

  if (categoryError) {
    console.error("Error fetching category ID:", categoryError);
    // אם לא נמצא מזהה, זרוק שגיאה
    throw new Error(`Category not found: ${bookData.category}`);
  }

  const categoryId = categoryData.id;

  // 2. הכנסת הספר עם מזהה הקטגוריה שנמצא
  const { data, error } = await supabase
    .from("books")
    .insert({
      title: bookData.title,
      author: bookData.author,
      description: bookData.description,
      // שימוש ב-categoryId שאותחל
      category: categoryId, 
      img_url: bookData.imgUrl,
      price: bookData.price,
      ai_summary: bookData.ai_summary,
      user_id: bookData.user_id,
    })
    .select()
    .single();

     if (error && error.code === "23505") {
      console.warn(`duplication,Category name '${bookData.category}' already exists.`);  
      throw error;
    }
    else if (error) {
      console.error("Error creating book:", error);
      throw error;
    }
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
        ),
        category: category (
          name
        )
      `)
      .order("title", { ascending: true });

    if (error) {
      throw error;
    }
const cleanedData = data.map(book => ({
        _id: book._id,
        title: book.title,
        author: book.author,
        description: book.description,
        img_url: book.img_url,
        price: book.price,
        ai_summary: book.ai_summary,
        user_id: book.user_id,
        date_created: book.date_created,
        user: book.user,
        // החלפת ה-UUID בשם הקטגוריה
        category: book.category ? book.category.name : null 
    }));
    return cleanedData;
    // return data;
  } catch (err) {
    console.error("Failed to fetch books:", err);
    throw err;
  }
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
      
      if (error) {
         console.warn(`Category name '${category}' not found, skipping filter.`);
      } else {
        categoryId = data.id;
      }
    }

    let query = supabase
      .from("books")
      .select(
        `
          _id,
          title,
          author,
          description,
          img_url,
          price,
          ai_summary,
          user_id,
          date_created,
          user: user_id (
            name,
            email
          ),
          category_details: category ( 
            name
          )
        `,
        { count: 'exact' }
      )
      .order("title", { ascending: true })

    if (categoryId) {
      query = query.eq('category', categoryId);
    }

    query = query.range(start, end);
    const { data, count } = await query;
    
    const cleanedData = data.map(book => ({
        _id: book._id,
        title: book.title,
        author: book.author,
        description: book.description,
        img_url: book.img_url,
        price: book.price,
        ai_summary: book.ai_summary,
        user_id: book.user_id,
        date_created: book.date_created,
        user: book.user,
        category: book.category_details ? book.category_details.name : null 
    }));

    return { data: cleanedData, count };
  } catch (err) {
    console.error("Failed to fetch books in findPaginated model:", err);
    throw err;
  }
}
/**
 * Get book by ID
 */
export async function findById(id) {
  const { data, error } = await supabase
    .from("books")
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
      category_details: category ( name ) // צירוף שם הקטגוריה לשדה זמני
    `)
    .eq("_id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error; // not found case

  if (data) {
    const { category_details, ...rest } = data;

    return {
      ...rest,
      category: category_details?.name || null 
    };
  }

  return null;
}

/**
 * Update book by ID
 */
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

  let updatesToDb = { ...updates }; // עותק ניתן לשינוי של הנתונים לעדכון

  // **1. טיפול בקטגוריה: המרת שם ל-UUID לפני העדכון**
  if (updates.category) {
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("name", updates.category)
      .single();

    if (categoryError) {
      // אם שם הקטגוריה לא נמצא, זורק שגיאה
      throw new Error(`Category not found: ${updates.category}`);
    }

    // החלפת שם הקטגוריה ב-UUID שלו עבור עדכון טבלת books
    updatesToDb.category = categoryData.id;
  }

  // 2. סינון העדכונים לוודא שהם כוללים רק מפתחות תקפים
  const filteredUpdates = Object.fromEntries(
    Object.entries(updatesToDb).filter(
      ([key, value]) => validKeys.includes(key) && value !== undefined
    )
  );

  if (Object.keys(filteredUpdates).length === 0) return null;

  // 3. ביצוע העדכון ושליפת הנתונים עם שם הקטגוריה
  const { data, error } = await supabase
    .from("books")
    .update(filteredUpdates)
    .eq("_id", id)
    // בחירה מפורשת לשיטוח הנתונים המוחזרים
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
    .single();

  if (error) throw error;
  
  // 4. שיטוח הנתונים המוחזרים (הפיכת category_details.name לשדה category)
  if (data) {
    const { category_details, ...rest } = data;
    return {
      ...rest,
      category: category_details?.name || null 
    };
  }
  
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
    const favoriteBooksList = await getFavoriteBooksList(userId);

    const { data, error } = await supabase
      .from("books")
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
      .in("_id", favoriteBooksList) 
      .order("title", { ascending: true });

    if (error) throw error;
    
    const cleanedData = data.map(book => {
        const { category_details, ...rest } = book;
        return {
            ...rest,
            category: category_details?.name || null
        };
    });

    return cleanedData;
  } catch (error) {
    console.log(`in getFavoriteBooks`);
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
      category_details: category ( name ) // צירוף שם הקטגוריה
    `) // fetch all columns of the book and join user/category
    .in('_id', ids) // where the '_id' field is in the ids array we received
    .order("title", { ascending: true });

  if (error) {
    console.error("Error fetching books by IDs:", error);
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
};
export const getBooksByCategory = async (category) => {
    
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
export default { create, findAll, findById, update, remove, getFavoriteBooks, findBooksByIds, findPaginated, getBooksByCategory };