import { api } from "./api";
export const transactionService = { list: () => api.get("/transactions") };
