import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 날짜를 YYYY.MM.DD 형식으로 포맷팅합니다.
 * @param date - 포맷팅할 날짜 (Date 객체 또는 문자열)
 * @returns 포맷팅된 날짜 문자열 (예: "2024.01.15")
 */
export function formatDate(date?: Date | string): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}
