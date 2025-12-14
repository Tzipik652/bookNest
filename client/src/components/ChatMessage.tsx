import { ChatMessage as Msg } from "../types";

export function ChatMessage({
  message,
  isOwn,
}: {
  message: Msg;
  isOwn: boolean;
}) {
  if (message.type === "system") {
    return (
      <div className="text-center text-xs text-gray-500">
        {message.message_text}
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`rounded-lg p-3 max-w-[70%] ${isOwn ? "bg-green-600 text-white" : "bg-gray-200"}`}
      >
        <div className="text-xs opacity-70 mb-1">{message.sender_name}</div>
        {message.message_text}
      </div>
    </div>
  );
}
