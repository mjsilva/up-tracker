type TransactionsInitialSync = {
  data: {
    userId: string;
  };
};

type TransactionsInitialSyncNextPage = {
  data: {
    userId: string;
    nextLink: string;
  };
};

export type InngestEvents = {
  "onboarding/transactions.sync": TransactionsInitialSync;
  "onboarding/transactions-sync-next-page": TransactionsInitialSyncNextPage;
};
