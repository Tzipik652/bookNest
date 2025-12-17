// import { useState, useEffect, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useUserStore } from "../store/useUserStore";
// import {
//   getLoanById,
//   approveLoan,
//   activeLoan,
//   cancelLoan,
//   markLoanAsReturned,
//   updateDueDate,
// } from "../services/loanService";
// import {
//   getChatMessages,
// } from "../services/chatMessagesService";
// import { sendChatMessage } from "../services/sendChatMessage";
// import { LoanStatus } from "../types";
// import SystemMessage from "../components/SystemMessage";
// import {
//   Button,
//   Card,
//   CardContent,
//   CardHeader,
//   Chip,
//   Divider,
//   Input,
// } from "@mui/material";
// import { Button as ShadcnButton } from "../components/ui/button";
// import { ArrowLeft, ArrowRight, Edit, X } from "lucide-react";
// import { Send } from "@mui/icons-material";
// import { useTranslation } from "react-i18next";
// import DueDatePicker from "../components/DueDatePicker";
// import { toast } from "sonner";
// import { supabaseFrontendClient } from "../utils/supabaseFrontendClient";
// import { useCallback } from "react";
// // ---------------- query keys ----------------
// const loanKey = (id: string) => ["loan", id];
// const messagesKey = (id: string) => ["messages", id];

// // ---------------- helpers ----------------
// const formatDateTime = (dateString: string) => {
//   const d = new Date(dateString);
//   const now = new Date();
//   const timeOptions: Intl.DateTimeFormatOptions = {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: false,
//   };
//   const isToday = d.toDateString() === now.toDateString();

//   if (isToday) return d.toLocaleTimeString(undefined, timeOptions);

//   return (
//     d.toLocaleDateString() + " " + d.toLocaleTimeString(undefined, timeOptions)
//   );
// };

// export function LoanChatPage() {
//   const { loanId } = useParams<{ loanId: string }>();
//   const navigate = useNavigate();
//   const { user } = useUserStore();
//   const qc = useQueryClient();
//   const { t } = useTranslation(["loanChat", "common"]);
//   const [isEditingDueDate, setIsEditingDueDate] = useState(false);
//   const [text, setText] = useState("");
//   const messagesRef = useRef<HTMLDivElement>(null);

//   // ---------------- data ----------------
//   const { data: loan, isLoading } = useQuery({
//     queryKey: loanKey(loanId ?? ""),
//     queryFn: () => getLoanById(loanId ?? ""),
//   });

//   const { data: messages = [] } = useQuery({
//     queryKey: messagesKey(loanId ?? ""),
//     queryFn: () => getChatMessages(loanId ?? ""),
//   });
//   const handleRealtimeUpdate = useCallback(
//     (payload: any) => {
//       const newMessage = payload.new;
//       console.log("Realtime payload received:", newMessage);

//       // עדכון ה-Cache של ההודעות
//       qc.setQueryData(messagesKey(loanId ?? ""), (oldMessages: any) => {
//         // אם אין הודעות קודמות, נחזיר מערך עם החדשה
//         if (!oldMessages) return [newMessage];

//         // בדיקת כפילויות (למנוע מצב שהודעה מופיעה פעמיים)
//         const isDuplicate = oldMessages.some(
//           (m: any) => m.id === newMessage.id
//         );
//         if (isDuplicate) return oldMessages;

//         // חשוב: החזרת מערך חדש לגמרי כדי ש-React יזהה שינוי ב-Reference
//         // אם ההודעות מוצגות מהחדש לישן (למטה למעלה):
//         return [...oldMessages, newMessage];
//       });

//       // בונוס: לגרום ל-Query של ההלוואה עצמה להתרענן אם זו הודעת מערכת
//       if (newMessage.type === "system") {
//         qc.invalidateQueries({ queryKey: loanKey(loanId ?? "") });
//       }
//     },
//     [loanId, qc]
//   );
//   useEffect(() => {
//     if (!loanId) return;
//   console.log("🟢 useEffect realtime mounted, loanId =", loanId);

//     const channelName = `realtime-loan-${loanId}`;

//     // 1. יצירת ערוץ עם הגדרות מפורשות
//     const chatChannel = supabaseFrontendClient
//       .channel(channelName);
//       console.log("🟡 channel created", chatChannel);
// chatChannel.on(
//   "postgres_changes",
//   { event: "*", schema: "public" },
//   (payload) => {
//     console.log("🔥 RAW postgres event", payload);
//   }
// )


