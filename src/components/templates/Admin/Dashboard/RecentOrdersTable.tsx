import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { IAdminDashboardOrder } from "@/types/type";
import {
  badgeClass,
  formatCurrency,
  formatDateTime,
  ORDER_STATUS_STYLES,
  PAYMENT_STATUS_STYLES,
  PAY_TYPE_STYLES,
} from "@/utils/orderHelpers";

export type RecentOrdersTableProps = {
  orders: IAdminDashboardOrder[];
};

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle>Recent orders</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        {orders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No recent orders to display.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="pb-3 font-semibold">Order</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Items</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100">
                    <td className="py-3">
                      <p className="font-semibold text-slate-900">#{order.id}</p>
                      <p className="text-xs text-slate-500">
                        {formatDateTime(order.orderDate)}
                      </p>
                    </td>
                    <td className="py-3">
                      <p className="font-medium text-slate-800">
                        {order.customerName || "Unknown"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {order.customerEmail || "-"}
                      </p>
                    </td>
                    <td className="py-3 text-slate-600">{order.itemCount}</td>
                    <td className="py-3 font-semibold text-slate-900">
                      {formatCurrency(order.totalPrice)}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          className={badgeClass(
                            order.statusOrder,
                            ORDER_STATUS_STYLES
                          )}
                        >
                          {order.statusOrder || "-"}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={badgeClass(
                            order.statusPay,
                            PAYMENT_STATUS_STYLES,
                            "border-slate-200 text-slate-500"
                          )}
                        >
                          {order.statusPay || "-"}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={badgeClass(
                            order.typePay,
                            PAY_TYPE_STYLES,
                            "border-slate-200 text-slate-500"
                          )}
                        >
                          {order.typePay || "-"}
                        </Badge>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
