"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { BsPlusSquareDotted } from "react-icons/bs";
import type { CategoryTree, IProductAdmin } from "@/types/type";
import type { BrandItem } from "@/components/templates/Admin/filterProduct";

export type ProductFormSubmit = {
  name: string;
  description: string;
  brandId: number;
  categoryId: number;
  existingImageUrls: string[];
  newImages: File[];
};

type FormState = {
  name: string;
  description: string;
  brandId: string;
  categoryId: string;
};

const MAX_IMAGES = 10;

type ImageItem = {
  url: string;
  file?: File;
  isNew: boolean;
};

const revokeBlobUrls = (items: ImageItem[]) => {
  items.forEach((item) => {
    if (item.isNew && item.url.startsWith("blob:")) {
      URL.revokeObjectURL(item.url);
    }
  });
};

function flattenCategories(
  tree: CategoryTree[],
  level = 0,
  out: { value: string; label: string }[] = []
) {
  const pad = "— ".repeat(level);
  for (const node of tree) {
    out.push({
      value: String(node.id),
      label: `${pad}${node.namecategory}`,
    });
    if (node.children?.length) {
      flattenCategories(node.children, level + 1, out);
    }
  }
  return out;
}

export interface ProductUpsertModalProps {
  open: boolean;
  mode: "create" | "edit";
  brands: BrandItem[];
  categories: CategoryTree[];
  product?: IProductAdmin | null;
  submitting?: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (payload: ProductFormSubmit) => Promise<void> | void;
}

