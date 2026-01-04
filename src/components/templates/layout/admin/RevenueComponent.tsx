"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import * as signalR from "@microsoft/signalr";
import { authSelector, UserAuth } from "@/redux/reducers/authReducer";
import { notifyHubUrl } from "@/utils/env";
import handleAPI from "@/axios/handleAPI";

interface Props {
  className?: string;
}

type IncomingNotification = {
  id?: number;
  orderId?: number;
  title?: string;
  content?: string;
  createdAt?: string;
  statusOrder?: string;
  statusPay?: string;
  paymentMethod?: string;
  items?: number;
  orderToken?: string;
  Id?: number;
  OrderId?: number;
  Title?: string;
  Content?: string;
  CreatedAt?: string;
  StatusOrder?: string;
  StatusPay?: string;
  PaymentMethod?: string;
  Items?: number;
  OrderToken?: string;
};

type NotificationItem = {
  id: number;
  orderId: number;
  title: string;
  content: string;
  createdAt: string;
  statusOrder: string;
  statusPay: string;
  paymentMethod: string;
  items: number;
  orderToken?: string;
};

const isValidHttpUrl = (value: string | undefined) => {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const toNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
};

const normalizeNotification = (payload: IncomingNotification): NotificationItem => {
  const orderId = toNumber(payload.orderId ?? payload.OrderId);
  const createdAt =
    payload.createdAt ?? payload.CreatedAt ?? new Date().toISOString();
  const title = payload.title ?? payload.Title;
  const content = payload.content ?? payload.Content;
  const statusOrder = payload.statusOrder ?? payload.StatusOrder ?? "";
  const statusPay = payload.statusPay ?? payload.StatusPay ?? "";
  const paymentMethod = payload.paymentMethod ?? payload.PaymentMethod ?? "";
  const items = toNumber(payload.items ?? payload.Items);
  const orderToken = payload.orderToken ?? payload.OrderToken;
  const id = toNumber(payload.id ?? payload.Id);
  return {
    id: id > 0 ? id : Date.now(),
    orderId,
    title: title ?? `Order #${orderId} created`,
    content:
      content ??
      `Items: ${items} | Payment: ${paymentMethod || "Unknown"} (${statusPay})`,
    createdAt,
    statusOrder,
    statusPay,
    paymentMethod,
    items,
    orderToken,
  };
};

const parseTimestamp = (value: string) => {
  const time = Date.parse(value);
  return Number.isNaN(time) ? 0 : time;
};

const sortNotifications = (items: NotificationItem[]) =>
  [...items].sort((a, b) => {
    const delta = parseTimestamp(a.createdAt) - parseTimestamp(b.createdAt);
    if (delta !== 0) return delta;
    return a.id - b.id;
  });

const mergeNotifications = (
  existing: NotificationItem[],
  incoming: NotificationItem[]
) => {
  if (incoming.length === 0) return existing;
  const map = new Map<number, NotificationItem>();
  existing.forEach((item) => map.set(item.id, item));
  incoming.forEach((item) => {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });
  return sortNotifications(Array.from(map.values()));
};

