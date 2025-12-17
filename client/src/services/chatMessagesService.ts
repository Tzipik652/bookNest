// services/chatMessagesService.ts
import { ChatMessage, ChatMessageType } from "../types";
import axios from "axios";
import { useUserStore } from "../store/useUserStore";
import { supabaseFrontendClient } from "../utils/supabaseFrontendClient";
const loanMessagesSelectQuery =`
    id,
    loan_id,
    sender_id(_id, name),
    message_text,
    date_sent,
    type
`;
function handleAxiosError(error: any): never {
  if (axios.isAxiosError(error)) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Something went wrong with the API request"
    );
  } else {
    throw new Error("Unexpected error: " + error);
  }
}
function transformChatMessages(raw: any): ChatMessage {
  return {
    id: raw.id,
    loan_id: raw.loan_id,
    sender_id: raw.sender_id._id,
    sender_name: raw.sender_id.name,
    message_text: raw.message_text,
    date_sent: raw.date_sent,
    type: raw.type
  };
}
export async function sendChatMessage(
  loanId: string,
  text: string,
  type: ChatMessageType = "user"
) {
  try{
    const { user: currentUser } = useUserStore();

    const { error } = await supabaseFrontendClient.from("loan_messages").insert({
      loan_id: loanId,
      message_text: text,
      type,
      sender_id: currentUser?._id,
    });
  }catch(error){
    handleAxiosError(error);
  }

}
export async function getChatMessages(loanId: string) {
  try{
    const { data, error } = await supabaseFrontendClient
      .from("loan_messages")
      .select(loanMessagesSelectQuery)
      .eq("loan_id", loanId)
      .order("date_sent", { ascending: true });
    return data?.map(transformChatMessages);
  }catch(error){
    handleAxiosError(error);
  }

}

