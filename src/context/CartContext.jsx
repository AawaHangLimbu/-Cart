import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  fetchCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart as clearCartApi,
} from "../services/cart.service";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, isCustomer } = useAuth();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const itemCount  = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  useEffect(() => {
    if (!isAuthenticated || !isCustomer) {
      setItems([]);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const data = await fetchCart();
        setItems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, isCustomer]);

  const addItem = useCallback(async (productId, quantity = 1) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await addToCart(productId, quantity);
      setItems(updated);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateItem = useCallback(async (cartItemId, quantity) => {
    setItems((prev) =>
      prev.map((i) => (i.id === cartItemId ? { ...i, quantity } : i))
    );
    try {
      const updated = await updateCartItem(cartItemId, quantity);
      setItems(updated);
    } catch (err) {
      setError(err.message);
      const data = await fetchCart();
      setItems(data);
    }
  }, []);

  const removeItem = useCallback(async (cartItemId) => {
    setItems((prev) => prev.filter((i) => i.id !== cartItemId));
    try {
      const updated = await removeCartItem(cartItemId);
      setItems(updated);
    } catch (err) {
      setError(err.message);
      const data = await fetchCart();
      setItems(data);
    }
  }, []);

  const clearCart = useCallback(async () => {
    setItems([]);
    try {
      await clearCartApi();
    } catch (err) {
      setError(err.message);
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalPrice,
        loading,
        error,
        addItem,
        updateItem,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
};