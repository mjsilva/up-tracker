import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import {
  UpBankApiResponseSchema,
  UpBankTransactionSchema,
} from "@/lib/schemas/upbank";
import { z } from "zod";
import { SettingKey, TransactionType } from "@prisma/client";
import { backOff } from "exponential-backoff";

const UPBANK_API_URL = "https://api.up.com.au/api/v1/transactions";

export async function fetchTransactions({
  nextLink,
  userId,
}: {
  nextLink?: string;
  userId: string;
}) {
  const { value: upBankApiKeyEncrypted } =
    await prisma.setting.findFirstOrThrow({
      select: { value: true },
      where: {
        userId,
        key: SettingKey.UP_BANK_API_KEY,
      },
    });

  if (!upBankApiKeyEncrypted) {
    throw new Error("Up Bank API key not found in user settings");
  }

  const upBankApiKey = decrypt(upBankApiKeyEncrypted);
  const url = nextLink ? nextLink : `${UPBANK_API_URL}?page[size]=100`;

  const fetchWithBackoff = async (): Promise<
    z.infer<typeof UpBankApiResponseSchema>
  > => {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${upBankApiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const responseJson = await response.json();
    return UpBankApiResponseSchema.parse(responseJson);
  };

  try {
    return await backOff(fetchWithBackoff, {
      retry: (error: Error, attemptNumber: number): boolean => {
        // Retry on 429 (Too Many Requests) or 5xx server errors
        if (
          error.message.includes("429") ||
          (error.message.startsWith("5") && error.message.length === 3)
        ) {
          console.warn(
            `Attempt ${attemptNumber} failed: ${error.message}. Retrying...`,
          );
          return true;
        }
        return false;
      },
      numOfAttempts: 5,
      startingDelay: 500,
      timeMultiple: 2,
      jitter: "full",
    });
  } catch (error) {
    throw new Error(
      `Failed to fetch transactions after multiple attempts: ${JSON.stringify(error)}`,
    );
  }
}

export async function fetchTransactionsPartial({ userId }: { userId: string }) {
  const { value: upBankApiKeyEncrypted } =
    await prisma.setting.findFirstOrThrow({
      select: { value: true },
      where: {
        userId,
        key: SettingKey.UP_BANK_API_KEY,
      },
    });

  if (!upBankApiKeyEncrypted) {
    throw new Error("up bank api key not found in user settings");
  }

  const upBankApiKey = decrypt(upBankApiKeyEncrypted);

  const url = `${UPBANK_API_URL}?page[size]=100`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${upBankApiKey}`,
      "Content-Type": "application/json",
    },
  });

  const responseJson = await response.json();

  const transactions = UpBankApiResponseSchema.parse(responseJson);

  const lastTransaction = await prisma.transaction.findFirst({
    where: { userId },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
    },
  });

  if (!lastTransaction) {
    return transactions;
  }

  const lastSyncedTransactionId = lastTransaction.id;

  for (const transaction of transactions.data) {
    if (
      transaction.id === lastSyncedTransactionId &&
      transactions.links?.next
    ) {
      // set next link as null as we don't need to iterate further as we reached the last synced if
      transactions.links.next = null;
      break;
    }
  }

  return transactions;
}

export async function saveTransactionsToDB({
  transactions,
  userId,
}: {
  transactions: z.infer<typeof UpBankTransactionSchema>[];
  userId: string;
}) {
  for (const tx of transactions) {
    const {
      id,
      attributes: {
        status,
        rawText,
        description,
        message,
        amount,
        createdAt,
        settledAt,
        cardPurchaseMethod,
      },
      relationships: {
        category: { data: category },
        parentCategory: { data: parentCategory },
      },
    } = tx;

    const commonTransactionData = {
      status,
      rawText: rawText ?? null,
      description,
      message: message ?? null,
      amountValueInCents: amount.valueInBaseUnits,
      amountCurrencyCode: amount.currencyCode,
      transactionCreatedAt: new Date(createdAt),
      transactionSettledAt: settledAt ? new Date(settledAt) : null,
      cardPurchaseMethod: cardPurchaseMethod?.method ?? null,
      cardNumberSuffix: cardPurchaseMethod?.cardNumberSuffix ?? null,
      upCategory: category?.id ?? null,
      upParentCategory: parentCategory?.id ?? null,
      type:
        amount.valueInBaseUnits > 0
          ? TransactionType.INCOME
          : TransactionType.EXPENSE,
    };

    await prisma.transaction.upsert({
      where: { id },
      update: commonTransactionData,
      create: {
        ...commonTransactionData,
        id,
        userId,
      },
    });
  }
}
