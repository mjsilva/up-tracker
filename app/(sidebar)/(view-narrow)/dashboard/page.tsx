import prisma from "@/lib/db";
import { currentUserServerOrThrow } from "@/lib/services/user-service";
import { DateTime } from "luxon";
import { formatToCurrencyFromCents } from "@/lib/utils";
import { ExpensesChart } from "./_components/expenses-chart";
import {
  getDailyExpensesForLastTwoWeeks,
  getMonthlyExpensesForLastSixMonths,
} from "@/lib/services/transaction-service";
import { fetchAccounts } from "@/lib/services/upbank";
import { AccountCards } from "@/app/(sidebar)/(view-narrow)/dashboard/_components/account-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const revalidate = 3600;

export default async function Home() {
  const user = await currentUserServerOrThrow();

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
      isTransferBetweenAccounts: false,
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
      isTransferBetweenAccounts: false,
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
      isTransferBetweenAccounts: false,
    },
  });

  const dailyExpenses = await getDailyExpensesForLastTwoWeeks({
    userId: user.id,
  });

  const monthlyExpenses = await getMonthlyExpensesForLastSixMonths({
    userId: user.id,
  });

  let accounts;
  try {
    accounts = await fetchAccounts({ userId: user.id });
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="grid gap-10">
      {accounts && (
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Accounts</h2>{" "}
          <AccountCards accounts={accounts} />
        </section>
      )}
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Expenses</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Today&#39;s Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {formatToCurrencyFromCents(dayExpenses._sum.amountValueInCents)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {formatToCurrencyFromCents(
                  monthExpenses._sum.amountValueInCents,
                )}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>This Year</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {formatToCurrencyFromCents(
                  yearExpenses._sum.amountValueInCents,
                )}
              </p>
            </CardContent>
          </Card>
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
          description={"Your expenses over the last 6 months"}
          chartColor={"--chart-2"}
        />
      </section>
    </div>
  );
}
