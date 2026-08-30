import { api } from "../../services/api";
export const getVerification = (id) => api.get(`/verifications/${id}`);
