// pages/customer/ProductDetails.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../../services/product.service";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isCustomer } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding]   = useState(false);
  const [added, setAdded]     = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        setError(err.response?.data?.message || "Product not found.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addItem(product.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      // CartContext handles error state
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate("/cart");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Loading...
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center text-gray-400">
        <p className="text-4xl mb-3">😕</p>
        <p className="text-sm">{error || "Product not found."}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-blue-500 text-sm hover:underline"
        >
          Go back
        </button>
      </div>
    </div>
  );

  const outOfStock = product.stock === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1"
        >
          ← Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden md:flex">
          {/* Image */}
          <div className="md:w-1/2 aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-6xl text-gray-200">🛒</span>
            )}
          </div>

          {/* Details */}
          <div className="md:w-1/2 p-6 flex flex-col gap-4">
            {product.category && (
              <span className="text-xs font-medium text-blue-500 bg-blue-50 px-2.5 py-1 rounded-full w-fit">
                {product.category}
              </span>
            )}

            <h1 className="text-xl font-bold text-gray-800 leading-snug">
              {product.name}
            </h1>

            <p className="text-2xl font-bold text-gray-900">
              Rs. {Number(product.price).toLocaleString()}
            </p>

            <p className="text-sm text-gray-500 leading-relaxed">
              {product.description}
            </p>

            {/* Stock */}
            <p className={`text-sm font-medium ${outOfStock ? "text-red-500" : "text-green-600"}`}>
              {outOfStock ? "Out of Stock" : `${product.stock} in stock`}
            </p>

            {/* Quantity selector */}
            {isCustomer && !outOfStock && (
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-600">Quantity:</p>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 text-lg leading-none"
                  >
                    −
                  </button>
                  <span className="px-4 py-1.5 text-sm font-medium border-x border-gray-200">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 text-lg leading-none"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            {isCustomer && (
              <div className="flex flex-col gap-2 mt-2">
                <button
                  onClick={handleBuyNow}
                  disabled={adding || outOfStock}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-xl py-2.5 text-sm transition"
                >
