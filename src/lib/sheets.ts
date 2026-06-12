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

export async function getSalesData(): Promise<SalesRow[]> {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });

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
