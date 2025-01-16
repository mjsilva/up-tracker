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

type TransactionSingleSync = {
  data: {
    userId: string;
    transactionId: string;
  };
};

export type InngestEvents = {
  "transactions/full-sync": TransactionsSync;
  "transactions/sync-next-page": TransactionsSyncNextPage;
  "transactions/partial-sync": TransactionsSync;
  "transactions/single-sync": TransactionSingleSync;
};
