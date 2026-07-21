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

