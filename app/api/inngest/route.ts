import { inngest } from "@/lib/ingest/client";
import {
  initialTransactionsSync,
  initialTransactionsSyncNextPage,
} from "@/lib/ingest/functions";
import { serve } from "inngest/next";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [initialTransactionsSync, initialTransactionsSyncNextPage],
});
