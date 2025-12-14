import supabase from "../config/supabaseClient.js";

const loanSelectQuery = `
      id,
      user_copy_id(  
        id,
        book_id:books!fk_copy_book(_id, title),
        owner_id:users!fk_copy_owner(_id, name, email),
        is_available_for_loan,
        loan_location_lat,
        loan_location_lon,
        date_added),
      borrower_id(_id, name, email),
      status,
      request_date,
      loan_start_date,
      due_date,
      return_date
`;

export async function add(loanData) {
  const { data, error } = await supabase
    .from("loans")
    .insert({
      user_copy_id: loanData.userCopyId,
      borrower_id: loanData.borrowerId,
      status: "REQUESTED",
    })
    .select(loanSelectQuery)
    .single();

  if (error) {
    console.error("Error add loan:", error);
    throw error;
  }
  return data;
}

export async function update(loanId, loanData) {
  const { data, error } = await supabase
    .from("loans")
    .update(loanData)
    .eq("id", loanId)
    .select()
    .single();

  if (error) {
    console.error("Error updating loan:", error);
    throw error;
  }
  return data;
}

export async function remove(loanId) {
  const { error } = await supabase.from("loans").delete().eq("id", loanId);

  if (error) {
    console.error("Error deleting loan:", error);
    throw error;
  }
  return true;
}

export async function findLoansByBorrowerId(borrowerId) {
  const { data, error } = await supabase
    .from("loans")
    .select(loanSelectQuery)
    .eq("borrower_id", borrowerId);

  if (error) {
    console.error("Error fetching loans by borrower ID:", error);
    throw error;
  }
    if (!data || data.length === 0) {
    return []; 
  }
  return data;
}

export async function findLoansByUserId(userId) {
  const { data, error } = await supabase
    .from("loans")
    .select(loanSelectQuery)
    .filter("user_copy_id.owner_id._id", "eq", userId);
  if (error) {
    console.error("Error fetching loans by user ID:", error);
    throw error;
  }
  if (!data || data.length === 0|| data[0].user_copy_id.owner_id === null) {
    return []; 
  }
  return data;
}

export async function findActiveLoansByUserCopyId(userCopyId) {
  const { data, error } = await supabase
    .from("loans")
    .select(loanSelectQuery)
    .eq("user_copy_id", userCopyId)
    .eq("status", "ACTIVE");

  if (error) {
    console.error("Error fetching active loan by user copy ID:", error);
    throw error;
  }
  return data;
}

export async function findLoanById(loanId) {
  const { data, error } = await supabase
    .from("loans")
    .select(loanSelectQuery)
    .eq("id", loanId)
    .single();

  if (error) {
    console.error("Error fetching loan by ID:", error);
    throw error;
  }
  return data;
}

export default {
  add,
  update,
  remove,
  findLoansByBorrowerId,
  findLoansByUserId,
  findActiveLoansByUserCopyId,
  findLoanById,
};
