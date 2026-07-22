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

