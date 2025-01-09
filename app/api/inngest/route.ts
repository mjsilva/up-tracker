import { inngest } from "@/lib/ingest/client";
import { serve } from "inngest/next";
import { inngestFunctions } from "@/lib/ingest/functions";

export const maxDuration = 60; // 60 seconds

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: inngestFunctions,
});
