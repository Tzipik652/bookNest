import supabase from "../config/supabaseClient.js";

const copySelectQuery = `
    id,
    book_id (_id, title),
    owner_id (_id, name, email),
    is_available_for_loan,
    loan_location_lat,
    loan_location_lon,
    date_added
`;

export async function add(copyData) {
  if (
    copyData.isAvailableForLoan &&
    (!copyData.loanLocationLat || !copyData.loanLocationLon)
  ) {
    throw new Error(
      "Validation Error: Loan location is required when available for loan."
    );
  }
  const { data, error } = await supabase
    .from("user_copies")
    .insert({
      book_id: copyData.bookId,
      owner_id: copyData.userId,
      is_available_for_loan: true,
      loan_location_lat: copyData.loanLocationLat,
      loan_location_lon: copyData.loanLocationLon,
    })
    .select(copySelectQuery)
    .single();

  if (error) {
    console.error("Error add copy:", error);
    throw error;
  }
  return data;
}

export async function update(copyId, copyData) {
  const { data, error } = await supabase
    .from("user_copies")
    .update(copyData)
    .eq("id", copyId)
    .select(copySelectQuery)
    .maybeSingle();

  if (error) {
    console.error("Error updating copy:", error);
    throw error;
  }
  return data;
}

export async function remove(copyId) {
  const { error } = await supabase
    .from("user_copies")
    .delete()
    .eq("id", copyId);

  if (error) {
    console.error("Error deleting copy:", error);
    throw error;
  }
  return true;
}

export async function findAll() {
  const { data, error } = await supabase
    .from("user_copies")
    .select(copySelectQuery);

  if (error) {
    console.error("Error fetching all copies:", error);
    throw error;
  }
  return data;
}

export async function findById(copyId) {
  const { data, error } = await supabase
    .from("user_copies")
    .select(copySelectQuery)
    .eq("id", copyId)
    .single();

  if (error) {
    console.error("Error fetching copy by ID:", error);
    throw error;
  }

  if (!data) {
    throw new Error(`Copy with id ${copyId} not found`);
  }

  return data;
}

export async function findByUserId(userId) {
  const { data, error } = await supabase
    .from("user_copies")
    .select(copySelectQuery)
    .eq("owner_id", userId);

  if (error) {
    console.error("Error fetching copies by user ID:", error);
    throw error;
  }
  return data;
}

export async function findByBookId(bookId) {
  const { data, error } = await supabase
    .from("user_copies")
    .select(copySelectQuery)
    .eq("book_id", bookId);

  if (error) {
    console.error("Error fetching copies by book ID:", error);
    throw error;
  }
  return data;
}
export async function findBookCopyByUserId(userId, bookId) {
  const { data, error } = await supabase
    .from("user_copies")
    .select(copySelectQuery)
    .eq("owner_id", userId)
    .eq("book_id", bookId);
  // .single();

  if (error) {
    console.error("Error fetching user copy:", error);
    throw error;
  }
  return data[0];
}
export async function isCopyExist(userId, bookId) {
  const { data, error } = await supabase
    .from("user_copies")
    .select("id")
    .eq("owner_id", userId)
    .eq("book_id", bookId);

  if (error) {
    console.error("Error fetching copies by user ID:", error);
    throw error;
  }
  return data.length > 0;
}

export async function getAvailableCopiesForBook(bookId) {
  const { data, error } = await supabase
    .from("user_copies")
    .select(copySelectQuery)
    .eq("book_id", bookId)
    .eq("is_available_for_loan", true);

  if (error) {
    console.error("Error fetching available copies by book ID:", error);
    throw error;
  }
  return data;
}

export default {
  add,
  getAvailableCopiesForBook,
  update,
  remove,
  findAll,
  findById,
  findByUserId,
  findByBookId,
  isCopyExist,
  findBookCopyByUserId,
};
