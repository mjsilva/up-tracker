import React from "react";
import {
  Pagination as PaginationPrimitive,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PaginationData } from "@/lib/types";
import { useSearchParams } from "next/navigation";

type PaginationProps = { paginationData: PaginationData; siblings?: number };

export function Pagination({ paginationData, siblings = 1 }: PaginationProps) {
  const searchParams = useSearchParams();

  // Generate page URLs
  function getPageHref(page: number | string) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    return `?${params.toString()}`;
  }

  // Page generation logic
  const generatePages = (
    current: number,
    total: number,
    siblingCount: number,
  ) => {
    const totalNumbers = siblingCount * 2 + 3;
    const totalBlocks = totalNumbers + 2;

    if (total <= totalBlocks) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const startPage = Math.max(current - siblingCount, 1);
    const endPage = Math.min(current + siblingCount, total);

    return [
      ...(startPage > 2 ? [1, "..."] : startPage === 2 ? [1] : []),
      ...Array.from(
        { length: endPage - startPage + 1 },
        (_, i) => startPage + i,
      ),
      ...(endPage < total - 1
        ? ["...", total]
        : endPage === total - 1
          ? [total]
          : []),
    ];
  };

  const pages = generatePages(
    paginationData.currentPage,
    paginationData.totalPages,
    siblings,
  );

  return (
    <PaginationPrimitive className="justify-end">
      <PaginationContent>
        {/* Previous Button */}
        <PaginationItem>
          <PaginationPrevious
            href={
              paginationData.currentPage > 1
                ? getPageHref(paginationData.currentPage - 1)
                : getPageHref(1)
            }
          />
        </PaginationItem>

        {/* Page Links */}
        {pages.map((page, i) => (
          <PaginationItem key={i}>
            {page === "..." ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href={getPageHref(page)}
                isActive={paginationData.currentPage === page}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        {/* Next Button */}
        <PaginationItem>
          <PaginationNext
            href={
              paginationData.currentPage < paginationData.totalPages
                ? getPageHref(paginationData.currentPage + 1)
                : getPageHref(paginationData.totalPages)
            }
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationPrimitive>
  );
}