//       // 2. הרשמה לאירוע
//       // chatChannel.on(
//       //   "postgres_changes",
//       //   {
//       //     event: "INSERT",
//       //     schema: "public",
//       //     table: "loan_messages",
//       //     filter: `loan_id=eq.${loanId}`,
//       //   },
//       //   (payload) => {
//       //     console.log("Realtime payload received:", payload.new);

//       //     console.log("!!! Message Received via Realtime !!!", payload);
//       //     handleRealtimeUpdate(payload);
//       //   }
//       // )

//       // 3. הפעלה עם לוגים מפורטים
//       .subscribe(async (status) => {
//         console.log(`Realtime Status: ${status}`);
//   console.log("🔵 subscribe status:", status);

//         if (status === "SUBSCRIBED") {
//           console.log(
//             "✅ Connected! Listening for changes in loan_messages..."
//           );
//         }

//         if (status === "CHANNEL_ERROR") {
//           console.error(
//             "❌ Channel Error. Possible causes: RLS, Publication, or JWT expired."
//           );
//         }
//       });
     


//     return () => {
//       console.log("Unsubscribing from channel...");
//       supabaseFrontendClient.removeChannel(chatChannel);
//     };
//   }, [loanId, handleRealtimeUpdate]);
//   useEffect(() => {
//   if (!loanId) return;

//   console.log("🟢 subscribing realtime", loanId);

//   const channel = supabaseFrontendClient
//     .channel(`loan-chat-${loanId}`)
//     .on(
//       "postgres_changes",
//       {
//         event: "INSERT",
//         schema: "public",
//         table: "loan_messages",
//         filter: `loan_id=eq.${loanId}`,
//       },
//       (payload) => {
//         console.log("🔥 realtime message", payload.new);

//         qc.setQueryData(messagesKey(loanId), (old: any[] = []) => {
//           if (old.some((m) => m.id === payload.new.id)) return old;
//           return [...old, payload.new];
//         });
//       }
//     )
//     .subscribe((status) => {
//       console.log("Realtime status:", status);
//     });

//   return () => {
//     supabaseFrontendClient.removeChannel(channel);
//   };
// }, [loanId, qc]);

//   // ---------------- mutations ----------------
//   // פונקציה לעדכון הנתונים בזמן אמת



//   // const sendMessage = useMutation({
//   //   mutationFn: (msg: string) => sendChatMessage(loanId ?? "", msg),
//   //   onSuccess: () =>
//   //     qc.invalidateQueries({ queryKey: messagesKey(loanId ?? "") }),
//   // });
// const sendMessage = useMutation({
//   mutationFn: (msg: string) => sendChatMessage(loanId!, msg),
// });

//   const approve = async () => {
//     try {
//       await approveLoan(loanId ?? "");
//       await sendChatMessage(
//         loanId ?? "",
//         t("systemMessages.approved"),
//         "system"
//       );
//       qc.invalidateQueries({ queryKey: loanKey(loanId ?? "") });
//     } catch (err) {
//       toast.error("error approve lone");
//     }
//   };
//   const handle_loan_overdue = async (date: string) => {
//     try {
//       await updateDueDate(loanId ?? "", date);
//       await sendChatMessage(
//         loanId ?? "",
//         t("systemMessages.returnDeadline"),
//         "system"
//       );
//       qc.invalidateQueries({ queryKey: loanKey(loanId ?? "") });
//     } catch (err) {
//       toast.error(`error update due date lone`);
//     }
//   };

//   const activate = async () => {
//     try {
//       await activeLoan(loanId ?? "");
//       await sendChatMessage(
//         loanId ?? "",
//         t("systemMessages.handedOver"),
//         "system"
//       );
//       qc.invalidateQueries({ queryKey: loanKey(loanId ?? "") });
//     } catch (err) {
//       toast.error("error activate lone");
//     }
//   };

//   const returned = async () => {
//     try {
//       await markLoanAsReturned(loanId ?? "");
//       await sendChatMessage(
//         loanId ?? "",
//         t("systemMessages.returned"),
//         "system"
//       );
//       qc.invalidateQueries({ queryKey: loanKey(loanId ?? "") });
//     } catch (err) {
//       toast.error("error mark loan as returned");
//     }
//   };

//   const cancel = async () => {
//     try {
//       await cancelLoan(loanId ?? "");
//       await sendChatMessage(
//         loanId ?? "",
//         t("systemMessages.canceled"),
//         "system"
//       );
//       qc.invalidateQueries({ queryKey: loanKey(loanId ?? "") });
//     } catch (err) {
//       toast.error("error cancel");
//     }
//   };

