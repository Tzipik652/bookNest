import supabase from "../config/supabaseClient.js";

const loanMessagesSelectQuery =`
    id,
    loan_id,
    sender_id(_id, name),
    message_text,
    date_sent,
    type
`;

export async function add(loanMessagesData) {
  const { data, error } = await supabase
    .from("loan_messages")
    .insert({
      loan_id: loanMessagesData.loanId,
      sender_id: loanMessagesData.senderId,
      message_text: loanMessagesData.messageText,
      type: loanMessagesData.type
    })
    .select(loanMessagesSelectQuery)
    .single();
  
  if (error) {
    console.error("Error add loan message:", error);
    throw error;
  }
  return data;
}

export async function update(loanMessageId, loanMessageData) {
  const { data, error } = await supabase
    .from("loan_messages")
    .update(loanMessageData)
    .eq("id", loanMessageId)
    .select()
    .single();

  if (error) {
    console.error("Error updating loan message:", error);
    throw error;
  }
  return data;
}

export async function remove(loanMessageId) {
  const { error } = await supabase
    .from("loan_messages")
    .delete()
    .eq("id", loanMessageId);

  if (error) {
    console.error("Error deleting loan message:", error);
    throw error;
  }
  return true;
}

export async function findLoanMessagesByLoanId(loanId) {
  const { data, error } = await supabase
    .from("loan_messages")
    .select(loanMessagesSelectQuery)
    .eq("loan_id", loanId)
    .order("date_sent", { ascending: true });

  if (error) {
    console.error("Error fetching loan messages by loan ID:", error);
    throw error;
  }
  return data;
}

export async function findLoansBySenderId(senderId) {
  const { data, error } = await supabase
    .from("loan_messages")
    .select(loanMessagesSelectQuery)
    .eq("sender_id", senderId)
    .order("date_sent", { ascending: false });

  if (error) {
    console.error("Error fetching loan messages by sender ID:", error);
    throw error;
  }
  return data;
}

export async function findLoanMessageById(loanMessageId) {
  const { data, error } = await supabase
    .from("loan_messages")
    .select(loanMessagesSelectQuery)
    .eq("id", loanMessageId)
    .single();

  if (error) {
    console.error("Error fetching loan message by ID:", error);
    throw error;
  }
  return data;
}

export default {
  add,
  update,
  remove,
  findLoanMessagesByLoanId,
  findLoansBySenderId,
  findLoanMessageById,
};
