import React from "react";
import prisma from "@/lib/db";
import { currentUserServer } from "@/lib/services/user-service";
import { Prisma } from "@prisma/client";
import Transactions from "./_components/transactions";

async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; page_size?: string; search?: string }>;
}) {
  const user = await currentUserServer();

  const page = parseInt((await searchParams)?.page || "1", 10);
  const pageSize = parseInt((await searchParams)?.page_size || "20", 10);

  const where = {
    description: { contains: (await searchParams).search, mode: "insensitive" },
    NOT: { description: "Round Up" },
    userId: user.id,
  } satisfies Prisma.TransactionWhereInput;

  const totalTransactions = await prisma.transaction.count({
    where,
  });

  const totalPages = Math.ceil(totalTransactions / pageSize);
  const hasNextPage = page < totalPages;

  const transactions = await prisma.transaction.findMany({
    orderBy: { transactionCreatedAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
    where,
  });

  return (
    <Transactions
      transactions={transactions}
      paginationData={{
        currentPage: page,
        totalPages,
        nextPage: hasNextPage ? page + 1 : null,
      }}
    />
  );
}

export default Page;
