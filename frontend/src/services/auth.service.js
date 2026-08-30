import { api } from "./api";
export const signup = (data) => api.post("/auth/signup", data);
export const verifyEmail = (data) => api.post("/auth/verify-email", data);
export const resendOTP = (data) => api.post("/auth/resend-otp", data);
export const login = (data) => api.post("/auth/login", data);
export const logout = () => api.post("/auth/logout");
export const getCurrentUser = () => api.get("/auth/me");
export const getAdminOverview = () => api.get("/admin/overview");
export const getAdminProperties = () => api.get("/admin/properties");
export const getAdminProperty = (propertyId) => api.get(`/admin/properties/${propertyId}`);
export const getAdminVerifications = () => api.get("/admin/verifications");
export const getAdminAgents = () => api.get("/admin/agents");
export const updateAdminVerification = (propertyId, data) => api.patch(`/admin/properties/${propertyId}/verification`, data);
export const assignAdminAgent = (propertyId, agentId) => api.post(`/admin/properties/${propertyId}/assign-agent`, { agentId });
export const getAgentDashboard = () => api.get("/agents/dashboard");
export const getAgentProperties = () => api.get("/agents/properties");
export const getAgentAssignment = (verificationId) => api.get(`/agents/assignments/${verificationId}`);
export const updateAgentAssignment = (verificationId, data) => api.patch(`/agents/assignments/${verificationId}`, data);
export const uploadAgentEvidence = (verificationId, file, type = "AGENT_EVIDENCE") => {
  const data = new FormData();
  data.append("file", file);
  data.append("type", type);
  return api.post(`/agents/assignments/${verificationId}/evidence`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const getAgents = (params = {}) => api.get("/agents", { params });
export const getAgentById = (agentId) => api.get(`/agents/${agentId}`);
export const submitAgentApplication = (data) => {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  return api.post("/agents/apply", data, isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined);
};
export const getPendingAgentApplications = () => api.get("/admin/agents/applications");
export const approveAgentApplication = (agentId) => api.post(`/admin/agents/${agentId}/approve`);
export const rejectAgentApplication = (agentId, reason) => api.post(`/admin/agents/${agentId}/reject`, { reason });
export const updateLocation = (data) => api.post("/auth/location", data);
export const getGoogleLoginUrl = () => `${api.defaults.baseURL}/auth/google`;
