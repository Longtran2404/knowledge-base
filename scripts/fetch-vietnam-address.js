/**
 * Script lấy dữ liệu tỉnh/quận/phường từ provinces.open-api.vn và ghi ra src/data/vietnam-address.json.
 * Chạy: node scripts/fetch-vietnam-address.js
 */

const BASE = 'https://provinces.open-api.vn/api';
const OUT_PATH = 'src/data/vietnam-address.json';
const DELAY_MS = 400;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function main() {
  // Chỉ lấy Hà Nội (1) và TP.HCM (79) để form đăng ký có đủ quận/phường
  const provinceCodes = [1, 79];
  const result = { provinces: [] };

  for (const code of provinceCodes) {
    await sleep(DELAY_MS);
    const detail = await fetchJson(`${BASE}/p/${code}?depth=2`);
    const districts = (detail.districts || []).map((d) => ({ code: d.code, name: d.name, wards: [] }));
    console.log(`${detail.name}: ${districts.length} quận/huyện`);

    for (let j = 0; j < districts.length; j++) {
      await sleep(DELAY_MS);
      try {
        const dDetail = await fetchJson(`${BASE}/d/${districts[j].code}?depth=2`);
        districts[j].wards = (dDetail.wards || []).map((w) => ({ code: w.code, name: w.name }));
      } catch (e) {
        console.warn(`  Wards failed for ${districts[j].name} (${districts[j].code}):`, e.message);
      }
    }

    result.provinces.push({
      code: detail.code,
      name: detail.name,
      districts,
    });
  }

  const fs = await import('fs');
  fs.writeFileSync(OUT_PATH, JSON.stringify(result, null, 0), 'utf8');
  console.log(`Wrote ${OUT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
