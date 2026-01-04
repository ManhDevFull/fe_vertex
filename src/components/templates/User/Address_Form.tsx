"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit2, FiMapPin, FiPlus, FiTrash2 } from "react-icons/fi";
import { toast } from "sonner";

import EmptyState from "@/components/ui/EmptyState";
import Panel from "@/components/ui/Panel";
import { Modal, ModalBody } from "@/components/ui/modal";
import { resolveWardLocation } from "@/utils/addressLookup";
import {
  createAddress,
  deleteAddress,
  fetchAddresses,
  type Address,
  updateAddress,
} from "@/services/address";

type Province = { code: number; name: string };

type District = {
  code: number;
  name: string;
  province_code: number;
};

type Ward = {
  code: number;
  name: string;
  district_code: number;
};

type AddressFormState = {
  title: string;
  nameRecipient: string;
  tel: string;
  detail: string;
  description: string;
};

const EMPTY_FORM: AddressFormState = {
  title: "Home",
  nameRecipient: "",
  tel: "",
  detail: "",
  description: "",
};

const ADDRESS_LABELS = ["Home", "Office", "Other"];

export default function AddressForm() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formState, setFormState] = useState<AddressFormState>(EMPTY_FORM);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedDistrictCode, setSelectedDistrictCode] = useState("");
  const [selectedWardCode, setSelectedWardCode] = useState("");

  const loadAddresses = async () => {
    setIsFetching(true);
    try {
      const data = await fetchAddresses();
      setAddresses(data);
    } catch (error) {
      console.error("Failed to fetch addresses", error);
      toast.error("Unable to load your addresses.");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);


  useEffect(() => {
    if (!isOpen) return;
    const loadProvinces = async () => {
      try {
        const response = await axios.get(
          "https://provinces.open-api.vn/api/?depth=1"
        );
        setProvinces(response.data ?? []);
      } catch (error) {
        console.error("Failed to load provinces", error);
        toast.error("Unable to load provinces.");
      }
    };
    loadProvinces();
  }, [isOpen]);

  const handleProvinceChange = async (value: string) => {
    setSelectedProvinceCode(value);
    setSelectedDistrictCode("");
    setSelectedWardCode("");
    setWards([]);

    if (!value) {
      setDistricts([]);
      return;
    }

    try {
      const response = await axios.get(
        `https://provinces.open-api.vn/api/p/${value}?depth=2`
      );
      setDistricts(response.data?.districts ?? []);
    } catch (error) {
      console.error("Failed to load districts", error);
    }
  };

  const handleDistrictChange = async (value: string) => {
    setSelectedDistrictCode(value);
    setSelectedWardCode("");

    if (!value) {
      setWards([]);
      return;
    }

    try {
      const response = await axios.get(
        `https://provinces.open-api.vn/api/d/${value}?depth=2`
      );
      setWards(response.data?.wards ?? []);
    } catch (error) {
      console.error("Failed to load wards", error);
    }
  };

  const populateLocationByWard = async (wardCode: number) => {
    try {
      const wardResponse = await axios.get(
        `https://provinces.open-api.vn/api/w/${wardCode}?depth=2`
      );
      const wardData = wardResponse.data;
      const districtCode = wardData?.district?.code;
      const provinceCode = wardData?.district?.province_code;

      if (provinceCode) {
        setSelectedProvinceCode(String(provinceCode));
        const provinceResponse = await axios.get(
          `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
        );
        setDistricts(provinceResponse.data?.districts ?? []);
      }

      if (districtCode) {
        setSelectedDistrictCode(String(districtCode));
        const districtResponse = await axios.get(
          `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
        );
        setWards(districtResponse.data?.wards ?? []);
      }

      setSelectedWardCode(String(wardCode));
    } catch (error) {
      console.error("Failed to populate location", error);
    }
  };

  const openModal = async (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormState({
        title: address.title || "Home",
        nameRecipient: address.nameRecipient,
        tel: address.tel,
        detail: address.detail,
        description: address.description || "",
      });
      setSelectedProvinceCode("");
      setSelectedDistrictCode("");
      setSelectedWardCode("");
      setDistricts([]);
      setWards([]);
      setIsOpen(true);
      if (address.codeWard) {
        await populateLocationByWard(address.codeWard);
      }
    } else {
      setEditingAddress(null);
      setFormState(EMPTY_FORM);
      setSelectedProvinceCode("");
      setSelectedDistrictCode("");
      setSelectedWardCode("");
      setDistricts([]);
      setWards([]);
      setIsOpen(true);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleSave = async () => {
    if (
      !formState.nameRecipient.trim() ||
      !formState.tel.trim() ||
      !formState.detail.trim() ||
      !selectedWardCode
    ) {
      toast.error("Please complete all required fields.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: formState.title,
        nameRecipient: formState.nameRecipient,
        tel: formState.tel,
        detail: formState.detail,
        description: formState.description,
        codeWard: Number(selectedWardCode),
      };

      if (editingAddress) {
        await updateAddress(editingAddress.id, payload);
        toast.success("Address updated.");
      } else {
        await createAddress(payload);
        toast.success("Address added.");
      }

      closeModal();
      await loadAddresses();
    } catch (error: any) {
      console.error("Failed to save address", error);
      toast.error(error?.response?.data?.message || "Unable to save address.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (addressId: number) => {
    const confirmed = window.confirm("Delete this address?");
    if (!confirmed) return;

    try {
      await deleteAddress(addressId);
      toast.success("Address removed.");
      await loadAddresses();
    } catch (error: any) {
      console.error("Failed to delete address", error);
      toast.error(error?.response?.data?.message || "Unable to delete address.");
    }
  };

  return (
    <>
      <Panel
        title="Address book"
        description="Manage your delivery locations and contact details."
        actions={
          <button
            type="button"
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <FiPlus className="text-sm" />
            Add address
          </button>
        }
      >
        {isFetching ? (
          <div className="text-sm text-slate-500">Loading addresses...</div>
        ) : addresses.length === 0 ? (
          <EmptyState
            title="No saved addresses"
            description="Add your first delivery address to speed up checkout."
            action={
              <button
                type="button"
                onClick={() => openModal()}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-white"
              >
                Add address
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {addresses.map((address) => {
              const location = resolveWardLocation(address.codeWard);
              return (
                <div
                  key={address.id}
                  className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        <FiMapPin className="text-xs" />
                        {address.title}
                      </span>
                      <p className="mt-3 text-sm font-semibold text-slate-900">
                        {address.nameRecipient}
                      </p>
                      <p className="text-sm text-slate-500">{address.tel}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openModal(address)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(address.id)}
                        className="rounded-lg border border-red-100 p-2 text-red-500 transition hover:border-red-200 hover:text-red-600"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600">
                    <p>{address.detail || "-"}</p>
                    {location?.label && (
                      <p className="mt-1 text-xs text-slate-500">
                        {location.label}
                      </p>
                    )}
                    {address.description && (
                      <p className="mt-1 text-xs text-slate-400">
                        {address.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      {isOpen && (
        <Modal
          open={isOpen}
          onClose={closeModal}
          variant="centered"
          size="lg"
          showOverlay
          showCloseButton
        >
          <ModalBody className="p-0">
            <div className="space-y-6 p-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {editingAddress ? "Edit address" : "Add a new address"}
                </h3>
                <p className="text-sm text-slate-500">
                  Keep your delivery details accurate for faster checkout.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">
                    Address label
                  </span>
                  <select
                    value={formState.title}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    {ADDRESS_LABELS.map((label) => (
                      <option key={label} value={label}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">
                    Recipient name
                  </span>
                  <input
                    type="text"
                    value={formState.nameRecipient}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        nameRecipient: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">
                  Phone number
                </span>
                <input
                  type="text"
                  value={formState.tel}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, tel: event.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                />
              </label>

              <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 md:grid-cols-3">
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">
                    Province
                  </span>
                  <select
                    value={selectedProvinceCode}
                    onChange={(event) => handleProvinceChange(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Select province</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">
                    District
                  </span>
                  <select
                    value={selectedDistrictCode}
                    onChange={(event) => handleDistrictChange(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    disabled={!selectedProvinceCode}
                  >
                    <option value="">Select district</option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">
                    Ward
                  </span>
                  <select
                    value={selectedWardCode}
                    onChange={(event) => setSelectedWardCode(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    disabled={!selectedDistrictCode}
                  >
                    <option value="">Select ward</option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.code}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">
                  Street address
                </span>
                <input
                  type="text"
                  value={formState.detail}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      detail: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">
                  Delivery note (optional)
                </span>
                <textarea
                  rows={3}
                  value={formState.description}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                />
              </label>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save address"}
                </button>
              </div>
            </div>
          </ModalBody>
        </Modal>
      )}
    </>
  );
}