export default function RevenueComponent({ className }: Props) {
  const auth: UserAuth = useSelector(authSelector);
  const [connectionState, setConnectionState] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const hubUrl = useMemo(
    () => (isValidHttpUrl(notifyHubUrl) ? notifyHubUrl : undefined),
    []
  );

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    []
  );

  const fetchNotifications = useCallback(
    async (skip: number, take: number, prepend: boolean) => {
      const list = listRef.current;
      const prevHeight = prepend && list ? list.scrollHeight : 0;
      const prevScrollTop = prepend && list ? list.scrollTop : 0;

      try {
        const res: any = await handleAPI(
          `notify/notifications/list?skip=${skip}&take=${take}`,
          undefined,
          "get"
        );
        const items = Array.isArray(res?.items)
          ? res.items
          : Array.isArray(res?.data?.items)
            ? res.data.items
            : [];
        const normalized = items.map(normalizeNotification);
        setNotifications((prev) => mergeNotifications(prev, normalized));
        setHasMore(items.length === take);
        setFetchError(null);

        if (prepend && list) {
          requestAnimationFrame(() => {
            const nextHeight = list.scrollHeight;
            list.scrollTop = prevScrollTop + (nextHeight - prevHeight);
          });
        } else if (skip === 0 && list) {
          requestAnimationFrame(() => {
            list.scrollTop = list.scrollHeight;
          });
        }
      } catch (err) {
        console.error("[Notify] Failed to load notifications:", err);
        setFetchError("Failed to load notifications.");
      }
    },
    []
  );

  const loadInitial = useCallback(async () => {
    setLoadingInitial(true);
    setHasMore(true);
    setFetchError(null);
    setNotifications([]);
    await fetchNotifications(0, 20, false);
    setLoadingInitial(false);
  }, [fetchNotifications]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loadingInitial || !hasMore) return;
    setLoadingMore(true);
    await fetchNotifications(notifications.length, 10, true);
    setLoadingMore(false);
  }, [fetchNotifications, hasMore, loadingInitial, loadingMore, notifications.length]);

  const handleScroll = useCallback(() => {
    const list = listRef.current;
    if (!list || loadingMore || loadingInitial || !hasMore) return;
    if (list.scrollTop <= 40) {
      void loadMore();
    }
  }, [hasMore, loadMore, loadingInitial, loadingMore]);

  useEffect(() => {
    if (!auth?.token) return;
    void loadInitial();
  }, [auth?.token, loadInitial]);

  useEffect(() => {
    if (!hubUrl) {
      setConnectionState("disconnected");
      return;
    }
    if (!auth?.token) return;

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => auth.token!,
      })
      .withAutomaticReconnect()
      .build();

    const handleOrderCreated = (payload: IncomingNotification) => {
      const normalized = normalizeNotification(payload);
      if (!normalized.orderId) return;
      setNotifications((prev) => mergeNotifications(prev, [normalized]));
    };

    conn.on("orderCreated", handleOrderCreated);
    conn.onreconnecting(() => setConnectionState("connecting"));
    conn.onreconnected(() => {
      console.log("[Notify] connected");
      setConnectionState("connected");
    });
    conn.onclose(() => setConnectionState("disconnected"));

    const start = async () => {
      setConnectionState("connecting");
      try {
        await conn.start();
        console.log("[Notify] connected");
        setConnectionState("connected");
      } catch (err) {
        console.error("[Notify] Failed to connect SignalR:", err);
        setConnectionState("disconnected");
      }
    };

    void start();

    return () => {
      conn.off("orderCreated", handleOrderCreated);
      void conn.stop();
      setConnectionState("disconnected");
    };
  }, [auth?.token, hubUrl]);

  const statusColor =
    connectionState === "connected"
      ? "text-green-600"
      : connectionState === "connecting"
        ? "text-amber-600"
        : "text-red-600";

  return (
    <div className={`${className} p-4 pr-10 self-start`}>
      <div className="bg-[#F7F7F7] w-full shadow-[0px_2px_4px_rgba(0,0,0,0.25)] px-2 py-4 rounded-lg flex flex-col overflow-hidden">
        <div className="pb-2 border-b border-[#adadad] flex items-center justify-between flex-shrink-0">
          <h2 className="font-medium text-[20px]">Notification</h2>
          <span className={`text-sm font-semibold ${statusColor}`}>
            {connectionState === "connected"
              ? "Live"
              : connectionState === "connecting"
                ? "Connecting"
                : "Disconnected"}
          </span>
        </div>
        {hubUrl ? (
          <>
            {fetchError && (
              <div className="mt-2 text-sm text-red-600">{fetchError}</div>
            )}
            <div
              ref={listRef}
              onScroll={handleScroll}
              className="mt-2 space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1"
            >
              {notifications.length === 0 ? (
                <div className="text-sm text-[#666]">
                  {loadingInitial
                    ? "Loading notifications..."
                    : "Waiting for new orders..."}
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={`${item.id}-${item.orderId}`}
                    className="bg-white border border-[#e1e1e1] rounded-md p-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-[15px]">
                        {item.title}
                      </div>
                      <div className="text-xs text-[#777]">
                        {dateFormatter.format(new Date(item.createdAt))}
                      </div>
                    </div>
                    <div className="text-sm text-[#333] mt-1">
                      {item.content}
                    </div>
                    <div className="text-xs text-[#555] mt-1 flex flex-wrap gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#EEF2FF] text-[#3B4CCA]">
                        Status: {item.statusOrder || "PENDING"}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#FFF4E5] text-[#B26A00]">
                        Pay: {item.statusPay || "PAID"}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#E8F7EF] text-[#2F8F5B]">
                        Method: {item.paymentMethod || "Unknown"}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#F3F4F6] text-[#374151]">
                        Items: {item.items}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="text-sm text-red-600 mt-2">
            Invalid NotifyHub URL. Set NEXT_PUBLIC_NOTIFY_HUB_URL or fix
            gateway config.
          </div>
        )}
      </div>
    </div>
  );
}
