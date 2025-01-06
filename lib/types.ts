export type FormActionFnReturnType<T = undefined> = Promise<{
  isSuccess: boolean;
  data?: T;
  validationErrors?: { [key: string]: string[] | string };
  backendErrors?: string[] | string;
}>;

export type PaginationData = {
  currentPage: number;
  totalPages: number;
  nextPage: number | null;
};
