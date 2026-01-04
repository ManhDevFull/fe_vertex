"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export type CategoryFormValues = {
  name: string;
  parentId: number | null;
};

export type CategoryOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export interface CategoryUpsertModalProps {
  open: boolean;
  mode: "create" | "edit";
  submitting?: boolean;
  error?: string;
  initialValues?: CategoryFormValues;
  parentOptions: CategoryOption[];
  disabledOptionIds?: Set<number>;
  parentLocked?: boolean;
  onClose: () => void;
  onSubmit: (payload: CategoryFormValues) => Promise<void> | void;
}

const ROOT_OPTION: CategoryOption = { value: "root", label: "Root (no parent)" };

export default function CategoryUpsertModal({
  open,
  mode,
  submitting = false,
  error,
  initialValues,
  parentOptions,
  disabledOptionIds,
  parentLocked = false,
  onClose,
  onSubmit,
}: CategoryUpsertModalProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [parentId, setParentId] = useState<number | null>(initialValues?.parentId ?? null);
  const [formError, setFormError] = useState<string>("");

  useEffect(() => {
    if (open) {
      setName(initialValues?.name ?? "");
      setParentId(initialValues?.parentId ?? null);
      setFormError("");
    }
  }, [open, initialValues?.name, initialValues?.parentId]);

  const options = useMemo(() => {
    const mapped = parentOptions.map((opt) => ({
      ...opt,
      disabled: opt.disabled || disabledOptionIds?.has(Number(opt.value)) || false,
    }));
    return [ROOT_OPTION, ...mapped];
  }, [parentOptions, disabledOptionIds]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError("Name is required.");
      return;
    }
    setFormError("");
    await onSubmit({ name: trimmed, parentId });
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={submitting ? () => undefined : onClose}
      variant="centered"
      showOverlay
      showCloseButton={!submitting}
      size="md"
      className="max-h-[90vh]"
    >
      <form onSubmit={handleSubmit} className="flex h-full flex-col">
        <ModalHeader>
          <h2 className="text-lg font-semibold">
            {mode === "create" ? "Create category" : "Edit category"}
          </h2>
        </ModalHeader>
        <ModalBody className="gap-4">
          {(formError || error) && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {formError || error}
            </div>
          )}

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-600">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-gray-500"
              placeholder="Category name"
              disabled={submitting}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-600">Parent category</span>
            <select
              value={parentId === null ? ROOT_OPTION.value : String(parentId)}
              onChange={(e) => {
                const value = e.target.value;
                setParentId(value === ROOT_OPTION.value ? null : Number(value));
              }}
              disabled={parentLocked || submitting}
              className="h-9 rounded-md border border-gray-300 px-2 text-sm outline-none focus:border-gray-500"
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))}
            </select>
            {parentLocked && (
              <span className="text-xs text-gray-500">Parent is locked for this action.</span>
            )}
          </label>
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
            {submitting ? "Saving..." : mode === "create" ? "Create" : "Save changes"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
