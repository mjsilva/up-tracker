import { z } from "zod";

export const AvailableFiltersSchema = z.object({
  upParentCategory: z.string().default("all"),
  upCategory: z.string().default("all"),
  dateFrom: z.string().nullish().default(null),
  dateTo: z.string().nullish().default(null),
});

export type AvailableFilters = z.infer<typeof AvailableFiltersSchema>;
