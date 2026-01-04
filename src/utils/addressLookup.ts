import { getWards } from "sub-vn";

type WardRecord = {
  code?: string | number;
  name?: string;
  district_name?: string;
  province_name?: string;
  full_name?: string;
};

export type WardLocation = {
  ward: string;
  district: string;
  province: string;
  label: string;
};

const wardCache = new Map<number, WardLocation>();
let cacheReady = false;

const buildCache = () => {
  if (cacheReady) return;
  cacheReady = true;

  const wards = getWards() as WardRecord[];
  wards.forEach((ward) => {
    const numericCode = Number(ward.code);
    if (!Number.isFinite(numericCode) || numericCode <= 0) return;

    const wardName = ward.name ?? "";
    const districtName = ward.district_name ?? "";
    const provinceName = ward.province_name ?? "";
    const label =
      ward.full_name ??
      [wardName, districtName, provinceName].filter(Boolean).join(", ");

    if (!label) return;

    wardCache.set(numericCode, {
      ward: wardName,
      district: districtName,
      province: provinceName,
      label,
    });
  });
};

export const resolveWardLocation = (
  code?: number | string | null
): WardLocation | null => {
  if (code === null || code === undefined) return null;
  const numericCode = Number(code);
  if (!Number.isFinite(numericCode) || numericCode <= 0) return null;

  buildCache();
  return wardCache.get(numericCode) ?? null;
};
