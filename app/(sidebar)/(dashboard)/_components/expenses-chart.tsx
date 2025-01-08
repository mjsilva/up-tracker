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
import { formatToCurrency } from "@/lib/utils";
import { DateTime } from "luxon";

type ExpensesChartProps = {
  data: { date: string; amount: number }[];
  dateLuxonFormat: string;
  title: string;
  description: string;
  chartColor?: string;
};

export function ExpensesChart({
  data,
  dateLuxonFormat,
  title,
  description,
  chartColor,
}: ExpensesChartProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            amount: {
              label: "Amount",
              color: `hsl(var(${chartColor || "--chart-1"}))`,
            },
          }}
        >
          <BarChart accessibilityLayer data={data}>
            <XAxis
              dataKey="date"
              tickFormatter={(value) =>
                DateTime.fromSQL(value).toFormat(dateLuxonFormat)
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
