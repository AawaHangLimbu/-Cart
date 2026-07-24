// pages/customer/ProductListing.jsx
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../../services/product.service";
import ProductGrid from "../../components/products/ProductGrid";
import CategoryFilter from "../../components/products/CategoryFilter";

const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const category = searchParams.get("category") || "";
  const search   = searchParams.get("search")   || "";
  const page     = parseInt(searchParams.get("page") || "1");

  const setParam = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== "page") next.delete("page"); // reset page on filter change
      return next;
    });
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts({ category, search, page, limit: 12 });
      setProducts(data.products);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [category, search, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Search bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search products..."
            defaultValue={search}
            onChange={(e) => setParam("search", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
