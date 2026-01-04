"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { IVariant } from "@/types/type";

export type VariantFormSubmit = {
  valuevariant: Record<string, string>;
  stock: number;
  inputprice: number;
  price: number;
};

type AttributeRow = {
  id: string;
  key: string;
  value: string;
};

const defaultAttributeRow = (): AttributeRow => ({
  id: Math.random().toString(36).slice(2),
  key: "",
  value: "",
});

const parseAttributes = (valueVariant: any): AttributeRow[] => {
  if (!valueVariant) return [defaultAttributeRow()];
  try {
    if (typeof valueVariant === "string") {
      valueVariant = JSON.parse(valueVariant);
    }
  } catch {
    return [defaultAttributeRow()];
  }

  if (Array.isArray(valueVariant)) {
    const rows = valueVariant.flatMap((item: any) => {
      if (item && typeof item === "object") {
        return Object.entries(item).map(([key, value]) => ({
          id: Math.random().toString(36).slice(2),
          key,
          value: String(value ?? ""),
        }));
      }
      return [];
    });
    return rows.length > 0 ? rows : [defaultAttributeRow()];
  }

  if (typeof valueVariant === "object") {
    const entries = Object.entries(valueVariant).map(([key, value]) => ({
      id: Math.random().toString(36).slice(2),
      key,
      value: String(value ?? ""),
    }));
    return entries.length > 0 ? entries : [defaultAttributeRow()];
  }

  return [defaultAttributeRow()];
};

export interface VariantUpsertModalProps {
  open: boolean;
  mode: "create" | "edit";
  variant?: IVariant | null;
  productName?: string;
  submitting?: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (payload: VariantFormSubmit) => Promise<void> | void;
}

export default function VariantUpsertModal({
  open,
  mode,
  variant,
  productName,
  submitting = false,
  error,
  onClose,
  onSubmit,
}: VariantUpsertModalProps) {
  const [attributes, setAttributes] = useState<AttributeRow[]>([defaultAttributeRow()]);
  const [stock, setStock] = useState<string>("0");
  const [inputPrice, setInputPrice] = useState<string>("0");
  const [price, setPrice] = useState<string>("0");
  const [formError, setFormError] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && variant) {
      setAttributes(parseAttributes(variant.valuevariant));
      setStock(String(variant.stock ?? 0));
      setInputPrice(String(variant.inputprice ?? 0));
      setPrice(String(variant.price ?? 0));
    } else {
      setAttributes([defaultAttributeRow()]);
      setStock("0");
      setInputPrice("0");
      setPrice("0");
    }
    setFormError("");
  }, [open, mode, variant]);

  const handleAttributeChange = (id: string, field: "key" | "value", value: string) => {
    setAttributes((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const addAttributeRow = () => {
    setAttributes((prev) => [...prev, defaultAttributeRow()]);
  };

  const removeAttributeRow = (id: string) => {
    setAttributes((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((row) => row.id !== id);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    const numericStock = Number(stock);
    const numericInputPrice = Number(inputPrice);
    const numericPrice = Number(price);

    if (!Number.isFinite(numericStock) || numericStock < 0) {
      setFormError("Stock must be a non-negative number.");
      return;
    }
    if (!Number.isFinite(numericInputPrice) || numericInputPrice < 0) {
      setFormError("Input price must be a non-negative number.");
      return;
    }
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      setFormError("Price must be a non-negative number.");
      return;
    }

    const attributeMap: Record<string, string> = {};
    attributes.forEach(({ key, value }) => {
      if (key.trim()) {
        attributeMap[key.trim()] = value.trim();
      }
    });

    if (Object.keys(attributeMap).length === 0) {
      setFormError("Please provide at least one attribute (key and value).");
      return;
    }

    await onSubmit({
      valuevariant: attributeMap,
      stock: numericStock,
      inputprice: numericInputPrice,
      price: numericPrice,
    });
  };

  const title = mode === "create" ? "Add Variant" : "Edit Variant";
  const subtitle = useMemo(() => {
    if (!productName) return null;
    return mode === "create"
      ? `for product: ${productName}`
      : `Product: ${productName}`;
  }, [mode, productName]);

  return (
    <Modal
      open={open}
      onClose={submitting ? () => undefined : onClose}
      variant="centered"
      showOverlay
      showCloseButton={!submitting}
      size="lg"
      className="max-h-[90vh]"
    >
      <form onSubmit={handleSubmit} className="flex h-full flex-col">
        <ModalHeader className="flex-col items-start gap-1">
          <h2 className="text-lg font-semibold">{title}</h2>
          {subtitle && <span className="text-sm text-gray-500">{subtitle}</span>}
        </ModalHeader>
        <ModalBody className="gap-4">
          {(formError || error) && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {formError || error}
            </div>
          )}

          <div className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Attributes</span>
            <div className="flex flex-col gap-2">
              {attributes.map((row, index) => (
                <div key={row.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={row.key}
                    onChange={(e) => handleAttributeChange(row.id, "key", e.target.value)}
                    placeholder="Key"
                    className="h-9 flex-1 rounded-md border border-gray-300 px-3 outline-none focus:border-gray-500"
                  />
                  <input
                    type="text"
                    value={row.value}
                    onChange={(e) => handleAttributeChange(row.id, "value", e.target.value)}
                    placeholder="Value"
                    className="h-9 flex-1 rounded-md border border-gray-300 px-3 outline-none focus:border-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeAttributeRow(row.id)}
                    className="h-9 rounded-md border border-gray-300 px-3 text-sm text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
                    disabled={attributes.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addAttributeRow}
                className="self-start text-sm text-blue-600 hover:text-blue-500"
              >
                + Add attribute
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
            <label className="flex flex-col gap-1">
              <span className="font-medium">Stock</span>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="h-9 rounded-md border border-gray-300 px-3 outline-none focus:border-gray-500"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-medium">Input price</span>
              <input
                type="number"
                min={0}
                value={inputPrice}
                onChange={(e) => setInputPrice(e.target.value)}
                className="h-9 rounded-md border border-gray-300 px-3 outline-none focus:border-gray-500"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-medium">Price</span>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-9 rounded-md border border-gray-300 px-3 outline-none focus:border-gray-500"
              />
            </label>
          </div>
        </ModalBody>
        <ModalFooter className="justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : mode === "create" ? "Create variant" : "Save changes"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
