import { PrismaClient } from "@prisma/client";
import { DateTime } from "luxon";

const prisma = new PrismaClient();

export async function getDailyExpensesForLastTwoWeeks({
  userId,
}: {
  userId: string;
}) {
  const now = DateTime.local();
  const startOfTwoWeeksAgo = now.minus({ weeks: 2 }).startOf("day").toJSDate();

  // Use raw SQL to group by day (ignoring time)
  const expenses = await prisma.$queryRaw<{ day: Date; amount: number }[]>`
    SELECT
      DATE("transactionCreatedAt") AS day,
      SUM("amountValueInCents") / 100 * -1 AS amount
    FROM
      "Transaction"
    WHERE
      "userId" = ${userId}
      AND "type" = 'EXPENSE'
      AND "transactionCreatedAt" >= ${startOfTwoWeeksAgo}
      AND ("cardPurchaseMethod" = 'CONTACTLESS' OR "cardPurchaseMethod" = 'CARD_PIN')
    GROUP BY
      DATE("transactionCreatedAt")
    ORDER BY
      day ASC;
  `;

  // Format the result for charting
  return expenses.map((expense) => ({
    date: DateTime.fromJSDate(expense.day).toFormat("yyyy-MM-dd"),
    amount: Number(expense.amount),
  }));
}

export async function getMonthlyExpensesForLastYear({
  userId,
}: {
  userId: string;
}) {
  const now = DateTime.local();
  const startOfLastYear = now.minus({ months: 12 }).startOf("month").toJSDate();

  const expenses = await prisma.$queryRaw<{ month: Date; amount: number }[]>`
    SELECT
      DATE_TRUNC('month', "transactionCreatedAt") AS month,
      SUM("amountValueInCents") / 100 * -1 AS amount
    FROM
      "Transaction"
    WHERE
      "userId" = ${userId}
      AND "type" = 'EXPENSE'
      AND "transactionCreatedAt" >= ${startOfLastYear}
      -- this removes internal transfers, but there must be a better way to do this         
      AND description NOT LIKE 'Transfer to%' 
    GROUP BY
      DATE_TRUNC('month', "transactionCreatedAt")
    ORDER BY
      month ASC;
  `;

  // Format the result for charting
  return expenses.map((expense) => ({
    date: DateTime.fromJSDate(expense.month).toFormat("yyyy-MM-01"),
    amount: Number(expense.amount),
  }));
}
