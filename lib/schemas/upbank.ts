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

const MoneySchema = z.object({
  currencyCode: z.string(),
  value: z.string(),
  valueInBaseUnits: z.number(),
});

export const UpBankTransactionSchema = z.object({
  id: z.string(),
  attributes: z.object({
    status: z.string(),
    rawText: z.string().nullish(),
    description: z.string(),
    message: z.string().nullish(),
    amount: MoneySchema,
    createdAt: isoDateSchema,
    settledAt: isoDateSchema.nullish(),
    cardPurchaseMethod: z
      .object({
        method: z.string(),
        cardNumberSuffix: z.string().nullish(),
      })
      .nullish(),
  }),
  relationships: z.object({
    category: z.object({
      data: z
        .object({
          id: z.string(),
        })
        .nullish(),
    }),
    parentCategory: z.object({
      data: z
        .object({
          id: z.string(),
        })
        .nullish(),
    }),
    transferAccount: z.object({
      data: z
        .object({
          id: z.string(),
        })
        .nullish(),
    }),
  }),
  foreignAmount: MoneySchema.nullish(),
  rawData: z.any().optional(),
});

export const UpBankApiTransactionsResponseSchema = z.object({
  data: z.array(UpBankTransactionSchema),
  links: z.object({
    prev: z.string().url().nullish(),
    next: z.string().url().nullish(),
  }),
});

export const UpBankApiTransactionResponseSchema = z.object({
  data: UpBankTransactionSchema,
});

export const UpBankWebhookSchema = z.object({
  id: z.string(),
  attributes: z.object({
    url: z.string(),
    description: z.string().nullish(),
    createdAt: z.string().nullish(),
  }),
});

export const UpBankApiWebhookCreationsResponseSchema = z.object({
  data: z.object({
    id: z.string(),
    attributes: z.object({
      url: z.string(),
      description: z.string().nullish(),
      secretKey: z.string(),
      createdAt: isoDateSchema,
    }),
  }),
});

export const UpBankApiWebhooksResponseSchema = z.object({
  data: z.array(UpBankWebhookSchema),
  links: z.object({
    prev: z.string().url().nullish(),
    next: z.string().url().nullish(),
  }),
});

export const UpBankWebhookEventTypeSchema = z.enum([
  "PING",
  "TRANSACTION_CREATED",
  "TRANSACTION_SETTLED",
  "TRANSACTION_DELETED",
]);

export const UpBankWebhookPayloadSchema = z.object({
  data: z.object({
    id: z.string(),
    attributes: z.object({
      eventType: UpBankWebhookEventTypeSchema,
      createdAt: isoDateSchema,
    }),
    relationships: z.object({
      webhook: z.object({
        data: z.object({
          type: z.literal("webhooks"),
          id: z.string(),
        }),
      }),
      transaction: z
        .object({
          data: z.object({
            type: z.literal("transactions"),
            id: z.string(),
          }),
          links: z
            .object({
              related: z.string().url(),
            })
            .optional(),
        })
        .optional(),
    }),
  }),
});
