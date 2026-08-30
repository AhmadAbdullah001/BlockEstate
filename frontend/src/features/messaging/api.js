import { api } from "../../services/api";
export const listConversations = () => api.get("/messages");
