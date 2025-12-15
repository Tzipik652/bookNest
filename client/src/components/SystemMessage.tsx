import { Button } from "@mui/material";
import { ChatMessage, Loan, LoanStatus } from "../types";
import DueDatePicker from "./DueDatePicker";

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
        <Button size="small" onClick={onApprove}>
          אישור השאלה
        </Button>
      )}

      {showActions && isLender && loan.status === LoanStatus.APPROVED && (
        <Button size="small" onClick={onActivate}>
          סימון "נמסר"
        </Button>
      )}

      {showActions &&isLender && loan.status === LoanStatus.ACTIVE && (
        <Button size="small" onClick={onReturned}>
          סימון "הוחזר"
        </Button>
      )}

      {showActions &&loan.status === LoanStatus.REQUESTED && (
        <Button size="small" color="error" onClick={onCancel}>
          ביטול
        </Button>
      )}
      {isLender && loan.status === LoanStatus.REQUESTED && (
        <DueDatePicker onConfirm={(date) => onUpdateDueDate(date)} />
      )}
    </div>
  );
}
