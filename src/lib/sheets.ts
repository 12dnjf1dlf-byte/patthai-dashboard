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

export type NamyuRow = {
  월: number;
  상품명: string;
  카테고리: string;
  매출: number;
  주문수: number;
};

export async function getNamyuData(): Promise<NamyuRow[]> {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "남유에프엔씨 쿠팡!A2:N",
  });

  const rows = response.data.values ?? [];

  return rows
    .map((r) => {
      const dateStr = String(r[0] ?? "");
      const 월 = dateStr.length >= 6 ? Number(dateStr.slice(4, 6)) : 0;
      return {
        월,
        상품명: String(r[4] ?? ""),
        카테고리: String(r[10] ?? ""),
        매출: Number(String(r[12] ?? "0").replace(/,/g, "")),
        주문수: Number(String(r[13] ?? "0").replace(/,/g, "")),
      };
    })
    .filter((r) => r.매출 > 0 && r.월 > 0);
}

export async function getNamyuAdCost(): Promise<AdCostRow[]> {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "남유에프엔씨 쿠팡!AK2:AL13",
  });

  const rows = response.data.values ?? [];

  return rows
    .map((r) => ({
      월: String(r[0] ?? ""),
      광고비: Number(String(r[1] ?? "0").replace(/,/g, "")),
    }))
    .filter((r) => r.광고비 > 0);
}

export type NamyuOrderRow = {
  연도: number;
  월: number;
  상품명: string;
  수량: number;
  매출: number;
};

export async function getNamyuOrderData(): Promise<NamyuOrderRow[]> {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "남유쿠팡 발주기준!A2:L",
  });

  const rows = response.data.values ?? [];

  return rows
    .map((r) => {
      const dateStr = String(r[4] ?? "");
      const match = dateStr.match(/^(\d{4})\/(\d{2})/);
      const 연도 = match ? Number(match[1]) : 0;
      const 월 = match ? Number(match[2]) : 0;
      return {
        연도,
        월,
        상품명: String(r[3] ?? ""),
        수량: Number(String(r[7] ?? "0").replace(/,/g, "")),
        매출: Number(String(r[11] ?? "0").replace(/,/g, "")),
      };
    })
    .filter((r) => r.매출 > 0 && r.연도 > 0);
}

export type AdCostRow = {
  월: string;
  광고비: number;
};

export type AdRow = {
  캠페인명: string;
  광고노출지면: string;
  키워드: string;
  노출수: number;
  클릭수: number;
  광고비: number;
  클릭률: number;
  전환매출14: number;
  주문수14: number;
};

function parseYearMonth(str: string): { 월: number } {
  // "2026년 1월" → 1
  const m = str.match(/(\d+)년\s*(\d+)월/);
  if (m) return { 월: Number(m[2]) };
  // fallback: 기존 "20260101" 형식
  if (str.length >= 6) return { 월: Number(str.slice(4, 6)) };
  return { 월: 0 };
}

export type NutralabRow = NamyuRow;
export type PromidisRow = NamyuRow;

export async function getNutralabData(): Promise<NutralabRow[]> {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "뉴트라랩 쿠팡!A2:Q",
  });
  const rows = response.data.values ?? [];
  return rows
    .map((r) => ({
      월: parseYearMonth(String(r[0] ?? "")).월,
      상품명: String(r[3] ?? ""),
      카테고리: String(r[5] ?? ""),
      매출: Number(String(r[7] ?? "0").replace(/,/g, "")),
      주문수: Number(String(r[16] ?? "0").replace(/,/g, "")),
    }))
    .filter((r) => r.매출 > 0 && r.월 > 0);
}

export async function getNutralabAdCost(): Promise<AdCostRow[]> {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "뉴트라랩 쿠팡!V2:W13",
  });
  const rows = response.data.values ?? [];
  return rows
    .map((r) => ({ 월: String(r[0] ?? ""), 광고비: Number(String(r[1] ?? "0").replace(/,/g, "")) }))
    .filter((r) => r.광고비 > 0);
}

export async function getPromidisData(): Promise<PromidisRow[]> {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "프롬디스 쿠팡!A2:Q",
  });
  const rows = response.data.values ?? [];
  return rows
    .map((r) => ({
      월: parseYearMonth(String(r[0] ?? "")).월,
      상품명: String(r[3] ?? ""),
      카테고리: String(r[5] ?? ""),
      매출: Number(String(r[7] ?? "0").replace(/,/g, "")),
      주문수: Number(String(r[16] ?? "0").replace(/,/g, "")),
    }))
    .filter((r) => r.매출 > 0 && r.월 > 0);
}

