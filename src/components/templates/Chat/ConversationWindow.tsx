import { useEffect, useMemo, useRef, useState } from "react";
import { BsSend } from "react-icons/bs";
import { ThreadResponse } from "@/types/type";

type ConversationWindowProps = {
  thread: ThreadResponse;
  positionIndex: number;
  onClose: () => void;
  onSendMessage: (participantId: number, content: string) => void;
};

export default function ConversationWindow({
  thread,
  positionIndex,
  onClose,
  onSendMessage,
}: ConversationWindowProps) {
  const [draft, setDraft] = useState("");
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.messages.length]);
const hasInitialized = useRef(false);

useEffect(() => {
  if (!hasInitialized.current) {
    // ✅ Lần đầu load hoặc mở chat → scroll ngay xuống cuối, không animation
    messageEndRef.current?.scrollIntoView({ behavior: "auto" });
    hasInitialized.current = true;
  } else {
    // ✅ Chỉ cuộn mượt khi có tin nhắn mới (do realtime hoặc mình gửi)
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }
}, [thread.messages.length]);

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSendMessage(thread.contactId, trimmed);
    setDraft("");
  };

  return (
    <div
      className="fixed bottom-5 z-40 w-80 overflow-hidden rounded-lg border border-[#47474750] bg-white shadow-xl"
      style={{ right: `calc(2rem + ${positionIndex} * 20.3rem)` }}
    >
      <header className="flex items-center justify-between rounded-lg bg-gray-400 px-3 py-2 text-white">
        <div>
          <h3 className="text-sm font-semibold leading-snug">
            {thread.contactName}
          </h3>
          <p className="text-xs text-slate-300">Active now</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-slate-200 hover:bg-slate-700 hover:text-white"
        >
          ×
        </button>
      </header>
      <div className="flex h-104 flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-3 py-3 text-sm text-slate-900">
          {thread.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === thread.contactId
                  ? "justify-start"
                  : "justify-end"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                  message.senderId === thread.contactId
                    ? "bg-white text-slate-900 shadow-sm"
                    : "bg-indigo-600 text-white"
                }`}
              >
                <p>{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>
        <div className="border-t border-slate-200 bg-white p-2">
          <div className="flex items-center rounded-full border border-slate-200 pl-3">
            <input
              className="h-9 flex-1 bg-transparent text-sm focus:outline-none"
              placeholder="Aa"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              onClick={handleSend}
              className="rounded-full h-9 w-14 flex items-center justify-center border border-gray-300 bg-[#47474720]"
              disabled={!draft.trim()}
            >
              <BsSend size={18} color={"#47474760"} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
