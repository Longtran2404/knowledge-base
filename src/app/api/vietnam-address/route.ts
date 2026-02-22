/**
 * GET /api/vietnam-address
 * Địa chỉ VN (Quận/Huyện, Phường/Xã) từ dữ liệu tĩnh - không phụ thuộc API ngoài.
 * Query: type=districts&provinceName=... | type=wards&districtCode=...
 */

import { NextResponse } from 'next/server';
import addressData from '@/data/vietnam-address.json';

interface WardItem {
  code: number;
  name: string;
}

interface DistrictItem {
  code: number;
  name: string;
  wards: WardItem[];
}

interface ProvinceItem {
  code: number;
  name: string;
  districts: DistrictItem[];
}

const data = addressData as { provinces: ProvinceItem[] };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (type === 'districts') {
    const provinceName = searchParams.get('provinceName');
    if (!provinceName?.trim()) {
      return NextResponse.json({ districts: [] }, { status: 200 });
    }
    const province = data.provinces.find((p) => p.name === provinceName.trim());
    const districts = province?.districts ?? [];
    return NextResponse.json({
      districts: districts.map((d) => ({ code: d.code, name: d.name })),
    }, { status: 200 });
  }

  if (type === 'wards') {
    const districtCode = searchParams.get('districtCode');
    const code = districtCode ? parseInt(districtCode, 10) : NaN;
    if (!districtCode || Number.isNaN(code)) {
      return NextResponse.json({ wards: [] }, { status: 200 });
    }
    for (const p of data.provinces) {
      const district = p.districts.find((d) => d.code === code);
      if (district) {
        return NextResponse.json({
          wards: (district.wards ?? []).map((w) => ({ code: w.code, name: w.name })),
        }, { status: 200 });
      }
    }
    return NextResponse.json({ wards: [] }, { status: 200 });
  }

  return NextResponse.json({ error: 'Missing or invalid type' }, { status: 400 });
}
