import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import handleAPI from "@/axios/handleAPI";
import { Modal, ModalBody, ModalHeader } from "../ui/modal";
import type { IAddress, IUser } from "@/types/type";
import { resolveWardLocation } from "@/utils/addressLookup";

type ViewUserProps = {
  visible: boolean;
  user: IUser | null;
  onClose: () => void;
};

export default function ViewUser({ visible, onClose, user }: ViewUserProps) {
  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [loading, setLoading] = useState(false);

  const roleLabel = useMemo(() => {
    if (!user) return "-";
    switch (user.role) {
      case 1:
        return "Administrator";
      case 2:
        return "Staff";
      default:
        return "Customer";
    }
  }, [user]);

  useEffect(() => {
    const fetchAddress = async () => {
      if (!user?.id) {
        setAddresses([]);
        return;
      }
      setLoading(true);
      try {
        const res = await handleAPI("admin/Address", { id: user.id }, "post");
        if (res.status === 200) {
          setAddresses(Array.isArray(res.data) ? res.data : []);
        } else {
          setAddresses([]);
        }
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      fetchAddress();
    } else {
      setAddresses([]);
      setLoading(false);
    }
  }, [visible, user?.id]);

  if (!visible) return null;

  return (
    <Modal
      open={visible}
      onClose={onClose}
      variant="centered"
      size="md"
      showOverlay
      showCloseButton
      className="w-200"
    >
      <ModalHeader>
        <h2 className="text-lg font-semibold text-slate-800">User Profile</h2>
      </ModalHeader>
      <ModalBody className="bg-slate-50/60">
        {user ? (
          <div className="flex flex-col gap-5">
            <section className="flex items-start gap-4 rounded-xl bg-white p-4 shadow-[0px_6px_18px_rgba(15,23,42,0.08)]">
              <div className="relative h-16 w-16 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                {user.avatarImg ? (
                  <Image
                    src={user.avatarImg}
                    alt={`${user.name} avatar`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-medium text-slate-500">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {user.name}
                  </h3>
                  <p className="text-sm text-slate-500">{roleLabel}</p>
                </div>
                <dl className="grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  <div>
                    <dt className="font-medium text-slate-500">Email</dt>
                    <dd>{user.email || "-"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">Telephone</dt>
                    <dd>{user.tel || "-"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">Orders</dt>
                    <dd>{user.orders ?? 0}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">User ID</dt>
                    <dd>#{user.id}</dd>
                  </div>
                </dl>
              </div>
            </section>

            <section className="rounded-xl bg-white p-4 shadow-[0px_6px_18px_rgba(15,23,42,0.08)]">
              <header className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">
                  Saved Addresses
                </h3>
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {addresses.length} record{addresses.length === 1 ? "" : "s"}
                </span>
              </header>

              {loading ? (
                <div className="rounded-md border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500">
                  Đang tải địa chỉ...
                </div>
              ) : addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((adr) => {
                    const location = resolveWardLocation(adr.codeward);
                    return (
                      <article
                        key={adr.id}
                        className="rounded-lg border border-slate-100 bg-slate-50 p-3 shadow-sm"
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-slate-700">
                            {adr.title || "Untitled address"}
                          </h4>
                          <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            #{adr.id}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">
                          {adr.namerecipient} - {adr.tel}
                        </p>
                        <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                          {adr.detail}
                        </p>
                        {location?.label && (
                          <p className="text-xs text-slate-500">
                            {location.label}
                          </p>
                        )}
                        {adr.description && (
                          <p className="text-xs text-slate-400">
                            {adr.description}
                          </p>
                        )}
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500">
                  Người dùng chưa lưu địa chỉ nào.
                </div>
              )}
            </section>
          </div>
        ) : (
          <p className="text-center text-sm text-slate-500">No user selected.</p>
        )}
      </ModalBody>
    </Modal>
  );
}
