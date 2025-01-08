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

  return expenses.map((expense) => ({
    date: DateTime.fromJSDate(expense.day).toFormat("yyyy-MM-dd"),
    amount: Number(expense.amount),
  }));
}

export async function getMonthlyExpensesForLastSixMonths({
  userId,
}: {
  userId: string;
}) {
  const now = DateTime.local();
  const startOfSixMonthsAgo = now
    .minus({ months: 6 })
    .startOf("month")
    .toJSDate();

  const expenses = await prisma.$queryRaw<{ month: Date; amount: number }[]>`
    SELECT
      DATE_TRUNC('month', "transactionCreatedAt") AS month,
      SUM("amountValueInCents") / 100 * -1 AS amount
    FROM
      "Transaction"
    WHERE
      "userId" = ${userId}
      AND "type" = 'EXPENSE'
      AND "transactionCreatedAt" >= ${startOfSixMonthsAgo}
      -- this prevents internal transfers between accounts to be counted as expenses
      AND description NOT LIKE 'Transfer to%'
    GROUP BY
      DATE_TRUNC('month', "transactionCreatedAt")
    ORDER BY
      month ASC;
  `;

  // Fill missing months with zero so months always show even if they have no expenses
  const sixMonths = Array.from({ length: 6 }).map((_, i) =>
    now.minus({ months: i }).startOf("month"),
  );

  const expensesMap = new Map(
    expenses.map((e) => [
      DateTime.fromJSDate(e.month).toFormat("yyyy-MM"),
      e.amount,
    ]),
  );

  return sixMonths
    .map((date) => ({
      date: date.toFormat("yyyy-MM-01"),
      amount: Number(expensesMap.get(date.toFormat("yyyy-MM"))) || 0,
    }))
    .reverse();
}
