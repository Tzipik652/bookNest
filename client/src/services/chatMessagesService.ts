import { Book, ChatMessage, Loan, LoanStatus } from "../types";
import api from "../lib/axiosInstance";
import axios from "axios";
const API_BASE_URL =
  `${import.meta.env.VITE_SERVER_URL}/loans` || "http://localhost:5000/loans";

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

export const getChatMessages = async (bookId: string): Promise<ChatMessage[]>=> {
  return [{
    id: "1",
    loan_id: "1",
    sender_id: "1",
    sender_name: "a",
    message_text: "aa",
    date_sent: ""
  }, {
    id: "2",
    loan_id: "2",
    sender_id: "2",
    sender_name: "b",
    message_text: "bbb",
    date_sent: ""
  }]
}

export const sendChatMessage = async (loanId: string,message: string) => {
  return "message sent";
}

