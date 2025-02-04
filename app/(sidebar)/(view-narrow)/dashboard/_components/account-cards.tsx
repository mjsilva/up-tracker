import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { UpBankAccountsResponseSchema } from "@/lib/schemas/upbank";
import { formatToCurrencyFromCents } from "@/lib/utils";

type AccountCardsProps = {
  accounts: z.infer<typeof UpBankAccountsResponseSchema>;
};

export function AccountCards({ accounts }: AccountCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {accounts.data.map((account) => (
        <Card key={account.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex justify-between text-sm font-medium">
              {account.attributes.displayName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatToCurrencyFromCents(
                account.attributes.balance.valueInBaseUnits,
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
