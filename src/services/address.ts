import handleAPI from "@/axios/handleAPI";
import { toNumber, toOptionalString, toString } from "@/services/shared";

export type Address = {
  id: number;
  title: string;
  nameRecipient: string;
  tel: string;
  codeWard: number;
  detail: string;
  description: string | null;
  fullAddress: string | null;
};

export type AddressPayload = {
  title: string;
  nameRecipient: string;
  tel: string;
  codeWard: number;
  detail: string;
  description?: string;
};

const normalizeAddress = (payload: any): Address => ({
  id: toNumber(payload?.id ?? payload?.Id),
  title: toString(payload?.title ?? payload?.Title),
  nameRecipient: toString(payload?.nameRecipient ?? payload?.NameRecipient),
  tel: toString(payload?.tel ?? payload?.Tel),
  codeWard: toNumber(payload?.codeWard ?? payload?.CodeWard),
  detail: toString(payload?.detail ?? payload?.Detail),
  description: toOptionalString(payload?.description ?? payload?.Description),
  fullAddress: toOptionalString(payload?.fullAddress ?? payload?.FullAddress),
});

export const fetchAddresses = async (): Promise<Address[]> => {
  const response = await handleAPI("Address/my-addresses", undefined, "get");
  if (!Array.isArray(response)) return [];
  return response.map(normalizeAddress);
};

export const createAddress = async (
  payload: AddressPayload
): Promise<Address> => {
  const response = await handleAPI(
    "Address",
    {
      Title: payload.title,
      NameRecipient: payload.nameRecipient,
      Tel: payload.tel,
      CodeWard: payload.codeWard,
      Detail: payload.detail,
      Description: payload.description ?? "",
    },
    "post"
  );
  return normalizeAddress(response);
};

export const updateAddress = async (
  id: number,
  payload: AddressPayload
): Promise<Address> => {
  const response = await handleAPI(
    `Address/${id}`,
    {
      Title: payload.title,
      NameRecipient: payload.nameRecipient,
      Tel: payload.tel,
      CodeWard: payload.codeWard,
      Detail: payload.detail,
      Description: payload.description ?? "",
    },
    "put"
  );
  return normalizeAddress(response);
};

export const deleteAddress = async (id: number): Promise<void> => {
  await handleAPI(`Address/${id}`, undefined, "delete");
};
