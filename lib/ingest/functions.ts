import { inngest } from "./client";
import { fetchTransactions, saveTransactionsToDB } from "@/lib/services/upbank";

export const initialTransactionsSync = inngest.createFunction(
  { id: "onboarding-transactions-sync" },
  { event: "onboarding/transactions.sync" },
  async ({ event, step }) => {
    const { userId } = event.data;
    if (!userId) throw new Error("userId is missing");

    const transactions = await fetchTransactions({ userId });
    await step.run("save-page-1", async () => {
      await saveTransactionsToDB({ transactions: transactions.data, userId });
    });

    // Enqueue next page if necessary
    if (transactions.links.next) {
      await step.sendEvent("onboarding-transactions-sync-next-page", {
        name: "onboarding/transactions-sync-next-page",
        data: { userId, nextLink: transactions.links.next },
      });
    }
  },
);

export const initialTransactionsSyncNextPage = inngest.createFunction(
  { id: "onboarding-transactions-sync-next-page" },
  { event: "onboarding/transactions-sync-next-page" },
  async ({ event, step }) => {
    const { userId, nextLink } = event.data;
    if (!userId || !nextLink) throw new Error("userId or nextLink is missing");

    // Fetch next page
    const transactions = await fetchTransactions({ userId, nextLink });
    await step.run("save-next-page", async () => {
      await saveTransactionsToDB({ transactions: transactions.data, userId });
    });

    // Enqueue next page if necessary
    if (transactions.links.next) {
      await step.sendEvent("onboarding-transactions-sync-next-page", {
        name: "onboarding/transactions-sync-next-page",
        data: { userId, nextLink: transactions.links.next },
      });
    }
  },
);
