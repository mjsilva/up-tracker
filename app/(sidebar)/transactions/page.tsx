import React from "react";
import Transactions from "@/app/(sidebar)/transactions/_components/transactions";
import prisma from "@/lib/db";

async function Page() {
  let transactions = await prisma.transaction.findMany({
    orderBy: { transactionCreatedAt: "desc" },
  });
  // todo: make this configurable
  transactions = transactions.filter((t) => t.description !== "Round Up");

  return <Transactions transactions={transactions} />;
}

export default Page;
