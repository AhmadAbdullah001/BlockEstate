import { api } from "./api";
export const messageService = { list: () => api.get("/messages") };
