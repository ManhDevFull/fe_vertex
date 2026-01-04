export type ChatUserRole = "me" | "them";

export type ChatMessage = {
  id: string;
  from: ChatUserRole;
  body: string;
  timestamp: string;
  read: boolean;
};

export type ChatThread = {
  id: string;
  participantId: number;
  name: string;
  avatarInitials: string;
  contactEmail?: string;
  messages: ChatMessage[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  hasLoadedHistory: boolean;
};
