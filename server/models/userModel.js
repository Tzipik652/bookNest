// models/userModel.js
import supabase from '../config/supabaseClient.js';

export async function getUserById(id) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('_id', id)
    .eq('is_deleted', false) // ⬅️ נוסף: סינון משתמשים מחוקים
    .single();

  if (error) throw error;
  // הערה: אם המשתמש קיים אך is_deleted=true, השאילתה תחזיר NULL.
  return data;
}

export async function createUser({ id, name, email, role = 'user' }) {
  const { data, error } = await supabase
    .from('users')
    .insert([{ id, name, email, role }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateUser(id, updates) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('_id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getFavoriteBooksList(id) {
  const { data, error } = await supabase
    .from('user_favorites')
    .select('book_id') // Selecting only the book_id (UUID)
    .eq('user_id', id);

  if (error) {
    throw error;
  }

  // Returning a clean array of book UUID strings: ['uuid1', 'uuid2', ...]
  return data.map(item => item.book_id);
}
export async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('is_deleted', false); // ⬅️ נוסף: סינון משתמשים מחוקים

  if (error) throw error;
  return data;
}
export async function deleteUser(id) {
  const { data, error } = await supabase
    .from('users')
    .update({ is_deleted: true })
    .eq('_id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch a paginated list of users with pagination support.
 * @param {number} page - Current page number (starting at 1).
 * @param {number} limit - Maximum items per page.
 * @returns {Promise<{users: Object[], totalCount: number}>} - The data and total record count.
 */
export async function findPaginatedUsers(page = 1, limit = 10, category = null) {
  try {
    const pageNum = Math.max(1, page);
    const limitNum = Math.max(1, limit);
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum - 1;

    const { data, count, error } = await supabase
      .from("users")
      .select('*', { count: "exact" })
      .order("name", { ascending: true })
      .range(start, end);

    if (error) throw error;

    return {
    users: data,
    totalCount: count || 0,
  };
  } catch (err) {
    console.error("Failed to fetch users in findPaginatedUsers model:", err);
    throw err;
  }
}
export async function searchUsersByNameOrEmail(searchTerm, page = 1, limit = 10) {
  try {
    const pageNum = Math.max(1, page);
    const limitNum = Math.max(1, limit);
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum - 1;

    const { data, count, error } = await supabase
      .from("users")
      .select("*",{ count: "exact" })
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .order("name", { ascending: true })
      .range(start, end);

    if (error) throw error;

    return {
      users: data,
      totalCount: count || 0,
    };
  } catch (err) {
    console.error("Failed to search users in searchUsersByNameOrEmail model:", err);
    throw err;
  }
}