"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatTree } from "@/app/utils/formartTree";
import handleAPI from "@/axios/handleAPI";
import CategoryToolbar from "@/components/templates/Admin/Category/Toolbar";
import CategoryTreeTable from "@/components/templates/Admin/Category/TreeTable";
import ChooseModule from "@/components/modules/ChooseModal";
import CategoryUpsertModal, {
  CategoryFormValues,
  CategoryOption,
} from "@/components/modules/category/CategoryUpsertModal";
import { CategoryTree, ICategory } from "@/types/type";
import { toast } from "sonner";

const flattenCategories = (
  tree: CategoryTree[],
  level = 0,
  out: CategoryOption[] = []
) => {
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
};

const normalizeCategoryRecord = (category: unknown): ICategory | null => {
  if (!category || typeof category !== "object") return null;
  const raw = category as Record<string, unknown>;
  const id = Number(raw.id);
  const name = typeof raw.namecategory === "string" ? raw.namecategory : "";
  if (!Number.isFinite(id) || !name) return null;
  const productValue = Number(raw.product ?? 0);
  const idparentValue =
    raw.idparent === null || raw.idparent === undefined
      ? null
      : Number(raw.idparent);

  return {
    id,
    namecategory: name,
    product: Number.isFinite(productValue) ? productValue : 0,
    idparent:
      idparentValue === null || !Number.isFinite(idparentValue)
        ? null
        : idparentValue,
  };
};

const normalizeCategoryCollection = (data: unknown): ICategory[] => {
  if (!Array.isArray(data)) return [];
  const normalized: ICategory[] = [];
  for (const item of data) {
    const category = normalizeCategoryRecord(item);
    if (category) normalized.push(category);
  }
  return normalized;
};

const collectDescendantIds = (node: CategoryTree, acc: Set<number>) => {
  if (!node.children) return;
  for (const child of node.children) {
    acc.add(child.id);
    collectDescendantIds(child, acc);
  }
};

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "string" && error.trim()) {
    return error;
  }
  if (error && typeof error === "object") {
    const maybeMessage = (error as { message?: unknown }).message;
    const dataMessage = (error as { data?: { message?: unknown } }).data
      ?.message;
    const responseMessage = (
      error as { response?: { data?: { message?: unknown } } }
    ).response?.data?.message;

    const resolved = [maybeMessage, dataMessage, responseMessage].find(
      (msg): msg is string => typeof msg === "string" && msg.length > 0
    );

    if (resolved) {
      return resolved;
    }
  }
  return fallback;
};

