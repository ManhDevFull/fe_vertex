"use client";
import axiosClient from "@/axios/axiosClient";
import handleAPI from "@/axios/handleAPI";
import {
  addAuth,
  authSelector,
  removeAuth,
  UserAuth,
} from "@/redux/reducers/authReducer";
import { ChatMessage, ThreadResponse } from "@/types/type";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BiMessageRoundedDots } from "react-icons/bi";
import { DiGnu } from "react-icons/di";
import { IoMdNotificationsOutline } from "react-icons/io";
import { TbLogout } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import * as signalR from "@microsoft/signalr";
import { buildInitials } from "@/utils/chat";
import { chatApiBase, chatHubUrl } from "@/utils/env";
import ConversationWindow from "../../Chat/ConversationWindow";
import ChatInbox from "../../Chat/ChatInbox";

const CHAT_API_BASE = chatApiBase;
const CHAT_HUB_URL = chatHubUrl;

const isValidHttpUrl = (value?: string | null) =>
  typeof value === "string" && /^https?:\/\//i.test(value.trim());

const CHAT_API_AVAILABLE = isValidHttpUrl(CHAT_API_BASE);
const CHAT_HUB_AVAILABLE = isValidHttpUrl(CHAT_HUB_URL);

type RealtimeMessagePayload = {
  id?: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp?: string;
  isRead?: boolean;
};

const normalizeRealtimeMessage = (
  msg: RealtimeMessagePayload
): ChatMessage => ({
  id: typeof msg.id === "number" ? msg.id : Date.now(),
  senderId: msg.senderId,
  receiverId: msg.receiverId,
  content: msg.content,
  timestamp: msg.timestamp ?? new Date().toISOString(),
  isRead: msg.isRead ?? false,
});

const sortThreadsByTimestamp = (threads: ThreadResponse[]) =>
  [...threads].sort(
    (a, b) => Date.parse(b.lastTimestamp) - Date.parse(a.lastTimestamp)
  );

const normalizeThread = (thread: ThreadResponse): ThreadResponse => ({
  ...thread,
  messages: [...thread.messages].sort(
    (a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp)
  ),
});

const markThreadAsReadLocal = (thread: ThreadResponse): ThreadResponse => ({
  ...thread,
  unreadCount: 0,
  messages: thread.messages.map((message) =>
    message.senderId === thread.contactId
      ? { ...message, isRead: true }
      : message
  ),
});

const createThreadFromMessage = (
  contactId: number,
  message: ChatMessage
): ThreadResponse => {
  const display = `User #${contactId}`;
  return {
    contactId,
    contactName: display,
    avatarInitials: buildInitials(display),
    lastMessage: message.content,
    lastTimestamp: message.timestamp,
    unreadCount: message.senderId === contactId ? 1 : 0,
    messages: [message],
  };
};

