import { ThreadResponse } from "@/types/type";
import { forwardRef } from "react";

type ChatInboxProps = {
  threads: ThreadResponse[];
  loading: boolean;
  onOpenThread: (id: number) => void;
};

const formatMessageTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Ho_Chi_Minh",
    });
  }
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  const diff = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diff < 7) return `${diff} days ago`;
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
};

const ChatInbox = forwardRef<HTMLDivElement, ChatInboxProps>(
  ({ threads, loading, onOpenThread }, ref) => {
    return (
      <div
        ref={ref}
        className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white p-5 shadow-lg"
      >
        <h2 className="text-sm font-semibold text-gray-800 mb-1">
          Recent conversations
        </h2>
        <p className="text-xs text-gray-500 mb-3">
          Quick replies to your latest messages.
        </p>

        {loading ? (
          <p className="text-center text-sm text-gray-500">
            Loading conversations...
          </p>
        ) : threads.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            No conversations found.
          </p>
        ) : (
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
            {threads.map((thread) => {
              const lastMsg = thread.messages.at(-1);
              return (
                <button
                  key={thread.contactId}
                  className="flex flex-col w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-left hover:bg-white hover:border-blue-200 transition"
                  onClick={() => onOpenThread(thread.contactId)}
                >
                  <div className="flex items-center justify-between text-sm font-medium text-gray-800">
                    <span className="flex items-center gap-2">
                      <span className="h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                        {thread.avatarInitials}
                      </span>
                      {thread.contactName}
                    </span>
                    <span className="text-xs font-normal text-gray-500">
                      {formatMessageTime(
                        lastMsg?.timestamp ?? thread.lastTimestamp
                      )}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                    {lastMsg?.content ?? "No messages yet."}
                  </p>
                  {thread.unreadCount > 0 && (
                    <span className="text-[11px] mt-1 text-blue-600 font-medium">
                      {thread.unreadCount} unread
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

ChatInbox.displayName = "ChatInbox";
export default ChatInbox;
