import React from "react";
import Transactions from "@/app/(sidebar)/transactions/_components/transactions";
import prisma from "@/lib/db";

async function Page({
  searchParams,
}: {
  searchParams: { page?: string; page_size?: string };
}) {
  const page = parseInt(searchParams?.page || "1", 10);
  const pageSize = parseInt(searchParams?.page_size || "20", 10);

  const totalTransactions = await prisma.transaction.count({
    where: { NOT: { description: "Round Up" } },
  });

  const totalPages = Math.ceil(totalTransactions / pageSize);
  const hasNextPage = page < totalPages;

  const transactions = await prisma.transaction.findMany({
    orderBy: { transactionCreatedAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
    where: { NOT: { description: "Round Up" } },
  });

  return (
    <Transactions
      transactions={transactions}
      pagination={{
        currentPage: page,
        totalPages,
        nextPage: hasNextPage ? page + 1 : null,
      }}
    />
  );
}

export default Page;
