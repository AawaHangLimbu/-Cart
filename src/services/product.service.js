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
