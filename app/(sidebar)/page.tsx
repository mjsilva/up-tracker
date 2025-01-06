import prisma from "@/lib/db";
import { currentUserServer } from "@/lib/services/user-service";
import { DateTime } from "luxon";
import { formatToCurrencyFromCents } from "@/lib/utils";

export default async function Home() {
  const user = await currentUserServer();

  const now = DateTime.local();

  // Date ranges
  const startOfDay = now.startOf("day").toJSDate();
  const startOfMonth = now.startOf("month").toJSDate();
  const startOfYear = now.startOf("year").toJSDate();

  const dailyExpenses = await prisma.transaction.aggregate({
    _sum: {
      amountValueInCents: true,
    },
    where: {
      userId: user.id,
      type: "EXPENSE",
      transactionCreatedAt: {
        gte: startOfDay,
      },
    },
  });

  const monthlyExpenses = await prisma.transaction.aggregate({
    _sum: {
      amountValueInCents: true,
    },
    where: {
      userId: user.id,
      type: "EXPENSE",
      transactionCreatedAt: {
        gte: startOfMonth,
      },
    },
  });

  const yearlyExpenses = await prisma.transaction.aggregate({
    _sum: {
      amountValueInCents: true,
    },
    where: {
      userId: user.id,
      type: "EXPENSE",
      transactionCreatedAt: {
        gte: startOfYear,
      },
    },
  });

  return (
    <div className="grid gap-6">
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Overview</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-card p-6 text-card-foreground shadow">
            <h3 className="mb-2 font-medium">Today&#39;s Expenses</h3>
            <p className="text-3xl font-bold">
              {formatToCurrencyFromCents(dailyExpenses._sum.amountValueInCents)}
            </p>
          </div>
          <div className="rounded-lg bg-card p-6 text-card-foreground shadow">
            <h3 className="mb-2 font-medium">This Month</h3>
            <p className="text-3xl font-bold">
              {formatToCurrencyFromCents(
                monthlyExpenses._sum.amountValueInCents,
              )}
            </p>
          </div>
          <div className="rounded-lg bg-card p-6 text-card-foreground shadow">
            <h3 className="mb-2 font-medium">This Year</h3>
            <p className="text-3xl font-bold">
              {formatToCurrencyFromCents(
                yearlyExpenses._sum.amountValueInCents,
              )}
            </p>
          </div>
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Recent Transactions</h2>
        <div className="rounded-lg bg-card text-card-foreground shadow">
          <div className="p-6">
            <p className="text-muted-foreground">
              Placeholder for recent transactions list
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
