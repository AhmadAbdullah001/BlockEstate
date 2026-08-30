import { api } from "./api";
export const propertyService = {
  list: (params) => api.get("/properties", { params }),
  get: (id) => api.get(`/properties/${id}`),
  mine: () => api.get("/properties/mine"),
  verification: (id) => api.get(`/properties/${id}/verification`),
  create: (data) => api.post("/properties", data),
  update: (id, data) => api.patch(`/properties/${id}`, data),
  submit: (id) => api.post(`/properties/${id}/submit`),
  geocode: (data) => api.post("/properties/geocode", data),
  uploadImages: (files) => {
    const data = new FormData();
    files.forEach((file) => data.append("images", file));
    return api.post("/properties/uploads", data);
  },
};
