"use client";
import axiosClient from "@/axios/axiosClient";
import { addAuth, authSelector, UserAuth } from "@/redux/reducers/authReducer";
import { useState, useEffect, useRef, useCallback } from "react";
import { IoChatbubblesOutline, IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import * as signalR from "@microsoft/signalr";
import { chatApiBase, chatHubUrl } from "@/utils/env";
import Link from "next/link";

const CHAT_API_BASE = chatApiBase;
const CHAT_HUB_URL = chatHubUrl;
const envAdminId = Number(process.env.NEXT_PUBLIC_CHAT_ADMIN_ID ?? "1");
const DEFAULT_ADMIN_ID = Number.isFinite(envAdminId) ? envAdminId : 1;

type ChatMode = "admin" | "ai";

type ChatMessage = {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  isRead: boolean;
};

type AiProduct = {
  id: number;
  name: string;
  price: number;
  thumbnail: string;
  url: string;
};

type AiMessage = {
  id: number;
  role: "user" | "bot";
  content: string;
  products?: AiProduct[];
};

type ThreadResponse = {
  contactId: number;
  contactName: string;
  avatarInitials: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  messages: ChatMessage[];
};

export function ChatClient() {
  const dispatch = useDispatch();
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const auth: UserAuth = useSelector(authSelector);
  const [userInfo, setUserInfo] = useState<UserAuth>(auth);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>("admin");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [adminContactId, setAdminContactId] = useState<number>(DEFAULT_ADMIN_ID);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatOpenedRef = useRef(false);
  const prevMessageCountRef = useRef(0);

  // hydrate token
  useEffect(() => {
    const res = localStorage.getItem("token");
    if (res) {
      const parsed = JSON.parse(res);
      dispatch(addAuth(parsed));
      setUserInfo(parsed);
    }
  }, [dispatch]);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "auto") => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    },
    []
  );

  // scroll theo mode
  useEffect(() => {
    const currentCount = mode === "admin" ? messages.length : aiMessages.length;
    if (!isChatOpen) {
      chatOpenedRef.current = false;
      prevMessageCountRef.current = currentCount;
      return;
    }
    if (!chatOpenedRef.current) {
      scrollToBottom("auto");
      chatOpenedRef.current = true;
      prevMessageCountRef.current = currentCount;
      return;
    }
    if (currentCount > prevMessageCountRef.current) {
      const behavior = prevMessageCountRef.current === 0 ? "auto" : "smooth";
      scrollToBottom(behavior);
    }
    prevMessageCountRef.current = currentCount;
  }, [isChatOpen, messages.length, aiMessages.length, mode, scrollToBottom]);

  // tải thread admin
  const fetchThread = async () => {
    if (!userInfo?.token) return;
    try {
      setLoading(true);
      const res = await axiosClient.get<ThreadResponse[]>(
        `${CHAT_API_BASE}/messages/grouped`,
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      const data = res.data ?? res;
      if (data.length > 0) {
        const adminThread = data[0];
        setMessages(adminThread.messages ?? []);
        setAdminContactId(adminThread.contactId || DEFAULT_ADMIN_ID);
      } else {
        setMessages([]);
        setAdminContactId(DEFAULT_ADMIN_ID);
      }
    } catch (error) {
      console.error("Fetch chat thread failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // kết nối SignalR
  useEffect(() => {
    if (userInfo?.token) void fetchThread();
    if (!userInfo.token) return;

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(CHAT_HUB_URL, { accessTokenFactory: () => userInfo.token! })
      .withAutomaticReconnect()
      .build();

    conn.on("clientMessage", (msg) => setMessages((prev) => [...prev, msg]));

    conn
      .start()
      .then(() => setConnection(conn))
      .catch((err) => console.error("Connect failed", err));

    return () => {
      conn.stop();
    };
  }, [userInfo?.token]);

  // gửi tin
  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // AI mode
    if (mode === "ai") {
      if (!userInfo?.token) return;
      const userMsg: AiMessage = { id: Date.now(), role: "user", content: trimmed };
      setAiMessages((prev) => [...prev, userMsg]);
      setInput("");
      try {
        setLoadingAi(true);
        const res = await axiosClient.post(
          "/ai/advisor",
          { message: trimmed },
          { headers: { Authorization: `Bearer ${userInfo.token}` } }
        );
        const payload = (res as any)?.data ?? res ?? {};
        const botMsg: AiMessage = {
          id: Date.now() + 1,
          role: "bot",
          content: payload.answer ?? "No answer",
          products: payload.products ?? [],
        };
        setAiMessages((prev) => [...prev, botMsg]);
      } catch (err) {
        setAiMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: "bot", content: "AI unavailable right now." },
        ]);
      } finally {
        setLoadingAi(false);
      }
      return;
    }

    // Admin mode
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) return;
    const newMsg: ChatMessage = {
      id: Date.now(),
      senderId: userInfo.id!,
      receiverId: adminContactId,
      content: trimmed,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, newMsg]);
    try {
      await connection.invoke("SendMessageByClient", trimmed);
      setInput("");
    } catch (err) {
      console.error("SendMessage failed:", err);
    }
  };

  const renderAdminMessages = () => (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-gray-50 max-h-[400px]">
      {loading ? (
        <p className="text-center text-gray-400 text-sm mt-10">Loading messages...</p>
      ) : messages.length === 0 ? (
        <p className="text-center text-gray-400 text-sm mt-10">No messages yet.</p>
      ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderId === userInfo.id ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-3 py-2 rounded-lg text-sm max-w-[75%] ${
                msg.senderId === userInfo.id ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );

  const renderAiMessages = () => (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50 max-h-[400px]">
      {aiMessages.length === 0 ? (
        <p className="text-center text-gray-400 text-sm mt-10">
          Hỏi trợ lý AI về sản phẩm, ví dụ: “Tôi có 5 triệu mua điện thoại bền pin trâu”.
        </p>
      ) : (
        aiMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`px-3 py-2 rounded-lg text-sm max-w-[80%] ${
                msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
              }`}
            >
              <div className="whitespace-pre-line">{msg.content}</div>
              {msg.products && msg.products.length > 0 && (
                <div className="mt-2 space-y-2">
                  {msg.products.map((p) => (
                    <div key={p.id} className="border rounded-lg bg-white p-2 shadow-sm">
                      <div className="flex gap-2">
                        {p.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.thumbnail} alt={p.name} className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded" />
                        )}
                        <div className="flex-1">
                          <Link href={p.url} className="font-semibold text-sm text-blue-600 hover:underline">
                            {p.name}
                          </Link>
                          <div className="text-xs text-gray-600">{p.price.toLocaleString("vi-VN")} đ</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      )}
      {loadingAi && <p className="text-center text-gray-400 text-sm">Đang gửi yêu cầu tới AI...</p>}
      <div ref={messagesEndRef} />
    </div>
  );

  return (
    <>
      {!isChatOpen ? (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-8 right-8 z-[9999] flex items-center justify-center rounded-full bg-blue-500 p-3 text-white shadow-lg hover:bg-blue-600 transition-all"
          aria-label="Open chat"
        >
          <IoChatbubblesOutline size={26} />
        </button>
      ) : (
        <div className="fixed bottom-8 right-8 z-[10000] w-80 bg-white shadow-2xl rounded-lg border border-gray-200 flex flex-col overflow-hidden">
          {/* Header + mode switch */}
          <div className="flex items-center justify-between bg-[#3f4a5b] text-white px-4 py-3">
            <div className="flex gap-2 text-sm">
              <button
                onClick={() => setMode("admin")}
                className={`px-2 py-1 rounded ${mode === "admin" ? "bg-white text-[#3f4a5b]" : "bg-transparent text-white"}`}
              >
                Chat Admin
              </button>
              <button
                onClick={() => setMode("ai")}
                className={`px-2 py-1 rounded ${mode === "ai" ? "bg-white text-[#3f4a5b]" : "bg-transparent text-white"}`}
              >
                Trợ lý AI
              </button>
            </div>
            <button onClick={() => setIsChatOpen(false)}>
              <IoClose size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex h-90 flex-col">
            {mode === "admin" ? renderAdminMessages() : renderAiMessages()}
          </div>

          {/* Input */}
          <div className="flex gap-2 items-center justify-between border-t border-gray-200 py-2 px-2 bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === "ai" ? "Hỏi trợ lý AI..." : "Type a message..."}
              className="flex-1 px-3 rounded-full border border-gray-300 h-9 text-sm focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="h-9 px-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-all disabled:bg-gray-400"
              disabled={mode === "admin" ? !connection : loadingAi}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
