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
    day: DateTime.fromJSDate(expense.day).toFormat("yyyy-MM-dd"),
    amount: Number(expense.amount),
  }));
}
