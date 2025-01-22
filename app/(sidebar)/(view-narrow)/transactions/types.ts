import { z } from "zod";

// Define the filter schema
export const AvailableFiltersSchema = z.object({
  upParentCategory: z.string().default("all"),
  upCategory: z.string().default("all"),
});

// Infer TypeScript type from schema
export type AvailableFilters = z.infer<typeof AvailableFiltersSchema>;
