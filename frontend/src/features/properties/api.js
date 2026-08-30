import { api } from "../../services/api";
export const listProperties = () => api.get("/properties");
