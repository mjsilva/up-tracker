"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getDailyExpensesForLastTwoWeeks } from "@/lib/services/transaction-service";
import { DateTime } from "luxon";
import { formatToCurrency } from "@/lib/utils";

export function DailyExpensesChart({
  data,
}: {
  data: Awaited<ReturnType<typeof getDailyExpensesForLastTwoWeeks>>;
}) {
  return (
    <Card className="max-w-screen-sm">
      <CardHeader>
        <CardTitle>Daily Expenses</CardTitle>
        <CardDescription>
          Your card tap spending over the last 2 weeks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            amount: {
              label: "Amount",
              color: "hsl(var(--chart-1))",
            },
          }}
        >
          <BarChart accessibilityLayer data={data}>
            <XAxis
              dataKey="day"
              tickFormatter={(value) =>
                DateTime.fromSQL(value).toFormat("LLL d")
              }
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(value) => formatToCurrency(value)}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="amount"
              fill="var(--color-amount)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