export default function CategoryPage() {
  const [categoriesRaw, setCategoriesRaw] = useState<ICategory[]>([]);
  const [openIds, setOpenIds] = useState<number[]>([]);
  const [pageError, setPageError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState<"create" | "edit">(
    "create"
  );
  const [categoryModalSubmitting, setCategoryModalSubmitting] = useState(false);
  const [categoryModalError, setCategoryModalError] = useState("");
  const [parentLocked, setParentLocked] = useState(false);
  const [disabledParentIds, setDisabledParentIds] = useState<Set<number>>();
  const [categoryInitialValues, setCategoryInitialValues] =
    useState<CategoryFormValues>({
      name: "",
      parentId: null,
    });
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null
  );
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryTree | null>(
    null
  );

  const listCate = useMemo(() => formatTree(categoriesRaw), [categoriesRaw]);

  const toggleOpen = (id: number) =>
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setPageError("");
    try {
      const res: any = await handleAPI("/admin/category");
      if (res?.status === 200) {
        const normalized = normalizeCategoryCollection(res.data);
        setCategoriesRaw(normalized);
      } else {
        setPageError(res?.message ?? "Failed to load categories");
        toast.error(res?.message ?? "Failed to load categories");
      }
    } catch (error) {
      const message = extractErrorMessage(error, "Failed to load categories");
      setPageError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const categoryOptions = useMemo(
    () => flattenCategories(listCate),
    [listCate]
  );

  const openCreateCategory = (parentId: number | null, lockParent = false) => {
    setCategoryModalMode("create");
    setEditingCategoryId(null);
    setCategoryInitialValues({ name: "", parentId });
    setParentLocked(lockParent);
    setDisabledParentIds(undefined);
    setCategoryModalError("");
    setCategoryModalOpen(true);
  };

  const openEditCategory = (category: CategoryTree) => {
    setCategoryModalMode("edit");
    setEditingCategoryId(category.id);
    setCategoryInitialValues({
      name: category.namecategory,
      parentId: category.idparent ?? null,
    });
    const blocked = new Set<number>();
    blocked.add(category.id);
    collectDescendantIds(category, blocked);
    setDisabledParentIds(blocked);
    setParentLocked(false);
    setCategoryModalError("");
    setCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (values: CategoryFormValues) => {
    setCategoryModalSubmitting(true);
    setCategoryModalError("");
    try {
      const nextParent = values.parentId ?? null;
      const payload: { name: string; parentId?: number | null } = {
        name: values.name,
      };

      if (categoryModalMode === "create") {
        payload.parentId = nextParent;
      } else if (categoryModalMode === "edit") {
        const initialParent = categoryInitialValues.parentId ?? null;
        if (nextParent !== initialParent) {
          payload.parentId = nextParent;
        }
      }

      let res: any;
      if (categoryModalMode === "create") {
        res = await handleAPI("/admin/category", payload, "post");
      } else if (editingCategoryId !== null) {
        res = await handleAPI(
          `/admin/category/${editingCategoryId}`,
          payload,
          "put"
        );
      } else {
        return;
      }
      if (res?.status === 200 || res?.status === 201) {
        const normalized = normalizeCategoryRecord(res?.data);
        if (normalized) {
          if (categoryModalMode === "create") {
            setCategoriesRaw((prev) => {
              const exists = prev.some((c) => c.id === normalized.id);
              const next = exists
                ? prev.map((c) => (c.id === normalized.id ? normalized : c))
                : [...prev, normalized];
              if (normalized.idparent !== null) {
                const parentId = normalized.idparent;
                setOpenIds((ids) =>
                  ids.includes(parentId) ? ids : [...ids, parentId]
                );
              }
              return next;
            });
            toast.success(res?.message ?? "Category created successfully");
          } else {
            setCategoriesRaw((prev) =>
              prev.map((c) => (c.id === normalized.id ? normalized : c))
            );
            toast.success(res?.message ?? "Category updated successfully");
          }
        } else {
          await fetchCategories();
        }
        setCategoryModalOpen(false);
        setEditingCategoryId(null);
      } else {
        setCategoryModalError(res?.message ?? "Operation failed");
        toast.error(res?.message ?? "Operation failed");
      }
    } catch (error) {
      const message = extractErrorMessage(error, "Operation failed");
      setCategoryModalError(message);
      toast.error(message);
    } finally {
      setCategoryModalSubmitting(false);
    }
  };

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    const hasLocalChildren =
      Array.isArray(categoryToDelete.children) &&
      categoryToDelete.children.length > 0;

    if (hasLocalChildren) {
      setPageError("Cannot delete a category that still has child categories.");
      toast.error("Cannot delete a category that still has child categories.");
      setCategoryToDelete(null);
      return;
    }

    try {
      const res: any = await handleAPI(
        `/admin/category/${categoryToDelete.id}`,
        null,
        "delete"
      );
      if (res?.status === 200) {
        setCategoryToDelete(null);
        const idsToRemove = new Set<number>([categoryToDelete.id]);
        collectDescendantIds(categoryToDelete, idsToRemove);
        setCategoriesRaw((prev) =>
          prev.filter((item) => !idsToRemove.has(item.id))
        );
        setOpenIds((prev) => prev.filter((id) => !idsToRemove.has(id)));
        toast.success(res?.message ?? "Category deleted");
      } else {
        setPageError(res?.message ?? "Failed to delete category");
        toast.error(res?.message ?? "Failed to delete category");
        setCategoryToDelete(null);
      }
    } catch (error) {
      const message = extractErrorMessage(error, "Failed to delete category");
      setPageError(message);
      toast.error(message);
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="flex h-full w-full flex-col rounded-lg bg-[#D9D9D940] p-2 shadow-[0px_2px_4px_rgba(0,0,0,0.25)]">
      <CategoryToolbar onCreateRoot={() => openCreateCategory(null)} />

      {pageError && (
        <div className="mb-3 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-700">
          {pageError}
        </div>
      )}

      <CategoryTreeTable
        categories={listCate}
        openIds={openIds}
        loading={loading}
        onToggle={toggleOpen}
        onAddChild={(category) => openCreateCategory(category.id, true)}
        onEdit={openEditCategory}
        onDelete={(category) => setCategoryToDelete(category)}
      />

      <CategoryUpsertModal
        open={categoryModalOpen}
        mode={categoryModalMode}
        submitting={categoryModalSubmitting}
        error={categoryModalError}
        initialValues={categoryInitialValues}
        parentOptions={categoryOptions}
        disabledOptionIds={disabledParentIds}
        parentLocked={parentLocked}
        onClose={() => {
          if (!categoryModalSubmitting) {
            setCategoryModalOpen(false);
            setEditingCategoryId(null);
          }
        }}
        onSubmit={handleCategorySubmit}
      />

      <ChooseModule
        text="Are you sure you want to delete this category?"
        styleYes="bg-[#ff000095] text-white"
        open={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onYes={handleConfirmDeleteCategory}
      />
    </div>
  );
}
