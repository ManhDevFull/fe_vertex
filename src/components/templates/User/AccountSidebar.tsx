"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useDispatch } from "react-redux";
import { CiCamera } from "react-icons/ci";
import { FiHeart, FiLogOut, FiMapPin, FiPackage, FiUser } from "react-icons/fi";
import { toast } from "sonner";

import HamsterWheel from "@/components/ui/HamsterWheel";
import {
  updateAuthAvatar,
  type UserAuth,
} from "@/redux/reducers/authReducer";
import { deleteAvatar, uploadAvatar } from "@/services/user";

export type AccountMenuId = "account" | "orders" | "address" | "wishlist" | "logout";

type AccountSidebarProps = {
  active: AccountMenuId;
  onSelect: (id: AccountMenuId) => void;
  onLogout: () => void;
  auth: UserAuth;
};

type MenuItem = {
  id: AccountMenuId;
  label: string;
  description: string;
  icon: JSX.Element;
};

const menuItems: MenuItem[] = [
  {
    id: "account",
    label: "Profile",
    description: "Personal details",
    icon: <FiUser className="text-lg" />,
  },
  {
    id: "orders",
    label: "Orders",
    description: "History and status",
    icon: <FiPackage className="text-lg" />,
  },
  {
    id: "address",
    label: "Addresses",
    description: "Delivery locations",
    icon: <FiMapPin className="text-lg" />,
  },
  {
    id: "wishlist",
    label: "Wishlist",
    description: "Saved products",
    icon: <FiHeart className="text-lg" />,
  },
  {
    id: "logout",
    label: "Sign out",
    description: "End this session",
    icon: <FiLogOut className="text-lg" />,
  },
];

const FALLBACK_AVATAR =
  "https://res.cloudinary.com/do0im8hgv/image/upload/v1757949054/image_zbt0bw.png";

export default function AccountSidebar({
  active,
  onSelect,
  onLogout,
  auth,
}: AccountSidebarProps) {
  const dispatch = useDispatch();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayName = auth.name || "Customer";
  const displayEmail = auth.email || "Welcome back";
  const avatarUrl = auth.avata || FALLBACK_AVATAR;

  const handleMenuClick = (id: AccountMenuId) => {
    if (id === "logout") {
      onLogout();
      return;
    }
    onSelect(id);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await handleAvatarUpload(file);
    event.target.value = "";
  };

  const preloadImage = (src: string) =>
    new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.src = src;
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Failed to preload image"));
    });

  const handleAvatarUpload = async (file: File) => {
    if (isUploading) return;
    setIsUploading(true);
    const toastId = toast.loading("Updating avatar...");
    const previousAvatar = auth.avata;

    try {
      const response = await uploadAvatar(file);
      if (!response.avatarUrl) {
        throw new Error("Avatar URL missing from response.");
      }
      await preloadImage(response.avatarUrl);
      dispatch(updateAuthAvatar({ avata: response.avatarUrl }));
      toast.success(response.message || "Avatar updated.");
      if (previousAvatar) {
        deleteAvatar(previousAvatar).catch(() => undefined);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "Upload failed."
      );
    } finally {
      toast.dismiss(toastId);
      setIsUploading(false);
    }
  };

  return (
    <aside className="w-full max-w-full lg:max-w-sm">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0">
            <img
              src={avatarUrl}
              alt="Profile avatar"
              className="h-20 w-20 rounded-2xl object-cover"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 rounded-full border border-white bg-slate-900 p-2 text-white shadow-lg transition hover:bg-slate-800"
              disabled={isUploading}
              aria-label="Upload avatar"
            >
              <CiCamera size={16} />
            </button>
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80">
                <HamsterWheel scale={0.5} />
              </div>
            )}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">
              {displayName}
            </p>
            <p className="text-sm text-slate-500">{displayEmail}</p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
        />

        <div className="mt-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleMenuClick(item.id)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                    : "border-transparent bg-slate-50 text-slate-700 hover:border-slate-200 hover:bg-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      isActive ? "bg-white/15 text-white" : "bg-white text-slate-600"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">
                      {item.label}
                    </span>
                    <span
                      className={`block text-xs ${
                        isActive ? "text-white/70" : "text-slate-400"
                      }`}
                    >
                      {item.description}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
