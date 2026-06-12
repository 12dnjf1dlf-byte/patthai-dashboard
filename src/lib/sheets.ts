import { google } from "googleapis";

export type SalesRow = {
  날짜: string;
  연도: number;
  월: number;
  주차: string;
  채널구분: string;
  채널명: string;
  카테고리: string;
  메뉴명: string;
  수량: number;
  단가: number;
  매출액: number;
};

export type CoupangRow = {
  월: string;
  상품명: string;
  카테고리: string;
  판매방식: string;
  매출: number;
  주문수: number;
};

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

export async function getSalesData(): Promise<SalesRow[]> {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "RAW_DATA!A2:K",
  });

  const rows = response.data.values ?? [];

  return rows.map((r) => ({
    날짜: String(r[0] ?? ""),
    연도: Number(r[1]),
    월: Number(r[2]),
    주차: String(r[3] ?? ""),
    채널구분: String(r[4] ?? ""),
    채널명: String(r[5] ?? ""),
    카테고리: String(r[6] ?? ""),
    메뉴명: String(r[7] ?? ""),
    수량: Number(String(r[8] ?? "0").replace(/,/g, "")),
    단가: Number(String(r[9] ?? "0").replace(/,/g, "")),
    매출액: Number(String(r[10] ?? "0").replace(/,/g, "")),
  }));
}

export async function getCoupangData(): Promise<CoupangRow[]> {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "바질클럽 쿠팡!A2:I",
  });

  const rows = response.data.values ?? [];

  return rows
    .map((r) => ({
      월: String(r[0] ?? ""),
      상품명: String(r[3] ?? ""),
      카테고리: String(r[5] ?? ""),
      판매방식: String(r[6] ?? ""),
      매출: Number(String(r[7] ?? "0").replace(/,/g, "")),
      주문수: Number(String(r[8] ?? "0").replace(/,/g, "")),
    }))
    .filter((r) => r.매출 > 0);
}

export type AdCostRow = {
  월: string;
  광고비: number;
};

export async function getCoupangAdCost(): Promise<AdCostRow[]> {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "바질클럽 쿠팡!V2:W13",
  });

  const rows = response.data.values ?? [];

  return rows
    .map((r) => ({
      월: String(r[0] ?? ""),
      광고비: Number(String(r[1] ?? "0").replace(/,/g, "")),
    }))
    .filter((r) => r.광고비 > 0);
}
