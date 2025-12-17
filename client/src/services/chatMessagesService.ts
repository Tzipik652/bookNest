import { Book, ChatMessage, ChatMessageType, Loan, LoanStatus } from "../types";
import api from "../lib/axiosInstance";
import axios from "axios";
const API_BASE_URL =
  `${import.meta.env.VITE_SERVER_URL}/loan-messages` ||
  "http://localhost:5000/loan-messages";

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
export const getChatMessages = async (
  loanId: string
): Promise<ChatMessage[]> => {
  try {
    const res = await api.get(`${API_BASE_URL}/${loanId}/chat-messages`);
    return res.data.data.map(transformChatMessages);
  } catch (error) {
    handleAxiosError(error);
  }
};

export const sendChatMessage = async (loanId: string, message: string, type:ChatMessageType = "user") => {
  try {
    const res = await api.post(`${API_BASE_URL}/${loanId}/chat-messages`, {
      message,
      type
    });
    return transformChatMessages(res.data.data);
  } catch (error) {
    handleAxiosError(error);
  }
};
