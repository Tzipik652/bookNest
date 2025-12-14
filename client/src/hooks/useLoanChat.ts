import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getChatMessages,
  sendChatMessage,
} from "../services/chatMessagesService";
import {
  getLoanById,
  approveLoan,
  activeLoan,
  cancelLoan,
  markLoanAsReturned,
} from "../services/loanService";

export const loanKey = (id: string) => ["loan", id];
export const messagesKey = (id: string) => ["messages", id];

export function useLoan(loanId: string) {
  return useQuery({
    queryKey: loanKey(loanId),
    queryFn: () => getLoanById(loanId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useChat(loanId: string) {
  return useQuery({
    queryKey: messagesKey(loanId),
    queryFn: () => getChatMessages(loanId),
    initialData: [],
  });
}

export function useSendMessage(loanId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => sendChatMessage(loanId, text),
    onSuccess: () => qc.invalidateQueries({ queryKey: messagesKey(loanId) }),
  });
}

export function useLoanActions(loanId: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: loanKey(loanId) });
    qc.invalidateQueries({ queryKey: messagesKey(loanId) });
  };

  return {
    approve: useMutation({
      mutationFn: () => approveLoan(loanId),
      onSuccess: invalidate,
    }),
    activate: useMutation({
      mutationFn: () => activeLoan(loanId),
      onSuccess: invalidate,
    }),
    cancel: useMutation({
      mutationFn: () => cancelLoan(loanId),
      onSuccess: invalidate,
    }),
    markReturned: useMutation({
      mutationFn: () => markLoanAsReturned(loanId),
      onSuccess: invalidate,
    }),
  };
}
