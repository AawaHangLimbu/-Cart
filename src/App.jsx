import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { SocketProvider } from "./context/SocketContext";
import AppRouter from "./routes/AppRouter";

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <CartProvider>
          <AppRouter />
        </CartProvider>
      </SocketProvider>
    </AuthProvider>
  );
}