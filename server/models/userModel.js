// models/userModel.js
import supabase from '../config/supabaseClient.js';

export async function getUserById(id) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('_id', id)
    .single();

  if (error) throw error;
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
    .from('users')
    .select('favorites')
    .eq('_id', id);

  if (error) throw error;
  return data.favorites;
}