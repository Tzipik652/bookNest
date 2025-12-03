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
    .update({ is_deleted: true }) // ⬅️ עדכון דגל המחיקה
    .eq('_id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}