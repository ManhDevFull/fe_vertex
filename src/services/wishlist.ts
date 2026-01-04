import handleAPI from "@/axios/handleAPI";
import { toNumber, toOptionalString, toString } from "@/services/shared";

export type WishListItem = {
  id: number;
  productId: number;
  productName: string;
  imageUrl: string | null;
  minPrice: number;
  totalStock: number;
};

const normalizeWishListItem = (payload: any): WishListItem => ({
  id: toNumber(payload?.id ?? payload?.Id),
  productId: toNumber(payload?.productId ?? payload?.ProductId),
  productName: toString(payload?.productName ?? payload?.ProductName),
  imageUrl: toOptionalString(payload?.imageUrl ?? payload?.ImageUrl),
  minPrice: toNumber(payload?.minPrice ?? payload?.MinPrice),
  totalStock: toNumber(payload?.totalStock ?? payload?.TotalStock),
});

const normalizeWishList = (payload: any): WishListItem[] => {
  const list = Array.isArray(payload) ? payload : payload?.data ?? [];
  if (!Array.isArray(list)) return [];
  return list.map(normalizeWishListItem);
};

export const fetchWishList = async (): Promise<WishListItem[]> => {
  const response = await handleAPI("WishList", undefined, "get");
  return normalizeWishList(response);
};

export const addWishList = async (
  productId: number
): Promise<WishListItem[]> => {
  const response = await handleAPI(
    "WishList",
    { productId },
    "post"
  );
  return normalizeWishList(response);
};

export const removeWishList = async (
  productId: number
): Promise<WishListItem[]> => {
  const response = await handleAPI(
    `WishList/${productId}`,
    undefined,
    "delete"
  );
  return normalizeWishList(response);
};
