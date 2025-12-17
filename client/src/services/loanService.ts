import { Loan, LoanStatus } from "../types";
import api from "../lib/axiosInstance";
import axios from "axios";
import { useUserStore } from "../store/useUserStore";
import { sendChatMessage } from "./chatMessagesService";
import { useTranslation } from "react-i18next";
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
function transformLoan(raw: any): Loan {
  return {
    id: raw.id,
    status: raw.status as LoanStatus,
    request_date: raw.request_date,
    loan_start_date: raw.loan_start_date,
    due_date: raw.due_date,
    return_date: raw.return_date,

    borrower_id: raw.borrower_id._id,
    borrower_name: raw.borrower_id.name,
    borrower_email: raw.borrower_id.email,

    user_copy: {
      id: raw.user_copy_id.id,
      book_id: raw.user_copy_id.book_id._id,
      book_title: raw.user_copy_id.book_id.title,
      owner_id: raw.user_copy_id.owner_id._id,
      owner_name: raw.user_copy_id.owner_id.name,
      owner_email: raw.user_copy_id.owner_id.email,
      is_available_for_loan: raw.user_copy_id.is_available_for_loan,
      loan_location_lat: raw.user_copy_id.loan_location_lat,
      loan_location_lon: raw.user_copy_id.loan_location_lon,
      date_added: raw.user_copy_id.date_added,
    },
  };
}
export const getUserLoansAsBorrower = async (): Promise<Loan[]> => {
  try {
    const { user: currentUser } = useUserStore.getState();
    if (!currentUser) {
      throw new Error("User not found");
    }
    const res = await api.get(`${API_BASE_URL}/${currentUser._id}/borrower`);
    const loans = res.data?.data ?? [];

    return loans
      .filter(Boolean)
      .filter((l: any) => l.user_copy_id)
      .map(transformLoan);
  } catch (error) {
    handleAxiosError(error);
  }
};

export const getUserLoansAsLender = async (): Promise<Loan[]> => {
  try {
    const { user: currentUser } = useUserStore.getState();
    if (!currentUser) {
      throw new Error("User not found");
    }
    const res = await api.get(`${API_BASE_URL}/${currentUser._id}/owner`);

    const loans = res.data?.data ?? [];

    return loans
      .filter(Boolean)
      .filter((l: any) => l.user_copy_id)
      .map(transformLoan);
  } catch (error) {
    handleAxiosError(error);
  }
};
export const getLoanById = async (loanId: string): Promise<Loan> => {
  try {
    const res = await api.get(`${API_BASE_URL}/${loanId}`);
    return transformLoan(res.data.data);
  } catch (error) {
    handleAxiosError(error);
  }
};
export const approveLoan = async (
  loanId: string,
  t: (key: string) => string
): Promise<Loan> => {
  try {
    if (!loanId) {
      throw new Error("Loan are required");
    }
    const res = await api.put(`${API_BASE_URL}/${loanId}/status`, {
      status: LoanStatus.APPROVED,
    });
    await sendChatMessage(loanId, t("systemMessages.approved"), "system");
    return transformLoan(res.data.data);
  } catch (error) {
    handleAxiosError(error);
  }
};
export const updateDueDate = async (
  loanId: string,
  date: string,
  t: (key: string) => string
): Promise<Loan> => {
  try {
    if (!loanId) {
      throw new Error("Loan are required");
    }
    if (!date) {
      throw new Error("Date are required");
    }

    const res = await api.put(`${API_BASE_URL}/${loanId}/due-date`, {
      due_date: date,
    });
    await sendChatMessage(
      loanId ?? "",
      t("systemMessages.returnDeadline"),
      "system"
    );
    return transformLoan(res.data.data);
  } catch (error) {
    handleAxiosError(error);
  }
};
export const activeLoan = async (
  loanId: string,
  t: (key: string) => string
): Promise<Loan> => {
  try {
    if (!loanId) {
      throw new Error("Loan are required");
    }
    const res = await api.put(`${API_BASE_URL}/${loanId}/status`, {
      status: LoanStatus.ACTIVE,
    });
    await sendChatMessage(
      loanId ?? "",
      t("systemMessages.handedOver"),
      "system"
    );
    return transformLoan(res.data.data);
  } catch (error) {
    handleAxiosError(error);
  }
};
export const cancelLoan = async (loanId: string,t: (key: string) => string): Promise<Loan> => {
  try {
    if (!loanId) {
      throw new Error("Loan not found");
    }
    const res = await api.put(`${API_BASE_URL}/${loanId}/status`, {
      status: LoanStatus.CANCELED,
    });
    await sendChatMessage(loanId ?? "", t("systemMessages.canceled"), "system");
    return transformLoan(res.data.data);
  } catch (error) {
    handleAxiosError(error);
  }
};

export const markLoanAsReturned = async (
  loanId: string,
  t: (key: string) => string
): Promise<Loan> => {
  try {
    const res = await api.put(`${API_BASE_URL}/${loanId}/return-date`, {
      return_date: new Date().toISOString(),
    });
    await sendChatMessage(loanId ?? "", t("systemMessages.returned"), "system");
    return transformLoan(res.data.data);
  } catch (error) {
    handleAxiosError(error);
  }
};

export const getActiveLoanForCopy = async (userCopyId: string) => {
  try {
    const res = await api.get(
      `${API_BASE_URL}/${userCopyId}/active-loan-for-copy`
    );
    if (!res.data.data) {
      return;
    }
    return res.data.data.map(transformLoan)[0];
  } catch (error) {
    handleAxiosError(error);
  }
};

export const createLoanRequest = async (userCopyId: string) => {
  try {
    const res = await api.post(`${API_BASE_URL}/request`, {
      user_copy_id: userCopyId,
    });
    return transformLoan(res.data.data);
  } catch (error) {
    handleAxiosError(error);
  }
};
