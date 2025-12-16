import { Button } from "@mui/material";
import { ChatMessage, Loan, LoanStatus } from "../types";
import DueDatePicker from "./DueDatePicker";
import { useTranslation } from "react-i18next";

interface SystemMessageProps {
  message: ChatMessage;
  loan: Loan;
  isLender: boolean;
  onApprove: () => void;
  onActivate: () => void;
  onReturned: () => void;
  onCancel: () => void;
  onUpdateDueDate: (date: string) => void;
  showActions: boolean;
}
export default function SystemMessage({
  message,
  loan,
  isLender,
  onApprove,
  onActivate,
  onReturned,
  onCancel,
  onUpdateDueDate,
  showActions,
}: SystemMessageProps) {
  const { t } = useTranslation(["loanChat"]);
  const formatDateTime = (dateString: string) => {
    const d = new Date(dateString);
    const now = new Date();
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    const isToday = d.toDateString() === now.toDateString();

    if (isToday) return d.toLocaleTimeString(undefined, timeOptions);

    return (
      d.toLocaleDateString() +
      " " +
      d.toLocaleTimeString(undefined, timeOptions)
    );
  };
  return (
    <div className="text-center text-xs text-gray-500 italic space-y-2">
      <div>
        {message.message_text} ({formatDateTime(message.date_sent)})
      </div>

      {showActions && isLender && loan.status === LoanStatus.REQUESTED && (
        <Button size="small" onClick={onApprove} aria-label={t("approve")}>
          {t("approve")}
        </Button>
      )}

      {showActions && isLender && loan.status === LoanStatus.APPROVED && (
        <Button size="small" onClick={onActivate} aria-label={t("handedOver")}>
          {t("handedOver")}
        </Button>
      )}

      {showActions && isLender && loan.status === LoanStatus.ACTIVE && (
        <Button
          size="small"
          onClick={onReturned}
          aria-label={t("markReturned")}
        >
          {t("markReturned")}
        </Button>
      )}

      {showActions && loan.status === LoanStatus.REQUESTED && (
        <Button size="small" color="error" onClick={onCancel} aria-label={t("cancel")}>
          {t("cancel")}
        </Button>
      )}
      {isLender && loan.status === LoanStatus.REQUESTED && (
        <DueDatePicker onConfirm={(date) => onUpdateDueDate(date)} />
      )}
    </div>
  );
}
