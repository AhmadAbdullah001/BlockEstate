import { api } from "./api";

export const adminService = {
  overview: () => api.get("/admin/overview"),
  properties: (params) => api.get("/admin/properties", { params }),
  property: (propertyId) => api.get(`/admin/properties/${propertyId}`),
  verifications: (params) => api.get("/admin/verifications", { params }),
  updateVerification: (propertyId, data) => api.patch(`/admin/properties/${propertyId}/verification`, data),
  agents: () => api.get("/admin/agents"),
  assignAgent: (propertyId, agentId) => api.post(`/admin/properties/${propertyId}/assign-agent`, { agentId }),
};
