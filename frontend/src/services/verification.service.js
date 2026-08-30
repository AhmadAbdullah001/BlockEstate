import { api } from "./api";
export const verificationService = {
  get: (id) => api.get(`/verifications/${id}`),
};
