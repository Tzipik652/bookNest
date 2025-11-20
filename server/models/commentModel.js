import supabase from "../config/supabaseClient.js";

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
    .select(
      `
       id,
      book_id,
      user_id,
      text,
      created_at,
      updated_at,
      users(name, auth_provider, profile_picture)
    `
    )
    .single();

  if (error) throw error;
  return {
    ...data,
    user_name: data.users?.name || "Unknown",
    profile_picture:
      data.users?.auth_provider == "google" ? data.users?.profile_picture : null,
  };
}

export async function findByBookId(bookId) {
  const { data, error } = await supabase
    .from("comments")
    .select(
      `
      id,
      book_id,
      user_id,
      text,
      created_at,
      updated_at,
      users(name, auth_provider, profile_picture)
    `
    )
    .eq("book_id", bookId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Map the joined name to userName
  return data.map((c) => ({
    ...c,
    user_name: c.users?.name || "Unknown",
    profile_picture:
      c.users?.auth_provider == "google" ? c.users?.profile_picture : null,
  }));
}

export async function findById(commentId) {
  const { data, error } = await supabase
    .from("comments")
    .select(
      `
      id,
      book_id,
      user_id,
      text,
      created_at,
      updated_at,
      users(name, auth_provider, profile_picture)
    `
    )
    .eq("id", commentId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return {
    ...data,
    user_name: data.users?.name || "Unknown",
    profile_picture:
      data.users?.auth_provider == "google" ? data.users?.profile_picture : null,
  };
}

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
    .from("comments")
    .select(
      `
      id,
      book_id,
      user_id,
      text,
      created_at,
      updated_at,
      users(name, auth_provider, profile_picture)
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data.map((c) => ({
    ...c,
    user_name: c.users?.name || "Unknown",
    profile_picture:
      c.users?.auth_provider == "google" ? c.users?.profile_picture : null,
  }));
}
