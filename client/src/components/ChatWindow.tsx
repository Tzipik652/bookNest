import { useEffect, useRef } from "react";
import { ChatMessage as Msg } from "../types";
import { ChatMessage } from "./ChatMessage";

export function ChatWindow({
  messages,
  currentUserId,
}: {
  messages: Msg[];
  currentUserId: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [messages]);

  return (
    <div ref={ref} className="h-96 overflow-y-auto p-4 space-y-3">
      {messages.map((m) => (
        <ChatMessage
          key={m.id}
          message={m}
          isOwn={m.sender_id === currentUserId}
        />
      ))}
    </div>
  );
}