//   useEffect(() => {
//     messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight });
//   }, [messages]);

//   const isLender = loan?.user_copy?.owner_id === user?._id;
//   const otherUserName = isLender
//     ? loan?.borrower_name
//     : loan?.user_copy?.owner_name;

//   useEffect(() => {
//     if (
//       loan?.status === LoanStatus.REQUESTED &&
//       messages.length > 0 &&
//       !messages.some(
//         (m) =>
//           m.type === "system" &&
//           m.message_text == t("systemMessages.loanAwaitingApproval")
//       )
//     ) {
//       sendChatMessage(
//         loanId ?? "",
//         t("systemMessages.loanAwaitingApproval"),
//         "system"
//       ).then(() => {
//         qc.invalidateQueries({ queryKey: messagesKey(loanId ?? "") });
//       });
//     }
//   }, [loan, messages, isLender]);

//   if (!loanId || !user || isLoading || !loan) {
//     return <div className="py-20 text-center">Loading…</div>;
//   }

//   function getStatusColor(status: LoanStatus) {
//     switch (status) {
//       case LoanStatus.REQUESTED:
//         return "warning";
//       case LoanStatus.ACTIVE:
//       case LoanStatus.APPROVED:
//         return "success";
//       case LoanStatus.CANCELED:
//       case LoanStatus.OVERDUE:
//         return "error";
//       case LoanStatus.RETURNED:
//         return "info";
//       default:
//         return "default";
//     }
//   }
//   return (
//     <div className="container max-w-3xl mx-auto py-8">
//       <ShadcnButton
//         variant="ghost"
//         onClick={() => navigate(-1)}
//         aria-label={t("common:back")}
//         className="mb-6 gap-2"
//       >
//         {t("common:dir") === "rtl" ? <ArrowRight className="h-4 w-4" /> : null}
//         {t("common:dir") === "ltr" ? <ArrowLeft className="h-4 w-4" /> : null}
//         {t("common:back")}
//       </ShadcnButton>

//       {/* Loan Details */}
//       <Card className="mb-4">
//         <div className="flex justify-between items-start p-4 border-b">
//           <div>
//             <div className="font-bold text-lg">
//               {loan.user_copy?.book_title || "No title"}
//             </div>
//             <div className="text-sm text-gray-600 mt-1">
//               {isLender ? t("lendingTo") : t("borrowingFrom")} {otherUserName}
//             </div>
//             <div className="text-sm text-gray-500 mt-1">
//               Due:{" "}
//               {loan.due_date
//                 ? new Date(loan.due_date).toLocaleDateString()
//                 : "-"}
//               {(isLender && loan.status === LoanStatus.ACTIVE) ||
//                 (loan.status === LoanStatus.APPROVED && (
//                   <button
//                     onClick={() => setIsEditingDueDate((prev) => !prev)}
//                     className="text-gray-400 hover:text-gray-600 focus:outline-none"
//                     aria-label={t("ediDueDate")}
//                   >
//                     {isEditingDueDate ? (
//                       <X className="w-4 h-4 ml-2" />
//                     ) : (
//                       <Edit className="w-4 h-4 ml-2" />
//                     )}
//                   </button>
//                 ))}
//               {isLender && isEditingDueDate &&  (
//                 <DueDatePicker
//                   onConfirm={(date) => {
//                     setIsEditingDueDate(false);
//                     handle_loan_overdue(date);
//                   }}
//                 />
//               )}
//             </div>
//           </div>
//           <Chip
//             label={t(`status.${loan.status}`)}
//             color={getStatusColor(loan.status)}
//           />
//         </div>
//       </Card>

//       {/* Chat */}
//       <Card>
//         <CardContent>
//           <div ref={messagesRef} className="h-96 overflow-y-auto p-4 space-y-4">
//             {messages.map((m, index) => {
//               if (m.type === "system") {
//                 const isLastSystemMessage =
//                   m.type === "system" &&
//                   index ===
//                     messages.map((msg) => msg.type).lastIndexOf("system");
//                 return (
//                   <SystemMessage
//                     key={m.id}
//                     message={m}
//                     loan={loan}
//                     isLender={isLender}
//                     onApprove={approve}
//                     onActivate={activate}
//                     onReturned={returned}
//                     onCancel={cancel}
//                     onUpdateDueDate={handle_loan_overdue}
//                     showActions={isLastSystemMessage}
//                   />
//                 );
//               }
//               const isOwn = m.sender_id === user._id;