export default function ProductUpsertModal({
  open,
  mode,
  brands,
  categories,
  product,
  submitting = false,
  error,
  onClose,
  onSubmit,
}: ProductUpsertModalProps) {
  const categoryOptions = useMemo(
    () => [{ value: "", label: "--- Select ---" }, ...flattenCategories(categories)],
    [categories]
  );

  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
    brandId: "",
    categoryId: "",
  });

  const [formError, setFormError] = useState<string>("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const imagesRef = useRef<ImageItem[]>([]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      revokeBlobUrls(imagesRef.current);
    };
  }, []);
  const replaceImages = useCallback((next: ImageItem[]) => {
    setImages((prev) => {
      const nextUrls = new Set(next.map((item) => item.url));
      const removed = prev.filter(
        (item) => item.isNew && item.url.startsWith("blob:") && !nextUrls.has(item.url)
      );
      revokeBlobUrls(removed);
      return next;
    });
  }, []);

  // 🧠 Khi mở modal hoặc chuyển sang edit
  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && product) {
      const brandMatch = brands.find((b) => b.name === product.brand);
      setForm({
        name: product.name ?? "",
        description: product.description ?? "",
        brandId: brandMatch ? String(brandMatch.id) : "",
        categoryId: product.category_id ? String(product.category_id) : "",
      });

      // Ảnh cũ (từ DB)
      replaceImages(
        (product.imageurls || []).map((url) => ({
          url,
          isNew: false,
        }))
      );
    } else {
      setForm({
        name: "",
        description: "",
        brandId: "",
        categoryId: "",
      });
      replaceImages([]);
    }

    setFormError("");
  }, [open, mode, product, brands, replaceImages]);

  // 🧩 Handle change input
  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // 🧩 Upload ảnh mới
  const handleSetImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    let reachedLimit = false;
    setImages((prev) => {
      if (prev.length >= MAX_IMAGES) {
        reachedLimit = true;
        return prev;
      }

      const remainingSlots = Math.max(0, MAX_IMAGES - prev.length);
      if (selectedFiles.length > remainingSlots) {
        reachedLimit = true;
      }
      const newFiles = selectedFiles.slice(0, remainingSlots).map((file) => ({
        url: URL.createObjectURL(file),
        file,
        isNew: true,
      }));
      return [...prev, ...newFiles];
    });

    if (reachedLimit) {
      setFormError(`You can upload up to ${MAX_IMAGES} images per product.`);
    }
  };

  // 🧩 Xóa ảnh
  const handleRemoveImg = (index: number) => {
    setImages((prev) => {
      const target = prev[index];
      if (target) {
        revokeBlobUrls([target]);
      }
      return prev.filter((_, i) => i !== index);
    });
    setFormError((current) =>
      current === `You can upload up to ${MAX_IMAGES} images per product.` ? "" : current
    );
  };

  // 🧩 Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Product name is required.");
      return;
    }
    if (!form.brandId) {
      setFormError("Please select a brand.");
      return;
    }
    if (!form.categoryId) {
      setFormError("Please select a category.");
      return;
    }

    const existingImages = images.filter((img) => !img.isNew);
    const newImageItems = images.filter(
      (img): img is ImageItem & { file: File } => Boolean(img.isNew && img.file)
    );

    const payload: ProductFormSubmit = {
      name: form.name.trim(),
      description: form.description.trim(),
      brandId: Number(form.brandId),
      categoryId: Number(form.categoryId),
      existingImageUrls: existingImages.map((img) => img.url),
      newImages: newImageItems.map((img) => img.file),
    };

    await onSubmit(payload);
  };

  const modalTitle = mode === "create" ? "Create Product" : "Edit Product";

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
        <ModalHeader>
          <h2 className="text-lg font-semibold">{modalTitle}</h2>
        </ModalHeader>
        <ModalBody className="gap-4 overflow-y-auto">
          {(formError || error) && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {formError || error}
            </div>
          )}

          {/* Name */}
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="h-9 w-full rounded-md border border-gray-300 px-3 outline-none focus:border-gray-500"
              placeholder="Product name"
            />
          </label>

          {/* Brand */}
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Brand</span>
            <select
              value={form.brandId}
              onChange={(e) => handleChange("brandId", e.target.value)}
              className="h-9 w-full rounded-md border border-gray-300 px-2 outline-none focus:border-gray-500"
            >
              <option value="">--- Select ---</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </label>

          {/* Category */}
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Category</span>
            <select
              value={form.categoryId}
              onChange={(e) => handleChange("categoryId", e.target.value)}
              className="h-9 w-full rounded-md border border-gray-300 px-2 outline-none focus:border-gray-500"
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value || "all"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          {/* Description */}
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Description</span>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="min-h-[90px] w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
              placeholder="Product description"
            />
          </label>

          {/* Image upload & preview */}
          <div className="flex flex-col gap-2">
            <span className="font-medium text-sm">Images (max {MAX_IMAGES})</span>
            <div className="border border-gray-200 shadow-md rounded-lg p-2 flex flex-wrap gap-2">
              {images.slice(0, MAX_IMAGES).map((item, i) => (
                <div key={i} className="relative group">
                  <img
                    src={item.url}
                    alt={`img-${i}`}
                    className="w-24 h-24 object-cover rounded-md border"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImg(i)}
                    className="absolute top-0 right-0 bg-black/60 text-white rounded-bl-md px-1 text-xs opacity-0 group-hover:opacity-100 transition disabled:opacity-60"
                    disabled={submitting}
                  >
                    ✕
                  </button>
                </div>
              ))}

              {images.length < MAX_IMAGES && (
                <Button
                  type="button"
                  className="!shadow border border-[#47474720]"
                  style={{
                    width: 96,
                    height: 96,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={() => fileRef.current?.click()}
                  disabled={submitting}
                >
                  <BsPlusSquareDotted size={36} style={{ opacity: 0.4 }} />
                </Button>
              )}
            </div>
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
            {submitting ? "Saving..." : mode === "create" ? "Create" : "Save changes"}
          </Button>
        </ModalFooter>
      </form>

      {/* Hidden input file */}
      <input
        accept="image/*"
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        onChange={(val) => {
          handleSetImg(val);
          val.target.value = "";
        }}
      />
    </Modal>
  );
}
