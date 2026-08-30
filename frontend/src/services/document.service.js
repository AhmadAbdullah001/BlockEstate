import { api } from "./api";
export const documentService = { list: () => api.get("/documents") };
