// categoryModel.js - using Supabase client
import supabase from "../config/supabaseClient.js";

/**
 * Create a new category
 */
export async function create(categoryData) {
  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: categoryData.name,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all categories
 */
export async function findAll() {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    throw err;
  }
}

/**
 * Get category by ID
 */
export async function findById(id) {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error; // not found case
  return data || null;
}

/**
 * Update category by ID
 */
export async function update(id, updates) {
  const validKeys = ["name"];

  const filteredUpdates = Object.fromEntries(
    Object.entries(updates).filter(
      ([key, value]) => validKeys.includes(key) && value !== undefined
    )
  );

  if (Object.keys(filteredUpdates).length === 0) return null;

  const { data, error } = await supabase
    .from("categories")
    .update(filteredUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete category
 */
export async function remove(id) {
  const { data, error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .select("id")
    .single();

  if (error && error.code !== "PGRST116") throw error; // not found
  return !!data;
}

export default { create, findAll, findById, update, remove };
