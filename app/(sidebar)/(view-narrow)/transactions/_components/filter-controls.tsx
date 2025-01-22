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

type FiltersProps = { filtersData: FiltersData };

export function FilterControls({ filtersData }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeFilters, setActiveFilters] = useState<AvailableFilters>(() => {
    return AvailableFiltersSchema.parse(searchParams);
  });

  function handleFilterSelect(activeFilters: AvailableFilters) {
    setActiveFilters(activeFilters);

    const params = new URLSearchParams(searchParams.toString());

    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.replace(`?${params.toString()}`);
  }

  return (
    <div className={"flex gap-4"}>
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
        <SelectTrigger>
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
        <SelectTrigger>
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
    </div>
  );
}
