import { inngest } from "./client";
import {
  fetchTransactions,
  fetchTransactionSingle,
  fetchTransactionsPartial,
  saveTransactionsToDB,
} from "@/lib/services/upbank";

export const initialTransactionsSync = inngest.createFunction(
  { id: "transactions-full-sync" },
  { event: "transactions/full-sync" },
  async ({ event, step }) => {
    const { userId } = event.data;
    if (!userId) throw new Error("userId is missing");

    const transactions = await fetchTransactions({ userId });
    await step.run("save-page-1", async () => {
      await saveTransactionsToDB({ transactions: transactions.data, userId });
    });

    // Enqueue next page if necessary
    if (transactions.links?.next) {
      await step.sendEvent("transactions-full-sync-next-page", {
        name: "transactions/sync-next-page",
        data: { userId, nextLink: transactions.links.next },
      });
    }
  },
);

export const initialTransactionsSyncNextPage = inngest.createFunction(
  { id: "transactions-sync-next-page" },
  { event: "transactions/sync-next-page" },
  async ({ event, step }) => {
    const { userId, nextLink } = event.data;
    if (!userId || !nextLink) throw new Error("userId or nextLink is missing");

    // Fetch next page
    const transactions = await fetchTransactions({ userId, nextLink });
    await step.run("save-next-page", async () => {
      await saveTransactionsToDB({ transactions: transactions.data, userId });
    });

    // Enqueue next page if necessary
    if (transactions.links?.next) {
      await step.sendEvent("transactions-sync-next-page", {
        name: "transactions/sync-next-page",
        data: { userId, nextLink: transactions.links.next },
      });
    }
  },
);

export const partialTransactionsSync = inngest.createFunction(
  { id: "transactions-partial-sync" },
  { event: "transactions/partial-sync" },
  async ({ event, step }) => {
    const { userId } = event.data;

    // Fetch next page
    const transactions = await fetchTransactionsPartial({ userId });
    await step.run("save-next-page", async () => {
      await saveTransactionsToDB({ transactions: transactions.data, userId });
    });

    // Enqueue next page if necessary
    if (transactions.links?.next) {
      await step.sendEvent("transactions-sync-next-page", {
        name: "transactions/sync-next-page",
        data: { userId, nextLink: transactions.links.next, partial: true },
      });
    }
  },
);

export const singleTransactionsSync = inngest.createFunction(
  { id: "transactions-single-sync" },
  { event: "transactions/single-sync" },
  async ({ event, step }) => {
    const { userId, transactionId } = event.data;

    const transactions = await fetchTransactionSingle({
      userId,
      transactionId,
    });

    await step.run("save-next-page", async () => {
      await saveTransactionsToDB({ transactions: [transactions.data], userId });
    });
  },
);

export const inngestFunctions = [
  initialTransactionsSync,
  partialTransactionsSync,
  initialTransactionsSyncNextPage,
  singleTransactionsSync,
];
