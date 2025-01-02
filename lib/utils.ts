import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatToCurrencyFromCents(value: unknown) {
  if (typeof value !== "number") {
    return;
  }

  let returnValueNumber = value / 100;
  if (returnValueNumber < 0) {
    returnValueNumber = returnValueNumber * -1;
  }
  const returnValue = returnValueNumber.toFixed(2);

  return value > 0 ? `$${returnValue}` : `-$${returnValue}`;
}