export type PromidisFullRow = {
  연도: number;
  월: number;
  상품명: string;
  카테고리: string;
  매출: number;
  주문수: number;
};

export async function getPromidisFullData(): Promise<PromidisFullRow[]> {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "프롬디스 쿠팡!A2:Q",
  });
  const rows = response.data.values ?? [];
  return rows
    .map((r) => {
      const str = String(r[0] ?? "");
      const m = str.match(/(\d{4})년\s*(\d+)월/);
      return {
        연도: m ? Number(m[1]) : 0,
        월: m ? Number(m[2]) : 0,
        상품명: String(r[3] ?? ""),
        카테고리: String(r[5] ?? ""),
        매출: Number(String(r[7] ?? "0").replace(/,/g, "")),
        주문수: Number(String(r[16] ?? "0").replace(/,/g, "")),
      };
    })
    .filter((r) => r.매출 > 0 && r.연도 > 0 && r.월 > 0);
}

export async function getPromidisAdCost(): Promise<AdCostRow[]> {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "프롬디스 쿠팡!V2:W13",
  });
  const rows = response.data.values ?? [];
  return rows
    .map((r) => ({ 월: String(r[0] ?? ""), 광고비: Number(String(r[1] ?? "0").replace(/,/g, "")) }))
    .filter((r) => r.광고비 > 0);
}

export type PromidisAdCostFullRow = { 연도: number; 월: number; 광고비: number };

export async function getPromidisAdCostFull(): Promise<PromidisAdCostFullRow[]> {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "프롬디스 쿠팡!V2:W20",
  });
  const rows = response.data.values ?? [];
  return rows
    .map((r) => {
      const label = String(r[0] ?? "");
      const m = label.match(/(\d{4})년\s*(\d+)월/);
      return {
        연도: m ? Number(m[1]) : 0,
        월: m ? Number(m[2]) : 0,
        광고비: Number(String(r[1] ?? "0").replace(/,/g, "")),
      };
    })
    .filter((r) => r.연도 > 0 && r.월 > 0);
}

export async function getCoupangAdData(): Promise<AdRow[]> {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });

  // 헤더 행 읽기
  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "바질클럽 광고!1:1",
  });
  const headers: string[] = (headerRes.data.values?.[0] ?? []).map((h) => String(h).trim());

  function col(name: string) {
    const idx = headers.findIndex((h) => h.includes(name));
    return idx;
  }

  const iCampaign = col("캠페인명");
  const iZone = col("노출 지면") !== -1 ? col("노출 지면") : col("광고 노출");
  const iKeyword = col("키워드");
  const iImpression = col("노출수");
  const iClick = col("클릭수");
  const iAdCost = col("광고비");
  const iCtr = col("클릭률");
  // 14일 전환매출액 - 여러 표기 시도
  const iSales14 = (() => {
    const candidates = ["총 전환매출액(14일)", "전환매출액(14일)", "전환매출(14", "14일 매출"];
    for (const c of candidates) { const i = col(c); if (i !== -1) return i; }
    return -1;
  })();
  const iOrder14 = (() => {
    const candidates = ["총 주문수(14일)", "주문수(14일)", "주문(14"];
    for (const c of candidates) { const i = col(c); if (i !== -1) return i; }
    return -1;
  })();

  // 데이터 행 읽기
  const dataRes = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "바질클럽 광고!A2:AZ",
  });
  const rows = dataRes.data.values ?? [];

  const n = (r: string[], i: number) =>
    i >= 0 ? Number(String(r[i] ?? "0").replace(/,/g, "")) : 0;

  return rows
    .map((r) => ({
      캠페인명: iCampaign >= 0 ? String(r[iCampaign] ?? "") : "",
      광고노출지면: iZone >= 0 ? String(r[iZone] ?? "") : "",
      키워드: iKeyword >= 0 ? String(r[iKeyword] ?? "") : "",
      노출수: n(r, iImpression),
      클릭수: n(r, iClick),
      광고비: n(r, iAdCost),
      클릭률: n(r, iCtr),
      전환매출14: n(r, iSales14),
      주문수14: n(r, iOrder14),
    }))
    .filter((r) => r.캠페인명 !== "");
}

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
