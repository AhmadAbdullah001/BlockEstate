import { api } from "./api";
export const lawyerService = { list: () => api.get("/lawyers") };
