import { NextRequest, NextResponse } from "next/server";
import { Decimal } from "@prisma/client/runtime/library";
import { UpBankApiResponseSchema } from "@/lib/schemas/upbank";
import prisma from "@/lib/db";
import { TransactionType } from "@prisma/client";

const UPBANK_API_URL = "https://api.up.com.au/api/v1/transactions";

export async function GET(_req: NextRequest) {
  try {
    const apiKey = process.env.UPBANK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Upbank API key is missing" },
        { status: 500 },
      );
    }

    // Fetch transactions from Upbank API
    const response = await fetch(`${UPBANK_API_URL}?page[size]=100`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    const result = UpBankApiResponseSchema.safeParse(data);

    // Handle validation errors
    if (!result.success) {
      console.error("Validation error:", result.error);
      return NextResponse.json(
        { error: "Invalid API response format" },
        { status: 500 },
      );
    }

    const transactions = result.data.data;

    // Upsert transactions in Prisma
    for (const tx of transactions) {
      const {
        id,
        attributes: {
          status,
          rawText,
          description,
          amount,
          createdAt,
          settledAt,
          cardPurchaseMethod,
        },
        relationships: {
          category: { data: category },
          parentCategory: { data: parentCategory },
        },
        foreignAmount,
      } = tx;

      const amountValue = new Decimal(amount.value);

      const commonTransactionData = {
        status,
        rawText: rawText ?? null,
        description,
        amountValue,
        amountCurrencyCode: amount.currencyCode,
        transactionCreatedAt: new Date(createdAt),
        transactionSettledAt: settledAt ? new Date(settledAt) : null,
        cardPurchaseMethod: cardPurchaseMethod?.method ?? null,
        cardNumberSuffix: cardPurchaseMethod?.cardNumberSuffix ?? null,
        upCategory: category?.id ?? null,
        upParentCategory: parentCategory?.id ?? null,
        foreignAmount: foreignAmount ? new Decimal(foreignAmount.value) : null,
      };

      await prisma.transaction.upsert({
        where: { id },
        update: commonTransactionData,
        create: {
          ...commonTransactionData,
          id,
          userId: "1",
          type: amountValue.greaterThan(0)
            ? TransactionType.INCOME
            : TransactionType.EXPENSE,
        },
      });
    }

    return NextResponse.json(
      { message: "Transactions synced successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error syncing transactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
