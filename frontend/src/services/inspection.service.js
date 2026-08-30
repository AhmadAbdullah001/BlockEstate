import { api } from "./api";
export const inspectionService = { list: () => api.get("/inspections") };
