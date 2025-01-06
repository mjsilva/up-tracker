import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import {
  UpBankApiResponseSchema,
  UpBankTransactionSchema,
} from "@/lib/schemas/upbank";
import { z } from "zod";
import { SettingKey, TransactionType } from "@prisma/client";

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
    throw new Error("up bank api key not found in user settings");
  }

  const upBankApiKey = decrypt(upBankApiKeyEncrypted);

  const url = nextLink ? nextLink : `${UPBANK_API_URL}?page[size]=100`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${upBankApiKey}`,
      "Content-Type": "application/json",
    },
  });

  const responseJson = await response.json();

  return UpBankApiResponseSchema.parse(responseJson);
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
