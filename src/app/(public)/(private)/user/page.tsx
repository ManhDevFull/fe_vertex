"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import BackNavigation from "@/components/ui/BackNavigation";
import AccountForm from "@/components/templates/User/Account_Form";
import AccountSidebar, {
  type AccountMenuId,
} from "@/components/templates/User/AccountSidebar";
import AddressForm from "@/components/templates/User/Address_Form";
import OrderDetail from "@/components/templates/User/Order_Detail";
import OrderHistory from "@/components/templates/User/Order_History";
import WishList from "@/components/templates/User/Wishlist";
import {
  authSelector,
  removeAuth,
  type UserAuth,
} from "@/redux/reducers/authReducer";

import { logout } from "@/services/user";

type AccountSection = "account" | "orders" | "address" | "wishlist";

const DEFAULT_SECTION: AccountSection = "account";

export default function User() {
  const [activeSection, setActiveSection] = useState<AccountSection>(
    DEFAULT_SECTION
  );
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const auth: UserAuth = useSelector(authSelector);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSectionChange = (id: AccountMenuId) => {
    if (id === "logout") return;
    setSelectedOrderId(null);
    setActiveSection(id);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out.");
    } catch (error) {
      console.error("Logout failed", error);
      toast.error("Could not sign out. Please try again.");
    } finally {
      dispatch(removeAuth());
      router.push("/");
    }
  };

  return (
    <main className="min-h-screen pb-12">
      <BackNavigation />
      <div className="container mx-auto px-4 pb-10 pt-6 md:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            My account
          </h1>
          <p className="text-sm text-slate-500">
            Manage your profile, delivery addresses, orders, and wishlist.
          </p>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row">
          <AccountSidebar
            active={activeSection}
            onSelect={handleSectionChange}
            onLogout={handleLogout}
            auth={auth}
          />
          <div className="flex-1 space-y-6">
            {activeSection === "account" && <AccountForm />}
            {activeSection === "address" && <AddressForm />}
            {activeSection === "wishlist" && <WishList />}
            {activeSection === "orders" && !selectedOrderId && (
              <OrderHistory onSelectOrder={setSelectedOrderId} />
            )}
            {activeSection === "orders" && selectedOrderId !== null && (
              <OrderDetail
                orderId={selectedOrderId}
                onBack={() => setSelectedOrderId(null)}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
