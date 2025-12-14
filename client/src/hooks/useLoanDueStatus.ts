import { LoanStatus, Loan } from "../types";

export function useLoanDueStatus(loan?: Loan) {
  if (!loan?.due_date) return { isOverdue: false };

  const due = new Date(loan.due_date).getTime();
  const now = Date.now();

  const isOverdue =
    now > due &&
    loan.status !== LoanStatus.RETURNED &&
    loan.status !== LoanStatus.CANCELED;

  return { isOverdue };
}
