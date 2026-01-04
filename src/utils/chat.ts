import { ChatMessage, ChatThread } from "@/components/templates/Chat/types";
export const getLastMessage = (thread: ChatThread): ChatMessage | undefined => {
  if (thread.messages.length > 0) {
    return thread.messages[thread.messages.length - 1];
  }
  return thread.lastMessage;
};

export const getUnreadCount = (thread: ChatThread): number => {
  if (thread.messages.length > 0) {
    return thread.messages.filter((message) => message.from === "them" && !message.read).length;
  }
  return thread.unreadCount;
};

export const formatTimeAgo = (isoTimestamp: string): string => {
  const timestamp = new Date(isoTimestamp).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - timestamp);

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return "Just now";
  }
  if (diff < hour) {
    const minutes = Math.floor(diff / minute);
    return `${minutes}m`;
  }
  if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours}h`;
  }
  const days = Math.floor(diff / day);
  if (days === 1) {
    return "Yesterday";
  }
  return `${days}d`;
};

export const markThreadAsRead = (thread: ChatThread): ChatThread => ({
  ...thread,
  unreadCount: 0,
  lastMessage: thread.lastMessage
    ? { ...thread.lastMessage, read: true }
    : undefined,
  messages: thread.messages.map((message) =>
    message.from === "them" ? { ...message, read: true } : message
  ),
  hasLoadedHistory: thread.hasLoadedHistory,
});

export const buildInitials = (name: string): string => {
  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    const segment = parts[0];
    return segment.slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};
