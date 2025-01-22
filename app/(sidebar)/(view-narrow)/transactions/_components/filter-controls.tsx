"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { startCase } from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import { FiltersData } from "@/app/(sidebar)/(view-narrow)/transactions/_components/transactions";
import { AvailableFilters, AvailableFiltersSchema } from "../types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon, XIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { DateTime } from "luxon";

type FiltersProps = { filtersData: FiltersData };

export function FilterControls({ filtersData }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeFilters, setActiveFilters] = useState<AvailableFilters>(() => {
    return AvailableFiltersSchema.parse(searchParams);
  });

  const activeFiltersDateRangeJsDate = {
    to: activeFilters?.dateTo
      ? DateTime.fromISO(activeFilters.dateTo).toJSDate()
      : undefined,
    from: activeFilters?.dateFrom
      ? DateTime.fromISO(activeFilters.dateFrom).toJSDate()
      : undefined,
  };

  function handleFilterSelect(activeFilters: AvailableFilters) {
    setActiveFilters(activeFilters);

    const params = new URLSearchParams(searchParams.toString());

    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value === "all" || !value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.replace(`?${params.toString()}`);
  }

  return (
    <div className={"flex flex-wrap gap-4"}>
      <Select
        value={activeFilters.upParentCategory || "all"}
        onValueChange={(value) => {
          const newFilters = {
            ...activeFilters,
            upParentCategory: value,
            upCategory: "all",
          };
          handleFilterSelect(newFilters);
        }}
      >
        <SelectTrigger className={"w-[300px]"}>
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {Object.keys(filtersData.categories).map((category) => (
            <SelectItem key={category} value={category}>
              {startCase(category)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={activeFilters.upCategory || "all"}
        onValueChange={(value) => {
          const newFilters = {
            ...activeFilters,
            upCategory: value,
          };
          handleFilterSelect(newFilters);
        }}
      >
        <SelectTrigger className={"w-[300px]"}>
          <SelectValue placeholder="Subcategory" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Subcategories</SelectItem>
          {activeFilters.upParentCategory !== "all" && (
            <>
              {filtersData.categories[activeFilters.upParentCategory].map(
                (category) => (
                  <SelectItem key={category} value={category}>
                    {startCase(category)}
                  </SelectItem>
                ),
              )}
            </>
          )}
        </SelectContent>
      </Select>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              (!activeFilters.dateFrom || activeFilters.dateTo) &&
                "text-muted-foreground",
            )}
          >
            <CalendarIcon />
            {activeFilters?.dateFrom ? (
              activeFilters.dateTo ? (
                <>
                  {DateTime.fromISO(activeFilters.dateFrom).toLocaleString()} -{" "}
                  {DateTime.fromISO(activeFilters.dateTo).toLocaleString()}
                </>
              ) : (
                DateTime.fromISO(activeFilters.dateFrom).toLocaleString()
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            selected={activeFiltersDateRangeJsDate}
            onSelect={(range) => {
              const newFilters = {
                ...activeFilters,
                ...(range?.to && {
                  dateTo: DateTime.fromJSDate(range.to).toISODate(),
                }),
                ...(range?.from && {
                  dateFrom: DateTime.fromJSDate(range.from).toISODate(),
                }),
              } satisfies AvailableFilters;

              handleFilterSelect(newFilters);
            }}
            numberOfMonths={2}
          />
          <Button
            variant={"secondary"}
            className={"w-full"}
            onClick={() => {
              const newFilters = {
                ...activeFilters,
                dateFrom: undefined,
                dateTo: undefined,
              } satisfies AvailableFilters;

              handleFilterSelect(newFilters);
            }}
          >
            Clear
          </Button>
        </PopoverContent>
      </Popover>
      <Button
        variant={"secondary"}
        onClick={() => {
          handleFilterSelect(AvailableFiltersSchema.parse({}));
        }}
      >
        <XIcon />
        Clear filters
      </Button>
    </div>
  );
}
