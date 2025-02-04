import prisma from "@/lib/db";
import { decrypt, encrypt } from "@/lib/encryption";
import {
  UpBankAccountsResponseSchema,
  UpBankApiTransactionResponseSchema,
  UpBankApiTransactionsResponseSchema,
  UpBankApiWebhookCreationsResponseSchema,
  UpBankApiWebhooksResponseSchema,
  UpBankTransactionSchema,
} from "@/lib/schemas/upbank";
import { z } from "zod";
import { Prisma, SettingKey, TransactionType } from "@prisma/client";
import { backOff } from "exponential-backoff";
import SettingUpdateInput = Prisma.SettingUpdateInput;
import TransactionUpdateInput = Prisma.TransactionUpdateInput;

const UPBANK_API_URL_BASE = "https://api.up.com.au/api/v1";
const UPBANK_API_URL_TRANSACTIONS = `${UPBANK_API_URL_BASE}/transactions`;
const UPBANK_API_URL_ACCOUNTS = `${UPBANK_API_URL_BASE}/accounts`;
const UPBANK_API_URL_WEBHOOKS = `${UPBANK_API_URL_BASE}/webhooks`;

async function getUpbankUserApiKey(userId: string) {
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

  return decrypt(upBankApiKeyEncrypted);
}

function appendRawDataToTransactions(responseJson: any) {
  return {
    ...responseJson,
    data: responseJson.data.map((transaction: any) => ({
      ...transaction,
      rawData: transaction,
    })),
  };
}

function appendRawDataToTransaction(responseJson: any) {
  return {
    ...responseJson,
    data: {
      ...responseJson.data,
      rawData: responseJson.data,
    },
  };
}

export async function fetchAccounts({ userId }: { userId: string }) {
  const upBankApiKey = await getUpbankUserApiKey(userId);

  const response = await fetch(UPBANK_API_URL_ACCOUNTS, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${upBankApiKey}`,
      "Content-Type": "application/json",
    },
  });

  const responseJson = await response.json();

  return UpBankAccountsResponseSchema.parse(responseJson);
}

export async function fetchTransactions({
  nextLink,
  userId,
}: {
  nextLink?: string;
  userId: string;
}) {
  const upBankApiKey = await getUpbankUserApiKey(userId);
  const url = nextLink
    ? nextLink
    : `${UPBANK_API_URL_TRANSACTIONS}?page[size]=100`;

  const fetchWithBackoff = async (): Promise<
    z.infer<typeof UpBankApiTransactionsResponseSchema>
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

    // Transform the parsed response to include rawData
    const transformedData = appendRawDataToTransactions(responseJson);

    return UpBankApiTransactionsResponseSchema.parse(transformedData);
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
  const upBankApiKey = await getUpbankUserApiKey(userId);

  const url = `${UPBANK_API_URL_TRANSACTIONS}?page[size]=100`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${upBankApiKey}`,
      "Content-Type": "application/json",
    },
  });

  const responseJson = await response.json();

  // Transform the parsed response to include rawData
  const transformedData = appendRawDataToTransactions(responseJson);

  const transactions =
    UpBankApiTransactionsResponseSchema.parse(transformedData);

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
export async function fetchTransactionSingle({
  userId,
  transactionId,
}: {
  userId: string;
  transactionId: string;
}) {
  const upBankApiKey = await getUpbankUserApiKey(userId);

  // Construct the URL to fetch the single transaction
  const url = `${UPBANK_API_URL_TRANSACTIONS}/${transactionId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${upBankApiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch transaction: ${response.statusText}`);
  }

  const responseJson = await response.json();

  // Transform the parsed response to include rawData
  const transformedData = appendRawDataToTransaction(responseJson);

  return UpBankApiTransactionResponseSchema.parse(transformedData);
}

export async function saveTransactionsToDB({
  transactions,
  userId,
}: {
  transactions: z.infer<typeof UpBankTransactionSchema>[];
  userId: string;
}) {
  for (const tx of transactions) {
    const commonTransactionData = {
      status: tx.attributes.status,
      rawText: tx.attributes.rawText,
      description: tx.attributes.description,
      message: tx.attributes.message,
      amountValueInCents: tx.attributes.amount.valueInBaseUnits,
      amountCurrencyCode: tx.attributes.amount.currencyCode,
      transactionCreatedAt: tx.attributes.createdAt,
      transactionSettledAt: tx.attributes?.settledAt,
      cardPurchaseMethod: tx.attributes.cardPurchaseMethod?.method,
      cardNumberSuffix: tx.attributes.cardPurchaseMethod?.cardNumberSuffix,
      upCategory: tx.relationships.category.data?.id,
      upParentCategory: tx.relationships.parentCategory.data?.id,
      isTransferBetweenAccounts: !!tx.relationships.transferAccount.data?.id,
      type:
        tx.attributes.amount.valueInBaseUnits > 0
          ? TransactionType.INCOME
          : TransactionType.EXPENSE,
      rawData: tx.rawData,
    } satisfies TransactionUpdateInput;

    await prisma.transaction.upsert({
      where: { id: tx.id },
      update: commonTransactionData,
      create: {
        ...commonTransactionData,
        id: tx.id,
        userId,
      },
    });
  }
}

export async function getWebhooks(userId: string) {
  const upBankApiKey = await getUpbankUserApiKey(userId);

  const response = await fetch(UPBANK_API_URL_WEBHOOKS, {
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

  return UpBankApiWebhooksResponseSchema.parse(responseJson);
}

export async function createWebhook({
  userId,
  webhookUrl,
  description,
}: {
  userId: string;
  webhookUrl: string;
  description?: string;
}) {
  const upBankApiKey = await getUpbankUserApiKey(userId);
  console.log({ upBankApiKey });

  const payload = {
    data: {
      attributes: {
        url: webhookUrl,
        ...(description && { description }),
      },
    },
  };

  const response = await fetch(UPBANK_API_URL_WEBHOOKS, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${upBankApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  console.log("Webhook created successfully:", data);

  return UpBankApiWebhookCreationsResponseSchema.parse(data);
}

export async function createAndSaveWebhook(userId: string) {
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("BASE_URL not found");
  }

  const webhookUrl = `${baseUrl}/api/webhooks/upbank/${userId}`;

  const webHookData = await createWebhook({
    userId,
    webhookUrl,
    description: "UP Tracker webhook",
  });

  const commonData = {
    key: SettingKey.UP_BANK_WEBHOOK_SECRET_KEY,
    value: encrypt(webHookData.data.attributes.secretKey),
  } satisfies SettingUpdateInput;

  await prisma.setting.upsert({
    where: {
      userId_key: { userId, key: SettingKey.UP_BANK_WEBHOOK_SECRET_KEY },
    },
    create: {
      userId,
      ...commonData,
    },
    update: {
      ...commonData,
    },
  });
}

export async function validateUpbankApiKey(apiKey: string) {
  try {
    const response = await fetch(`${UPBANK_API_URL_BASE}/util/ping`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Error validating API key:", error);
    return false;
  }
}
