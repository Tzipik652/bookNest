
// models/commentModel.js (מעודכן - בלי reactions)
import supabase from "../config/supabaseClient.js";

/**
 * יצירת תגובה חדשה
 */
export async function create({ bookId, userId, text }) {
  const { data, error } = await supabase
    .from("comments")
    .insert([
      {
        book_id: bookId,
        user_id: userId,
        text: text,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}


export async function findByBookId(bookId) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      id,
      book_id,
      user_id,
      text,
      created_at,
      updated_at,
      users(name)
    `)
    .eq('book_id', bookId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Map the joined name to userName
  return data.map(c => ({
    ...c,
    user_name: c.users?.name || 'Unknown',
  }));
}

export async function findById(commentId) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('id', commentId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

/**
 * מחיקת תגובה
 */
export async function remove(commentId) {
  const { data, error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .select("id")
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return !!data;
}
export async function findAll() {
  const { data, error } = await supabase
    .from('comments') 
    .select(`*`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}