type TransactionsSync = {
  data: {
    userId: string;
  };
};

type TransactionsSyncNextPage = {
  data: {
    userId: string;
    nextLink: string;
    partial?: boolean;
  };
};

export type InngestEvents = {
  "transactions/full-sync": TransactionsSync;
  "transactions/sync-next-page": TransactionsSyncNextPage;
  "transactions/partial-sync": TransactionsSync;
};
