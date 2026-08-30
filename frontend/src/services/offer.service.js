import { api } from "./api";
export const offerService = { list: () => api.get("/offers") };