export default function HeaderAdminComponent() {
  const dispatch = useDispatch();
  const route = useRouter();
  const auth: UserAuth = useSelector(authSelector);

  const [userInfo, setUserInfo] = useState<UserAuth>(auth);
  const [chatOpen, setChatOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [chatThreads, setChatThreads] = useState<ThreadResponse[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [openChats, setOpenChats] = useState<ThreadResponse[]>([]);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null
  );
  const [chatFeatureEnabled, setChatFeatureEnabled] = useState(
    CHAT_API_AVAILABLE && CHAT_HUB_AVAILABLE
  );

  const chatButtonRef = useRef<HTMLButtonElement | null>(null);
  const notifButtonRef = useRef<HTMLButtonElement | null>(null);
  const chatPanelRef = useRef<HTMLDivElement | null>(null);
  const openChatsRef = useRef<ThreadResponse[]>([]);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const applyMessageUpdateRef = useRef<
    ((msg: RealtimeMessagePayload | ChatMessage) => void) | null
  >(null);

  useEffect(() => {
    openChatsRef.current = openChats;
  }, [openChats]);

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored) {
      const parsed = JSON.parse(stored);
      dispatch(addAuth(parsed));
      setUserInfo(parsed);
    }
  }, [dispatch]);

  useEffect(() => {
    setUserInfo(auth);
  }, [auth]);

  useEffect(() => {
    if (!userInfo.token || !chatFeatureEnabled) {
      setChatThreads([]);
      setOpenChats([]);
    }
  }, [userInfo.token, chatFeatureEnabled]);

  const fetchThreads = useCallback(async () => {
    if (!chatFeatureEnabled || !CHAT_API_AVAILABLE) return;
    if (!userInfo.token) return;
    try {
      setLoadingThreads(true);
      const res = await axiosClient.get<ThreadResponse[]>(
        `${CHAT_API_BASE}/messages/grouped`,
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      const data = Array.isArray(res)
        ? res
        : Array.isArray((res as any)?.data)
          ? (res as any).data
          : [];

      const normalized = data.map(normalizeThread);
      const sorted = sortThreadsByTimestamp(normalized);
      setChatThreads(sorted);

      setOpenChats((prev) =>
        prev
          .map((chat) => {
            const latest = sorted.find(
              (thread) => thread.contactId === chat.contactId
            );
            if (!latest) return null;
            return markThreadAsReadLocal(latest);
          })
          .filter((thread): thread is ThreadResponse => Boolean(thread))
      );
    } catch (error: unknown) {
      console.error("Fetch chat threads error:", error);
    } finally {
      setLoadingThreads(false);
    }
  }, [userInfo.token, chatFeatureEnabled]);

  useEffect(() => {
    if (userInfo.token && chatFeatureEnabled) void fetchThreads();
  }, [userInfo.token, fetchThreads, chatFeatureEnabled]);

  useEffect(() => {
    if (chatThreads.length === 0) return;
    setOpenChats((prev) => {
      let hasChanges = false;
      const next = prev.map((chat) => {
        const latest = chatThreads.find(
          (thread) => thread.contactId === chat.contactId
        );
        if (!latest) return chat;

        const normalized = markThreadAsReadLocal(latest);
        const sameSize =
          normalized.messages.length === chat.messages.length &&
          normalized.lastTimestamp === chat.lastTimestamp &&
          normalized.unreadCount === chat.unreadCount;

        if (sameSize) return chat;
        hasChanges = true;
        return normalized;
      });

      return hasChanges ? next : prev;
    });
  }, [chatThreads]);

  const markThreadRead = useCallback(
    async (contactId: number) => {
      if (!chatFeatureEnabled) return;
      const conn = connectionRef.current;
      if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;

      try {
        await conn.invoke("MarkThreadRead", contactId);
      } catch (error) {
        console.error("[Chat] MarkThreadRead failed:", error);
      }
    },
    [chatFeatureEnabled]
  );

  const applyMessageUpdate = useCallback(
    (incoming: RealtimeMessagePayload | ChatMessage) => {
      if (!userInfo.id) return;

      const normalized =
        "timestamp" in incoming && typeof incoming.timestamp === "string"
          ? (incoming as ChatMessage)
          : normalizeRealtimeMessage(incoming as RealtimeMessagePayload);

      const isFromMe = normalized.senderId === userInfo.id;
      const contactId = isFromMe
        ? normalized.receiverId
        : normalized.senderId;
      const isOpen = openChatsRef.current.some(
        (chat) => chat.contactId === contactId
      );
      if (!isFromMe && isOpen) {
        void markThreadRead(contactId);
      }
      const processedMessage =
        !isFromMe && isOpen ? { ...normalized, isRead: true } : normalized;
      let placeholderCreated = false;
      let updatedThread: ThreadResponse | null = null;

      setChatThreads((prev) => {
        const index = prev.findIndex(
          (thread) => thread.contactId === contactId
        );

        if (index === -1) {
          const placeholder = createThreadFromMessage(
            contactId,
            processedMessage
          );
          updatedThread = placeholder;
          placeholderCreated = true;
          return sortThreadsByTimestamp([...prev, placeholder]);
        }

        const updatedList = prev.map((thread) => {
          if (thread.contactId !== contactId) return thread;
          const unreadCount =
            !isFromMe && !isOpen ? thread.unreadCount + 1 : thread.unreadCount;
          const patched: ThreadResponse = {
            ...thread,
            messages: [...thread.messages, processedMessage],
            lastMessage: processedMessage.content,
            lastTimestamp: processedMessage.timestamp,
            unreadCount,
          };
          const nextThread =
            !isFromMe && isOpen ? markThreadAsReadLocal(patched) : patched;
          updatedThread = nextThread;
          return nextThread;
        });

        return sortThreadsByTimestamp(updatedList);
      });

      if (updatedThread) {
        setOpenChats((prev) =>
          prev.map((chat) =>
            chat.contactId === contactId ? updatedThread! : chat
          )
        );
      }

      if (placeholderCreated) {
        void fetchThreads();
      }
    },
    [fetchThreads, markThreadRead, userInfo.id]
  );

  useEffect(() => {
    applyMessageUpdateRef.current = applyMessageUpdate;
  }, [applyMessageUpdate]);

  useEffect(() => {
    if (!chatFeatureEnabled || !CHAT_HUB_AVAILABLE) {
      setConnection(null);
      return;
    }

    if (!userInfo.token || !userInfo.id) return;

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(CHAT_HUB_URL!, {
        accessTokenFactory: () => userInfo.token!,
      })
      .withAutomaticReconnect()
      .build();
    connectionRef.current = conn;

    const handleIncomingMessage = (msg: RealtimeMessagePayload) => {
      console.log("[Chat] adminMessage received:", msg);
      applyMessageUpdateRef.current?.(msg);
    };

    conn.on("adminMessage", handleIncomingMessage);
    conn.on(
      "messagesRead",
      (payload: { contactId: number; updated?: number }) => {
        if (!payload || typeof payload.contactId !== "number") return;
        setChatThreads((prev) =>
          prev.map((thread) =>
            thread.contactId === payload.contactId
              ? {
                  ...thread,
                  messages: thread.messages.map((m) =>
                    m.senderId === userInfo.id ? { ...m, isRead: true } : m
                  ),
                }
              : thread
          )
        );
        setOpenChats((prev) =>
          prev.map((thread) =>
            thread.contactId === payload.contactId
              ? {
                  ...thread,
                  messages: thread.messages.map((m) =>
                    m.senderId === userInfo.id ? { ...m, isRead: true } : m
                  ),
                }
              : thread
          )
        );
      }
    );

    let reconnectHandle: ReturnType<typeof setTimeout> | null = null;
    const startConnection = async (attempt = 0) => {
      if (attempt > 2) {
        console.warn(
          "[Chat] Disabling realtime chat after repeated failures."
        );
        setChatFeatureEnabled(false);
        return;
      }
      try {
        connectionRef.current = conn;
        await conn.start();
        setConnection(conn);
        openChatsRef.current.forEach((chat) => {
          void markThreadRead(chat.contactId);
        });
      } catch (err: unknown) {
        console.error("??O SignalR connection failed:", err);
        reconnectHandle = setTimeout(() => startConnection(attempt + 1), 3000);
      }
    };

    startConnection();

    return () => {
      conn.off("adminMessage", handleIncomingMessage);
      conn.off("messagesRead");
      if (reconnectHandle) clearTimeout(reconnectHandle);
      void conn.stop();
      connectionRef.current = null;
      setConnection(null);
    };
  }, [chatFeatureEnabled, markThreadRead, userInfo.id, userInfo.token]);

  const totalUnread = chatThreads.reduce(
    (acc, thread) => acc + thread.unreadCount,
    0
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        chatOpen &&
        chatPanelRef.current &&
        !chatPanelRef.current.contains(target) &&
        !chatButtonRef.current?.contains(target)
      ) {
        setChatOpen(false);
      }
      if (
        notificationOpen &&
        notifButtonRef.current &&
        !notifButtonRef.current.contains(target) &&
        !notifButtonRef.current?.contains(target)
      ) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [chatOpen, notificationOpen]);

  const openConversation = (thread: ThreadResponse) => {
    const latest =
      chatThreads.find((item) => item.contactId === thread.contactId) ??
      thread;
    const normalized = markThreadAsReadLocal(latest);

    setChatThreads((prev) => {
      const updated = prev.map((item) =>
        item.contactId === thread.contactId ? normalized : item
      );
      return sortThreadsByTimestamp(updated);
    });

    setOpenChats((prev) => {
      const exists = prev.some((c) => c.contactId === thread.contactId);
      if (exists) {
        return prev.map((chat) =>
          chat.contactId === thread.contactId ? normalized : chat
        );
      }
      return [...prev, normalized];
    });

    void markThreadRead(thread.contactId);
    setChatOpen(false);
  };

  const closeConversation = (contactId: number) => {
    setOpenChats((prev) => prev.filter((c) => c.contactId !== contactId));
  };

  const handleSendMessage = async (receiverId: number, content: string) => {
    if (!chatFeatureEnabled) {
      console.warn("⚠️ Chat feature is unavailable.");
      return;
    }
    if (!connection) {
      console.warn("⚠️ No SignalR connection");
      return;
    }

    if (connection.state !== signalR.HubConnectionState.Connected) {
      console.warn("⚠️ Connection not ready:", connection.state);
      return;
    }

    const trimmed = content.trim();
    if (!trimmed || !userInfo.id) return;

    try {
      await connection.invoke("SendMessageByAdmin", receiverId, trimmed);

      const optimisticMessage: ChatMessage = {
        id: Date.now(),
        senderId: userInfo.id,
        receiverId,
        content: trimmed,
        timestamp: new Date().toISOString(),
        isRead: true,
      };

      applyMessageUpdate(optimisticMessage);
    } catch (error: unknown) {
      console.error("❌ SendMessage failed:", error);
    }
  };

  const logout = async () => {
    const res: any = await handleAPI("Auth/logout", {}, "post");
    if (res.status === 200) {
      dispatch(removeAuth());
      route.push("/");
    }
  };

  return (
    <>
      <header className="w-full shadow h-[70px] flex px-15 items-center justify-between">
        <div className="h-full flex items-center">
          <DiGnu
            size={80}
            className="drop-shadow-[0.5px_0.5px_2px_rgba(0,0,0,1)]"
          />
          <h1 className="lakki-reddy-regular h-5 text-4xl text-center drop-shadow-[1px_0.5px_2px_rgba(0,0,0,33)]">
            Vertex ADMIN
          </h1>
        </div>

        <div className="flex items-center pr-20">
          <div className="relative">
            <button
              ref={chatButtonRef}
              className="shadow w-10 h-10 flex items-center justify-center rounded-lg bg-[#F7F7F7]"
              onClick={() => {
                setChatOpen((prev) => !prev);
                setNotificationOpen(false);
              }}
            >
              <BiMessageRoundedDots size={25} />
              {totalUnread > 0 && (
                <p className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 shadow rounded-full bg-[#FF7F7F] px-1.5 h-[18px] flex items-center justify-center text-white text-[12px]">
                  {totalUnread > 99 ? "99+" : totalUnread}
                </p>
              )}
            </button>

            {chatOpen && (
              <ChatInbox
                ref={chatPanelRef}
                threads={chatThreads}
                loading={loadingThreads}
                onOpenThread={(id) => {
                  const thread = chatThreads.find((t) => t.contactId === id);
                  if (thread) openConversation(thread);
                }}
              />
            )}
          </div>

          <div className="relative ml-4">
            <button
              ref={notifButtonRef}
              className="shadow w-10 h-10 flex items-center justify-center rounded-lg bg-[#F7F7F7]"
            >
              <IoMdNotificationsOutline size={25} />
            </button>
          </div>

          <div className="flex items-center ml-8">
            <button className="shadow px-8 rounded-lg h-10 bg-[#FBF0F0] text-[#474747] ">
              Hello, {userInfo.name}
            </button>
            <button
              onClick={logout}
              className="shadow text-[#474747] ml-4 px-5 rounded-lg h-10 bg-[#F7F7F7] flex items-center"
            >
              <TbLogout size={25} />
              <p className="pl-2">Log out</p>
            </button>
          </div>
        </div>
      </header>

      {openChats.map((chat, index) => (
        <ConversationWindow
          key={chat.contactId}
          thread={chat}
          positionIndex={index}
          onClose={() => closeConversation(chat.contactId)}
          onSendMessage={handleSendMessage}
        />
      ))}
    </>
  );
}