"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Transaction } from "@prisma/client";
import { DateTime } from "luxon";
import { formatToCurrencyFromCents } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EditIcon, EyeIcon } from "lucide-react";
import { startCase } from "lodash";
import { useRouter, useSearchParams } from "next/navigation";

const categories = [
  "Food",
  "Transportation",
  "Shopping",
  "Income",
  "Entertainment",
  "Bills",
  "Other",
];

export function Transactions({
  transactions,
  pagination,
}: {
  transactions: Transaction[];
  pagination: {
    currentPage: number;
    totalPages: number;
    nextPage: number | null;
  };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  function setPage(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Transactions</h1>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Input
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="max-w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop view */}
      <div className="hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className={"text-right"}>Amount</TableHead>
              <TableHead>Category</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
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
                  className={
                    transaction.amountValueInCents > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {formatToCurrencyFromCents(transaction.amountValueInCents)}
                </TableCell>
                <TableCell>
                  {startCase(
                    transaction.upParentCategory?.replaceAll("-", " "),
                  )}
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

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => {
                if (pagination.currentPage === 1) {
                  return;
                }
                setPage(pagination.currentPage - 1);
              }}
            />
          </PaginationItem>
          {[...Array(pagination.totalPages)].map((_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                onClick={() => {
                  setPage(i);
                }}
                isActive={pagination.currentPage === i + 1}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => {
                if (!pagination.nextPage) {
                  return;
                }
                setPage(pagination.nextPage);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export default Transactions;
