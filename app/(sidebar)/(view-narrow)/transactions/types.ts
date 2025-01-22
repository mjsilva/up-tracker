import { z } from "zod";

// Define the filter schema
export const AvailableFiltersSchema = z.object({
  upParentCategory: z.string().default("all"),
  upCategory: z.string().default("all"),
  dateFrom: z.string().nullish(),
  dateTo: z.string().nullish(),
});

// Infer TypeScript type from schema
export type AvailableFilters = z.infer<typeof AvailableFiltersSchema>;