//               return (
//                 <div
//                   key={m.id}
//                   className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
//                 >
//                   <div className={`relative max-w-[70%]`}>
//                     <div
//                       className={`rounded-lg p-3 ${
//                         isOwn
//                           ? "bg-green-500 text-white"
//                           : "bg-gray-200 text-gray-900"
//                       }`}
//                     >
//                       <div
//                         className={`text-xs mb-1 ${
//                           isOwn ? "text-green-100" : "text-gray-600"
//                         }`}
//                       >
//                         {m.sender_name} • {formatDateTime(m.date_sent)}
//                       </div>

//                       <div>{m.message_text}</div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           <Divider />

//           <form
//             onSubmit={(e) => {
//               e.preventDefault();
//               if (!text.trim()) return;
//               sendMessage.mutate(text.trim());
//               setText("");
//             }}
//             className="flex gap-2 mt-2 w-full"
//           >
//             <Input
//               value={text}
//               onChange={(e) => setText(e.target.value)}
//               placeholder="Type a message…"
//               className="flex-1"
//               fullWidth
//               disabled={
//                 loan.status === LoanStatus.CANCELED ||
//                 loan.status === LoanStatus.RETURNED
//               }
//             />
//             <Button
//               type="submit"
//               disabled={
//                 !text.trim() ||
//                 loan.status === LoanStatus.CANCELED ||
//                 loan.status === LoanStatus.RETURNED
//               }
//               className="gap-2"
//               aria-label={t("sendMessage")}
//             >
//               {" "}
//               <Send className="h-4 w-4" />
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
// src/pages/LoanChatPage.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "../store/useUserStore";
import { ChatMessage, LoanStatus } from "../types";
import { sendChatMessage, getChatMessages } from "../services/chatMessagesService";
import { supabaseFrontendClient } from "../utils/supabaseFrontendClient";

import {
  approveLoan,
  activeLoan,
  markLoanAsReturned,
  cancelLoan,
  updateDueDate,
} from "../services/loanService";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useTranslation } from "react-i18next";

export function LoanChatPage() {
  const { loanId } = useParams<{ loanId: string }>();
  const { user } = useUserStore();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const messagesRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation(["loanChat"]);

  const fetchMessages = useQuery({
    queryKey: ["messages", loanId],
    queryFn: () => getChatMessages(loanId ?? ""),
      enabled: !!loanId,
  });

  const sendMessage = useMutation({
    mutationFn: (msg: string) => sendChatMessage(loanId ?? "", msg),
    onSuccess: () => fetchMessages.refetch(),
  });

  const handleRealtimeUpdate = useCallback(
    (payload: any) => {
      const newMessage = payload.new;
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    },
    []
  );

useEffect(() => {
  if (!loanId) return;

  const channel: RealtimeChannel = supabaseFrontendClient
    .channel(`realtime-loan-${loanId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "loan_messages",
        filter: `loan_id=eq.${loanId}`,
      },
      handleRealtimeUpdate
    )
    .subscribe();

  return () => {
    supabaseFrontendClient.removeChannel(channel);
  };
}, [loanId, handleRealtimeUpdate]);
  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight });
  }, [messages]);

  const systemActions = {
    approve: () => approveLoan(loanId ?? "", t),
    activate: () => activeLoan(loanId ?? "", t),
    returned: () => markLoanAsReturned(loanId ?? "",t),
    cancel: () => cancelLoan(loanId ?? "",t),
    updateDueDate: (date: string) => updateDueDate(loanId ?? "", date,t),
  };

  if (!loanId) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div ref={messagesRef} className="h-96 overflow-y-auto p-2 border">
        {messages.map((m) => (
          <div key={m.id} className={m.sender_id === "fixed-token-user" ? "text-right" : "text-left"}>
            <b>{m.sender_name}:</b> {m.message_text}
            {m.type === "system" && (
              <div className="mt-1 space-x-1">
                <button onClick={systemActions.approve}>Approve</button>
                <button onClick={systemActions.activate}>Activate</button>
                <button onClick={systemActions.returned}>Return</button>
                <button onClick={systemActions.cancel}>Cancel</button>
                <button onClick={() => systemActions.updateDueDate("2025-12-31")}>Update Due</button>
              </div>
            )}
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          sendMessage.mutate(text.trim());
          setText("");
        }}
        className="mt-2 flex gap-2"
      >
        <input
          className="flex-1 border p-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
        />
        <button type="submit" className="px-4 bg-blue-500 text-white rounded">
          Send
        </button>
      </form>
    </div>
  );
}

