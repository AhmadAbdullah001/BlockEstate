import { api } from "../../services/api";
export const login = (credentials) => api.post("/auth/login", credentials);
