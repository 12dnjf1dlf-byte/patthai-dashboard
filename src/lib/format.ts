export function formatKRW(value: number): string {
  if (value >= 100_000_000) {
    return `${(value / 100_000_000).toFixed(1)}억원`;
  }
  if (value >= 10_000_000) {
    return `${(value / 10_000_000).toFixed(1)}천만원`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}백만원`;
  }
  return `${value.toLocaleString()}원`;
}

export function formatKRWShort(value: number): string {
  if (value >= 100_000_000) {
    return `${(value / 100_000_000).toFixed(1)}억`;
  }
  if (value >= 10_000_000) {
    return `${(value / 10_000_000).toFixed(1)}천만`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}백만`;
  }
  return `${value.toLocaleString()}`;
}

export const CHANNEL_COLORS: Record<string, string> = {
  배달: "#7B70EE",
  오프라인: "#00CFAA",
  온라인: "#4A9EFF",
};

export const CATEGORY_COLORS = [
  "#00CFAA",
  "#7B70EE",
  "#4A9EFF",
  "#F59E0B",
  "#EC4899",
  "#34D399",
];
