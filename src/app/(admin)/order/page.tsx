"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import handleAPI from "@/axios/handleAPI";
import Pagination from "@/components/ui/pageNavigation";
import OrderToolbar from "@/components/templates/Admin/Order/Toolbar";
import OrderFilters from "@/components/templates/Admin/Order/Filters";
import OrderSummaryCards from "@/components/templates/Admin/Order/SummaryCards";
import OrdersTable from "@/components/templates/Admin/Order/Table";
import OrderDetailModal from "@/components/modules/order/OrderDetailModal";
import ChooseModule from "@/components/modules/ChooseModal";
import { IOrderAdmin, IOrderSummary } from "@/types/type";
import { formatCurrency, extractErrorMessage } from "@/utils/orderHelpers";

type FilterState = {
  status: string;
  payment: string;
  payType: string;
  keyword: string;
  fromDate: string;
  toDate: string;
};

const DEFAULT_FILTER: FilterState = {
  status: "ALL",
  payment: "ALL",
  payType: "ALL",
  keyword: "",
  fromDate: "",
  toDate: "",
};

export default function OrderPage() {
  const [orders, setOrders] = useState<IOrderAdmin[]>([]);
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [pendingKeyword, setPendingKeyword] = useState(() => DEFAULT_FILTER.keyword);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadFlag, setReloadFlag] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<IOrderAdmin | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    order: IOrderAdmin | null;
    nextStatus: "" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    paymentStatus?: string;
    message: string;
  }>({
    open: false,
    order: null,
    nextStatus: "",
    paymentStatus: undefined,
    message: "",
  });
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const refreshOrders = useCallback(() => setReloadFlag((flag) => flag + 1), []);
  const resetPagingAndMessages = useCallback(() => {
    setPage(1);
    setSuccessMessage(null);
    setError(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("size", String(pageSize));

      if (filter.status !== "ALL") params.set("status", filter.status);
      if (filter.payment !== "ALL") params.set("payment", filter.payment);
      if (filter.payType !== "ALL") params.set("payType", filter.payType);
      if (filter.keyword) params.set("keyword", filter.keyword);
      if (filter.fromDate) params.set("fromDate", filter.fromDate);
      if (filter.toDate) params.set("toDate", filter.toDate);

      try {
        const res = await handleAPI(`admin/Order?${params.toString()}`);
        if (cancelled) return;

        if (res.status === 200) {
          console.log(res.data)
          setOrders(Array.isArray(res.data?.items) ? res.data.items : []);
          setTotal(Number(res.data?.total) || 0);
        } else {
          setOrders([]);
          setTotal(0);
        }
      } catch (err) {
        console.log(err)
        if (!cancelled) {
          setOrders([]);
          setTotal(0);
          setError(extractErrorMessage(err, "Không thể tải danh sách đơn hàng"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, [filter, page, pageSize, reloadFlag]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );



  const handleStatusFilterChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value;
      resetPagingAndMessages();
      setFilter((prev) => ({ ...prev, status: value }));
    },
    [resetPagingAndMessages]
  );

  const handleFromDateChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      resetPagingAndMessages();
      setFilter((prev) => ({ ...prev, fromDate: value }));
    },
    [resetPagingAndMessages]
  );

  const handleToDateChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      resetPagingAndMessages();
      setFilter((prev) => ({ ...prev, toDate: value }));
    },
    [resetPagingAndMessages]
  );

  const handleKeywordInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setPendingKeyword(event.target.value);
    },
    []
  );

  const handleSearch = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      resetPagingAndMessages();
      setFilter((prev) => ({ ...prev, keyword: pendingKeyword.trim() }));
    },
    [pendingKeyword, resetPagingAndMessages]
  );

  const handleResetFilters = useCallback(() => {
    setFilter(DEFAULT_FILTER);
    setPendingKeyword("");
    resetPagingAndMessages();
  }, [resetPagingAndMessages]);

  const handleViewDetail = useCallback((order: IOrderAdmin) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  }, []);

  const closeConfirm = useCallback(() => {
    setUpdating(false);
    setConfirmState({
      open: false,
      order: null,
      nextStatus: "",
      paymentStatus: undefined,
      message: "",
    });
  }, []);

  const handleStatusPrompt = useCallback((
    order: IOrderAdmin,
    nextStatus: "SHIPPED" | "DELIVERED" | "CANCELLED"
  ) => {
    let message = "";
    let paymentStatus: string | undefined;

    if (nextStatus === "SHIPPED") {
      message = `Mark order #${order.id} as shipped?`;
    } else if (nextStatus === "DELIVERED") {
      message = `Mark order #${order.id} as delivered${
        order.typepay === "COD" && order.statuspay === "UNPAID"
          ? " and set payment to PAID"
          : ""
      }?`;
      if (order.typepay === "COD" && order.statuspay === "UNPAID") {
        paymentStatus = "PAID";
      }
    } else if (nextStatus === "CANCELLED") {
      message = `Cancel order #${order.id}?`;
    }

    setConfirmState({
      open: true,
      order,
      nextStatus,
      paymentStatus,
      message,
    });
  }, []);

  const handleConfirmStatus = useCallback(async () => {
    if (updating || !confirmState.order || !confirmState.nextStatus) return;
    setUpdating(true);
    setError(null);

    try {
      const payload: { status: string; paymentStatus?: string } = {
        status: confirmState.nextStatus,
      };
      if (confirmState.paymentStatus) {
        payload.paymentStatus = confirmState.paymentStatus;
      }

      const res = await handleAPI(
        `/admin/Order/${confirmState.order.id}/status`,
        payload,
        "put"
      );

      if (res.status === 200) {
        const statusLabel = confirmState.nextStatus.toLowerCase();
        setSuccessMessage(`Order #${confirmState.order.id} ${statusLabel} successfully.`);
        closeConfirm();
        refreshOrders();
        setSelectedOrder((prev) => {
          if (!prev || prev.id !== confirmState.order?.id) return prev;
          return {
            ...prev,
            statusOrder: confirmState.nextStatus,
            statusPay: confirmState.paymentStatus ?? prev.statuspay,
            receiveDate:
              confirmState.nextStatus === "DELIVERED"
                ? new Date().toISOString()
                : prev.receivedate,
          };
        });
      } else {
        setError("Không thể cập nhật đơn hàng");
      }
    } catch (err) {
      setError(extractErrorMessage(err, "Không thể cập nhật đơn hàng"));
    } finally {
      setUpdating(false);
    }
  }, [
    closeConfirm,
    confirmState.order,
    confirmState.nextStatus,
    confirmState.paymentStatus,
    refreshOrders,
    updating,
  ]);

  const handleShip = useCallback(
    (order: IOrderAdmin) => handleStatusPrompt(order, "SHIPPED"),
    [handleStatusPrompt]
  );

  const handleDeliver = useCallback(
    (order: IOrderAdmin) => handleStatusPrompt(order, "DELIVERED"),
    [handleStatusPrompt]
  );

  const handleCancel = useCallback(
    (order: IOrderAdmin) => handleStatusPrompt(order, "CANCELLED"),
    [handleStatusPrompt]
  );

  const confirmButtonClass = useMemo(() => {
    const confirmYesStyle =
      confirmState.nextStatus === "DELIVERED"
        ? "bg-[#047857] text-white"
        : confirmState.nextStatus === "CANCELLED"
        ? "bg-[#dc2626] text-white"
        : "bg-[#2563eb] text-white";
    return `${confirmYesStyle} ${updating ? "pointer-events-none opacity-60" : ""}`;
  }, [confirmState.nextStatus, updating]);

  return (
    <div className="rounded-lg bg-[#D9D9D940] p-3 shadow-[0px_2px_4px_rgba(0,0,0,0.25)] w-full h-full">
      <OrderToolbar
        keyword={pendingKeyword}
        onKeywordChange={handleKeywordInput}
        onSubmit={handleSearch}
        onReset={handleResetFilters}
      />
      <OrderFilters
        filter={{
          status: filter.status,
          fromDate: filter.fromDate,
          toDate: filter.toDate,
        }}
        onStatusChange={handleStatusFilterChange}
        onFromDateChange={handleFromDateChange}
        onToDateChange={handleToDateChange}
      />

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      <OrdersTable
        orders={orders}
        loading={loading}
        onView={handleViewDetail}
        onShip={handleShip}
        onDeliver={handleDeliver}
        onCancel={handleCancel}
      />

      <div className="mt-0">
        <Pagination
          type="orders"
          label="orders"
          totalPage={totalPages}
          page={page}
          totalProduct={total}
          onChangePage={setPage}
          siblingCount={1}
        />
      </div>

      <OrderDetailModal
        open={detailModalOpen}
        orderId={selectedOrder?.id ?? null}
        fallback={selectedOrder}
        onClose={() => setDetailModalOpen(false)}
      />
      <ChooseModule
        text={confirmState.message || "Are you sure?"}
        open={confirmState.open}
        onClose={closeConfirm}
        styleYes={confirmButtonClass}
        onYes={() => {
          if (!updating) {
            handleConfirmStatus();
          }
        }}
      />
    </div>
  );
}
