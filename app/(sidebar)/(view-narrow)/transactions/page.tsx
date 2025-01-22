import React from "react";
import prisma from "@/lib/db";
import { currentUserServer } from "@/lib/services/user-service";
import { Prisma } from "@prisma/client";
import Transactions from "./_components/transactions";
import { AvailableFilters, AvailableFiltersSchema } from "./types";
import { DateTime } from "luxon";

async function Page({
  searchParams,
}: {
  searchParams: Promise<
    { page?: string; pageSize?: string; search?: string } & AvailableFilters
  >;
}) {
  const awaitedSearchParams = await searchParams;
  const user = await currentUserServer();

  const page = parseInt(awaitedSearchParams?.page || "1", 10);
  const pageSize = parseInt(awaitedSearchParams?.pageSize || "20", 10);

  if (pageSize > 50) {
    throw new Error("Page size exceeded max 50 allowed");
  }

  const { upParentCategory, upCategory, dateFrom, dateTo } =
    AvailableFiltersSchema.parse(awaitedSearchParams);

  console.log(AvailableFiltersSchema.parse(awaitedSearchParams));

  const where = {
    description: { contains: (await searchParams).search, mode: "insensitive" },
    isTransferBetweenAccounts: false,
    userId: user.id,
    upCategory: upCategory === "all" ? undefined : upCategory,
    upParentCategory: upParentCategory === "all" ? undefined : upParentCategory,
    ...(dateFrom || dateTo
      ? {
          transactionCreatedAt: {
            ...(dateFrom
              ? { gte: DateTime.fromISO(dateFrom).startOf("day").toJSDate() }
              : undefined),
            ...(dateTo
              ? { lte: DateTime.fromISO(dateTo).endOf("day").toJSDate() }
              : undefined),
          },
        }
      : undefined),
  } satisfies Prisma.TransactionWhereInput;

  console.log({ where });

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

  const categoriesDb = await prisma.transaction.groupBy({
    by: ["upParentCategory", "upCategory"],
    where: {
      NOT: { upParentCategory: null, upCategory: null },
    },
    orderBy: [{ upParentCategory: "asc" }, { upCategory: "asc" }],
  });

  const categories = categoriesDb.reduce<Record<string, string[]>>(
    (acc, { upCategory, upParentCategory }) => {
      if (!upParentCategory || !upCategory) {
        return acc;
      }

      if (!acc[upParentCategory]) {
        acc[upParentCategory] = [];
      }

      acc[upParentCategory].push(upCategory);

      return acc;
    },
    {},
  );

  return (
    <Transactions
      filtersData={{ categories }}
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
