import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getLoanById,
  approveLoan,
  markLoanAsReturned,
  cancelLoan,
} from "../services/loanService";
import {
  getChatMessages,
  sendChatMessage,
} from "../services/chatMessagesService";
import { Loan, ChatMessage, LoanStatus } from "../types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { ArrowLeft, Send, BookOpen, User, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useUserStore } from "../store/useUserStore";

export function LoanChatPage() {
  const { loanId } = useParams<{ loanId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user: currentUser } = useUserStore();

  useEffect(() => {
    if (!currentUser || !loanId) {
      navigate("/login");
      return;
    }

    const fetchLoanAndMessages = async () => {
      try {
        const loanData = await getLoanById(loanId);
        if (!loanData) {
          navigate("/loans");
          return;
        }

        if (
          loanData.borrower_id !== currentUser._id &&
          loanData.user_copy.owner_id !== currentUser._id
        ) {
          navigate("/loans");
          return;
        }

        setLoan(loanData);

        // Fetch messages once
        let chatMessages = await getChatMessages(loanId);

        // Send initial message if none exist and currentUser is borrower
        if (
          chatMessages.length === 0 &&
          loanData.borrower_id === currentUser._id
        ) {
          await sendChatMessage(
            loanId,
            `Hi! I would like to borrow "${loanData.user_copy.book_title}". When would be a good time to pick it up?`
          );
          chatMessages = await getChatMessages(loanId);
        }

        setMessages(chatMessages);
      } catch (error: any) {
        toast.error(error.message || "Failed to load loan data.");
      }
    };

    fetchLoanAndMessages();
  }, [currentUser, loanId, navigate, refreshKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanId || !newMessage.trim()) return;

    try {
      await sendChatMessage(loanId, newMessage.trim());
      setNewMessage("");
      const chatMessages = await getChatMessages(loanId);
      setMessages(chatMessages);
    } catch (error: any) {
      toast.error(error.message || "Failed to send message.");
    }
  };

  const handleApproveLoan = async () => {
    if (!loanId) return;
    try {
      await approveLoan(loanId);
      toast.success(t("lending.loanApproved"));
      setLoan((prev) =>
        prev ? { ...prev, status: LoanStatus.APPROVED } : prev
      );
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleMarkAsReturned = async () => {
    if (!loanId) return;
    try {
      await markLoanAsReturned(loanId);
      toast.success(t("lending.loanReturned"));
      setLoan((prev) =>
        prev ? { ...prev, status: LoanStatus.RETURNED } : prev
      );
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCancelLoan = async () => {
    if (!loanId) return;
    try {
      await cancelLoan(loanId);
      toast.success(t("lending.loanCancelled"));
      navigate("/loans");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getStatusBadgeVariant = (status: LoanStatus) => {
    switch (status) {
      case LoanStatus.REQUESTED:
        return "secondary";
      case LoanStatus.ACTIVE:
      case LoanStatus.APPROVED:
        return "default";
      case LoanStatus.RETURNED:
        return "outline";
      case LoanStatus.CANCELLED:
      case LoanStatus.OVERDUE:
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (!loan || !currentUser) return null;

  const isLender = loan.user_copy.owner_id === currentUser._id;
  const otherUserName = isLender
    ? loan.borrower_name
    : loan.user_copy.owner_name;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <Button
          variant="ghost"
          onClick={() => navigate("/loans")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Loans
        </Button>

        {/* Loan Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {loan.user_copy.book_title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  {isLender ? "Borrowing" : "Lending"} with {otherUserName}
                </div>
              </div>
              <Badge variant={getStatusBadgeVariant(loan.status)}>
                {t(`lending.${loan.status.toLowerCase()}`)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                {t("lending.requestedOn")}:{" "}
                {new Date(loan.request_date).toLocaleDateString()}
              </p>
              {loan.loan_start_date && (
                <p>
                  {t("lending.loanStartDate")}:{" "}
                  {new Date(loan.loan_start_date).toLocaleDateString()}
                </p>
              )}
              {loan.return_date && (
                <p>
                  {t("lending.returnedOn")}:{" "}
                  {new Date(loan.return_date).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              {isLender && loan.status === LoanStatus.REQUESTED && (
                <Button onClick={handleApproveLoan} className="gap-2">
                  <Check className="h-4 w-4" />
                  {t("lending.approveLoan")}
                </Button>
              )}

              {isLender && loan.status === LoanStatus.ACTIVE && (
                <Button onClick={handleMarkAsReturned} className="gap-2">
                  <Check className="h-4 w-4" />
                  {t("lending.markAsReturned")}
                </Button>
              )}

              {loan.status === LoanStatus.REQUESTED && (
                <Button
                  variant="destructive"
                  onClick={handleCancelLoan}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  {t("lending.cancelLoan")}
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => navigate(`/book/${loan.user_copy.book_id}`)}
              >
                View Book Details
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            {/* Messages List */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.sender_id === currentUser._id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isOwnMessage
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-900"
                        }`}
                      >
                        <div
                          className={`text-xs mb-1 ${
                            isOwnMessage ? "text-blue-100" : "text-gray-600"
                          }`}
                        >
                          {message.sender_name} •{" "}
                          {new Date(message.date_sent).toLocaleTimeString()}
                        </div>
                        <div>{message.message_text}</div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <Separator />

            {/* Message Input */}
            <div className="p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={
                    loan.status === LoanStatus.CANCELLED ||
                    loan.status === LoanStatus.RETURNED
                  }
                />
                <Button
                  type="submit"
                  disabled={
                    !newMessage.trim() ||
                    loan.status === LoanStatus.CANCELLED ||
                    loan.status === LoanStatus.RETURNED
                  }
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
