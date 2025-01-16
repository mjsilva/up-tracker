import prisma from "@/lib/db";
import { currentUserServer } from "@/lib/services/user-service";
import { DateTime } from "luxon";
import { formatToCurrencyFromCents } from "@/lib/utils";
import { ExpensesChart } from "./_components/expenses-chart";
import {
  getDailyExpensesForLastTwoWeeks,
  getMonthlyExpensesForLastSixMonths,
} from "@/lib/services/transaction-service";

export default async function Home() {
  const user = await currentUserServer();

  const now = DateTime.local();

  // Date ranges
  const startOfDay = now.startOf("day").toJSDate();
  const startOfMonth = now.startOf("month").toJSDate();
  const startOfYear = now.startOf("year").toJSDate();

  const dayExpenses = await prisma.transaction.aggregate({
    _sum: {
      amountValueInCents: true,
    },
    where: {
      userId: user.id,
      type: "EXPENSE",
      transactionCreatedAt: {
        gte: startOfDay,
      },
      NOT: { description: { contains: "Transfer to" } },
    },
  });

  const monthExpenses = await prisma.transaction.aggregate({
    _sum: {
      amountValueInCents: true,
    },
    where: {
      userId: user.id,
      type: "EXPENSE",
      transactionCreatedAt: {
        gte: startOfMonth,
      },
      NOT: { description: { contains: "Transfer to" } },
    },
  });

  const yearExpenses = await prisma.transaction.aggregate({
    _sum: {
      amountValueInCents: true,
    },
    where: {
      userId: user.id,
      type: "EXPENSE",
      transactionCreatedAt: {
        gte: startOfYear,
      },
      NOT: { description: { contains: "Transfer to" } },
    },
  });

  const dailyExpenses = await getDailyExpensesForLastTwoWeeks({
    userId: user.id,
  });

  const monthlyExpenses = await getMonthlyExpensesForLastSixMonths({
    userId: user.id,
  });

  return (
    <div className="grid gap-6">
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Overview</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-card p-6 text-card-foreground shadow">
            <h3 className="mb-2 font-medium">Today&#39;s Expenses</h3>
            <p className="text-3xl font-bold">
              {formatToCurrencyFromCents(dayExpenses._sum.amountValueInCents)}
            </p>
          </div>
          <div className="rounded-lg bg-card p-6 text-card-foreground shadow">
            <h3 className="mb-2 font-medium">This Month</h3>
            <p className="text-3xl font-bold">
              {formatToCurrencyFromCents(monthExpenses._sum.amountValueInCents)}
            </p>
          </div>
          <div className="rounded-lg bg-card p-6 text-card-foreground shadow">
            <h3 className="mb-2 font-medium">This Year</h3>
            <p className="text-3xl font-bold">
              {formatToCurrencyFromCents(yearExpenses._sum.amountValueInCents)}
            </p>
          </div>
        </div>
      </section>
      <section className={"grid grid-cols-1 gap-4 md:grid-cols-2"}>
        <ExpensesChart
          data={dailyExpenses}
          dateLuxonFormat={"LLL d"}
          title={"Daily Expenses"}
          description={"Your card tap spending over the last 2 weeks"}
        />
        <ExpensesChart
          data={monthlyExpenses}
          dateLuxonFormat={"LLL yy"}
          title={"Monthly Expenses"}
          description={"Your expenses over the last 12 months"}
          chartColor={"--chart-2"}
        />
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
