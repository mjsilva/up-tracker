import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const LOCALE = "en-AU";

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency,
  }).format(value);
}

export function formatToCurrencyFromCents(value: unknown, currency = "AUD") {
  if (typeof value !== "number") {
    return "";
  }
  return formatCurrency(value / 100, currency);
}

export function formatToCurrency(value: unknown, currency = "AUD") {
  if (typeof value !== "number") {
    return "";
  }
  return formatCurrency(value, currency);
}
