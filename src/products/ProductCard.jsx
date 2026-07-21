// components/products/ProductCard.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const { isCustomer } = useAuth();
  const [adding, setAdding] = useState(false);
  const [added, setAdded]   = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault(); // prevent Link navigation
    setAdding(true);
    try {
      await addItem(product.id);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      // handle silently — CartContext sets error
    } finally {
      setAdding(false);
    }
  };

  const outOfStock = product.stock === 0;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
            🛒
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
        {product.category && (
          <span className="absolute top-2 left-2 bg-white/90 text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
            {product.category}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
          {product.name}
        </p>
        <p className="text-xs text-gray-400 line-clamp-2">{product.description}</p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <p className="text-base font-bold text-gray-900">
            Rs. {Number(product.price).toLocaleString()}
          </p>
          {isCustomer && (
            <button
              onClick={handleAddToCart}
              disabled={adding || outOfStock}
              className={`text-xs font-medium px-3 py-1.5 rounded-xl transition ${
                added
                  ? "bg-green-100 text-green-600"
                  : outOfStock
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {added ? "✓ Added" : adding ? "..." : "+ Cart"}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;