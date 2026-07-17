import api from "./api";

export const getProducts = async (params = {}) => {
  // params: { category, search, page, limit }
  const { data } = await api.get("/products", { params });
  return data; // { products, total, page, totalPages }
};

export const getProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data; // { product }
};

export const createProduct = async (formData) => {
  const { data } = await api.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateProduct = async (id, formData) => {
  const { data } = await api.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};