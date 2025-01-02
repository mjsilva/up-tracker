import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatToCurrencyFromCents(value: unknown, currency = "AUD") {
  if (typeof value !== "number") {
    return;
  }

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: currency,
  }).format(value / 100);
}
