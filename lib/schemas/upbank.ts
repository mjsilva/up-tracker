import { z } from "zod";
import { DateTime } from "luxon";

// Custom Zod schema to handle ISO 8601 date strings with timezone offsets
const isoDateSchema = z.string().transform((str) => {
  const date = DateTime.fromISO(str);
  if (!date.isValid) {
    throw new Error("Invalid date format");
  }
  return date.toJSDate();
});

// Define the Money schema
const MoneySchema = z.object({
  currencyCode: z.string(),
  value: z.string(),
  valueInBaseUnits: z.number(),
});

// Define the Transaction schema with nullish fields
export const UpBankTransactionSchema = z.object({
  id: z.string(),
  attributes: z.object({
    status: z.string(),
    rawText: z.string().nullish(), // rawText is nullish
    description: z.string(),
    message: z.string().nullish(),
    amount: MoneySchema,
    createdAt: isoDateSchema,
    settledAt: isoDateSchema.nullish(), // Can be null if not settled
    cardPurchaseMethod: z
      .object({
        method: z.string(),
        cardNumberSuffix: z.string().nullish(),
      })
      .nullish(), // Nullable for non-card purchases
  }),
  relationships: z.object({
    category: z.object({
      data: z
        .object({
          id: z.string(),
        })
        .nullish(), // Category can be null
    }),
    parentCategory: z.object({
      data: z
        .object({
          id: z.string(),
        })
        .nullish(), // Parent category can be null
    }),
  }),
  foreignAmount: MoneySchema.nullish(), // Nullable if no foreign amount exists
});

// Define API response schema (for array of transactions)
export const UpBankApiResponseSchema = z.object({
  data: z.array(UpBankTransactionSchema),
});
