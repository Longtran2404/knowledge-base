/**
 * Lấy Quận/Huyện và Phường/Xã/Thị trấn qua proxy Next.js (tránh CORS).
 * Proxy gọi provinces.open-api.vn phía server.
 */

import { safeParseJson } from "./safe-json";

export interface DistrictOption {
  code: number;
  name: string;
}

export interface WardOption {
  code: number;
  name: string;
}

/** Lấy danh sách Quận/Huyện/Thị xã theo tên tỉnh (khớp với dropdown). */
export async function fetchDistrictsByProvince(provinceName: string): Promise<DistrictOption[]> {
  if (!provinceName?.trim()) return [];
  try {
    const res = await fetch(
      `/api/vietnam-address?type=districts&provinceName=${encodeURIComponent(provinceName.trim())}`
    );
    if (!res.ok) return [];
    const text = await res.text();
    if (!text?.trim()) return [];
    const data = safeParseJson<{ districts?: { code: number; name: string }[] }>(text, {});
    return data.districts ?? [];
  } catch {
    return [];
  }
}

/** Lấy danh sách Phường/Xã/Thị trấn theo mã quận/huyện. */
export async function fetchWardsByDistrict(districtCode: number): Promise<WardOption[]> {
  if (!districtCode) return [];
  try {
    const res = await fetch(`/api/vietnam-address?type=wards&districtCode=${districtCode}`);
    if (!res.ok) return [];
    const text = await res.text();
    if (!text?.trim()) return [];
    const data = safeParseJson<{ wards?: { code: number; name: string }[] }>(text, {});
    return data.wards ?? [];
  } catch {
    return [];
  }
}
