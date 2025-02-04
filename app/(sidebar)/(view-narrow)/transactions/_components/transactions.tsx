"use client";

import { Fragment, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

import { Transaction } from "@prisma/client";
import { DateTime } from "luxon";
import { cn, formatToCurrencyFromCents } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  EditIcon,
  EyeIcon,
  RefreshCcwIcon,
} from "lucide-react";
import { startCase } from "lodash";
import { PaginationData } from "@/lib/types";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { Pagination } from "./pagination";
import { syncTransactions } from "../actionts";
import { TransactionIcon } from "./transaction-icon";
import { FilterControls } from "./filter-controls";
import { AvailableFiltersSchema } from "../types";

export type FiltersData = { categories: Record<string, string[]> };

export function Transactions({
  transactions,
  paginationData,
  filtersData,
}: {
  transactions: Transaction[];
  paginationData: PaginationData;
  filtersData: FiltersData;
}) {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [showFilters, setShowFilters] = useState(() => {
    return Object.keys(AvailableFiltersSchema.shape).some(
      (v) => !!searchParams.get(v),
    );
  });

  async function handleSyncTransactions() {
    toast("Transactions are now syncing, refresh in a bit");
    await syncTransactions();
  }

  const transactionsByDate = transactions.reduce<
    Record<string, { transactions: Transaction[]; total: number }>
  >((acc, transaction) => {
    const dateKey = DateTime.fromJSDate(
      new Date(transaction.transactionCreatedAt),
    ).toFormat("MMM dd, yyyy");
    if (!acc[dateKey]) {
      acc[dateKey] = { transactions: [], total: 0 };
    }
    acc[dateKey].transactions.push(transaction);
    acc[dateKey].total += transaction.amountValueInCents;
    return acc;
  }, {});

  return (
    <div className="flex flex-col space-y-4">
      <div className={"flex justify-end"}>
        <Button variant={"outline"} onClick={() => handleSyncTransactions()}>
          <RefreshCcwIcon />
          Sync
        </Button>
      </div>

      <div className={"flex flex-col gap-2"}>
        <div className={"flex flex-col gap-4 sm:flex-row"}>
          <form method={"get"}>
            <Input
              autoFocus
              placeholder="Search transactions..."
              defaultValue={searchQuery}
              onChange={(e) => {
                if (!e.target.value && searchParams.get("search")) {
                  const form = e.target.form;
                  if (form) {
                    form.submit();
                  }
                }
              }}
              className="w-96"
              name={"search"}
            />
          </form>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full sm:w-auto"
          >
            Filters
            {showFilters ? (
              <ChevronUpIcon className="ml-2 h-4 w-4" />
            ) : (
              <ChevronDownIcon className="ml-2 h-4 w-4" />
            )}
          </Button>
          <Pagination paginationData={paginationData} />
        </div>
        {showFilters && <FilterControls filtersData={filtersData} />}
      </div>

      {/* Desktop view */}
      {/*<div className="hidden rounded-md border md:block">*/}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className={"pr-5 text-right"}>Amount</TableHead>
              <TableHead>Category</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(transactionsByDate).map(
              ([date, { transactions, total }]) => (
                <Fragment key={date}>
                  {!searchQuery && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className={"text-left text-muted-foreground"}
                      >
                        {date}・{transactions.length} transactions
                      </TableCell>
                      <TableCell
                        colSpan={3}
                        className={"text-right text-muted-foreground"}
                      >
                        {formatToCurrencyFromCents(total)}
                      </TableCell>
                    </TableRow>
                  )}
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell align={"center"}>
                        <TransactionIcon
                          cardPurchaseMethod={transaction.cardPurchaseMethod}
                        />
                      </TableCell>
                      <TableCell>
                        {DateTime.fromJSDate(
                          transaction.transactionCreatedAt,
                        ).toLocaleString(DateTime.DATETIME_MED)}
                      </TableCell>
                      <TableCell>
                        {transaction.description}
                        {transaction?.message && (
                          <span> ({transaction?.message})</span>
                        )}
                      </TableCell>
                      <TableCell
                        align={"right"}
                        className={cn(
                          "pr-5",
                          transaction.amountValueInCents > 0
                            ? "text-green-600"
                            : "text-red-600",
                        )}
                      >
                        {formatToCurrencyFromCents(
                          transaction.amountValueInCents,
                        )}
                      </TableCell>
                      <TableCell>
                        <p>
                          {startCase(
                            transaction.upParentCategory?.replaceAll("-", " "),
                          )}
                        </p>
                        <p className={"text-muted-foreground"}>
                          {startCase(
                            transaction.upCategory?.replaceAll("-", " "),
                          )}
                        </p>
                      </TableCell>
                      <TableCell align={"right"}>
                        <Button variant={"ghost"}>
                          <EditIcon />
                        </Button>
                        <Button variant={"ghost"}>
                          <EyeIcon />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </Fragment>
              ),
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile view */}
      {/*<div className="space-y-4 md:hidden">*/}
      {/*  {paginatedTransactions.map((transaction) => (*/}
      {/*    <Card key={transaction.id}>*/}
      {/*      <CardHeader>*/}
      {/*        <CardTitle>{transaction.description}</CardTitle>*/}
      {/*      </CardHeader>*/}
      {/*      <CardContent>*/}
      {/*        <div className="grid grid-cols-2 gap-2">*/}
      {/*          <div className="text-sm font-medium">Date:</div>*/}
      {/*          <div>{transaction.date}</div>*/}
      {/*          <div className="text-sm font-medium">Amount:</div>*/}
      {/*          <div*/}
      {/*            className={*/}
      {/*              transaction.amount >= 0 ? "text-green-600" : "text-red-600"*/}
      {/*            }*/}
      {/*          >*/}
      {/*            ${Math.abs(transaction.amount).toFixed(2)}*/}
      {/*          </div>*/}
      {/*          <div className="text-sm font-medium">Category:</div>*/}
      {/*          <div>{transaction.category}</div>*/}
      {/*          <div className="text-sm font-medium">Action:</div>*/}
      {/*          <div>*/}
      {/*            <Select*/}
      {/*              defaultValue={transaction.category}*/}
      {/*              onValueChange={(value) =>*/}
      {/*                console.log(`Categorized ${transaction.id} as ${value}`)*/}
      {/*              }*/}
      {/*            >*/}
      {/*              <SelectTrigger className="w-full">*/}
      {/*                <SelectValue placeholder="Category" />*/}
      {/*              </SelectTrigger>*/}
      {/*              <SelectContent>*/}
      {/*                {categories.map((category) => (*/}
      {/*                  <SelectItem key={category} value={category}>*/}
      {/*                    {category}*/}
      {/*                  </SelectItem>*/}
      {/*                ))}*/}
      {/*              </SelectContent>*/}
      {/*            </Select>*/}
      {/*          </div>*/}
      {/*        </div>*/}
      {/*      </CardContent>*/}
      {/*    </Card>*/}
      {/*  ))}*/}
      {/*</div>*/}

      <Pagination paginationData={paginationData} />
    </div>
  );
}

export default Transactions;
