import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "../store/useUserStore";
import {
  getLoanById,
  approveLoan,
  activeLoan,
  cancelLoan,
  markLoanAsReturned,
} from "../services/loanService";
import {
  getChatMessages,
  sendChatMessage,
} from "../services/chatMessagesService";
import { LoanStatus } from "../types";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Input,
} from "@mui/material";
import { Button as ShadcnButton } from "../components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Send } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

// ---------------- query keys ----------------
const loanKey = (id: string) => ["loan", id];
const messagesKey = (id: string) => ["messages", id];

// ---------------- helpers ----------------
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
    d.toLocaleDateString() + " " + d.toLocaleTimeString(undefined, timeOptions)
  );
};

export function LoanChatPage() {
  const { loanId } = useParams<{ loanId: string }>();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const qc = useQueryClient();
  const { t } = useTranslation();

  const [text, setText] = useState("");
  const messagesRef = useRef<HTMLDivElement>(null);

  if (!loanId || !user) return null;

  // ---------------- data ----------------
  const { data: loan, isLoading } = useQuery({
    queryKey: loanKey(loanId),
    queryFn: () => getLoanById(loanId),
  });

  const { data: messages = [] } = useQuery({
    queryKey: messagesKey(loanId),
    queryFn: () => getChatMessages(loanId),
  });

  // ---------------- mutations ----------------
  const sendMessage = useMutation({
    mutationFn: (msg: string) => sendChatMessage(loanId, msg),
    onSuccess: () => qc.invalidateQueries({ queryKey: messagesKey(loanId) }),
  });

  const approve = async () => {
    await approveLoan(loanId);
    await sendChatMessage(loanId, "📘 ההשאלה אושרה", "system");
    qc.invalidateQueries({ queryKey: loanKey(loanId) });
  };

  const activate = async () => {
    await activeLoan(loanId);
    await sendChatMessage(loanId, "📘 הספר נמסר", "system");
    qc.invalidateQueries({ queryKey: loanKey(loanId) });
  };

  const returned = async () => {
    await markLoanAsReturned(loanId);
    await sendChatMessage(loanId, "📘 הספר הוחזר", "system");
    qc.invalidateQueries({ queryKey: loanKey(loanId) });
  };

  const cancel = async () => {
    await cancelLoan(loanId);
    await sendChatMessage(loanId, "❌ ההשאלה בוטלה", "system");
    qc.invalidateQueries({ queryKey: loanKey(loanId) });
    navigate("/loans");
  };

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight });
  }, [messages]);

  if (isLoading || !loan)
    return <div className="py-20 text-center">Loading…</div>;

  console.log(loan);
  const isLender = loan.user_copy?.owner_id === user._id;
  const otherUserName = isLender
    ? loan.borrower_name
    : loan.user_copy?.owner_name;

  const isOverdue =
    loan.due_date &&
    new Date(loan.due_date) < new Date() &&
    loan.status === LoanStatus.ACTIVE;

  function getStatusColor(status: LoanStatus) {
    switch (status) {
      case LoanStatus.REQUESTED:
        return "warning";
      case LoanStatus.ACTIVE:
      case LoanStatus.APPROVED:
        return "success";
      case LoanStatus.CANCELED:
      case LoanStatus.OVERDUE:
        return "error";
      case LoanStatus.RETURNED:
        return "info";
      default:
        return "default";
    }
  }
  return (
    <div className="container max-w-3xl mx-auto py-8">
      <ShadcnButton
          variant="ghost"
          onClick={() => navigate(-1)}
          aria-label={t("common:back")}
          className="mb-6 gap-2"
        >
          {t("common:dir") === "rtl" ? (
            <ArrowRight className="h-4 w-4" />
          ) : null}
          {t("common:dir") === "ltr" ? <ArrowLeft className="h-4 w-4" /> : null}
          {t("common:back")}
        </ShadcnButton>

      {/* Loan Details */}
      <Card className="mb-4">
        <div className="flex justify-between items-start p-4 border-b">
          <div>
            <div className="font-bold text-lg">
              {loan.user_copy?.book_title || "No title"}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {isLender ? "Lending to" : "Borrowing from"} {otherUserName}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Due:{" "}
              {loan.due_date
                ? new Date(loan.due_date).toLocaleDateString()
                : "-"}
            </div>
          </div>
          <Chip
            label={isOverdue ? "Overdue" : loan.status}
            color={getStatusColor(loan.status)}
          />
        </div>
        <CardContent className="flex gap-2 mt-2">
          {isLender && loan.status === LoanStatus.REQUESTED && (
            <Button onClick={approve}>אישור</Button>
          )}
          {isLender && loan.status === LoanStatus.APPROVED && (
            <Button onClick={activate}>נמסר</Button>
          )}
          {isLender && loan.status === LoanStatus.ACTIVE && (
            <Button onClick={returned}>הוחזר</Button>
          )}
          {loan.status === LoanStatus.REQUESTED && (
            <Button color="error" onClick={cancel}>
              ביטול
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Chat */}
      <Card>
        <CardContent>
          <div ref={messagesRef} className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => {
              const isOwn = m.sender_id === user._id;

              if (m.type === "system") {
                return (
                  <div
                    key={m.id}
                    className="text-center text-xs text-gray-500 italic"
                  >
                    {m.message_text} ({formatDateTime(m.date_sent)})
                  </div>
                );
              }

              return (
                <div
                  key={m.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div className={`relative max-w-[70%]`}>
                    <div
                      className={`rounded-lg p-3 ${
                        isOwn
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      {/* שם שולח + תאריך */}
                      <div
                        className={`text-xs mb-1 ${
                          isOwn ? "text-green-100" : "text-gray-600"
                        }`}
                      >
                        {m.sender_name} • {formatDateTime(m.date_sent)}
                      </div>

                      {/* תוכן ההודעה */}
                      <div>{m.message_text}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Divider />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!text.trim()) return;
              sendMessage.mutate(text.trim());
              setText("");
            }}
            className="flex gap-2 mt-2"
          >
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message…"
            />
            <Button
              type="submit"
              disabled={
                !text.trim() ||
                loan.status === LoanStatus.CANCELED ||
                loan.status === LoanStatus.RETURNED
              }
              className="gap-2"
            >
              {" "}
              <Send className="h-4 w-4" /> Send{" "}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
