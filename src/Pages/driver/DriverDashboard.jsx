import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import api from "../../services/api";

const StatusBadge = ({ status }) => {
  const colors = {
    pending:         "bg-yellow-100 text-yellow-700",
    packed:          "bg-blue-100 text-blue-700",
    out_for_delivery:"bg-purple-100 text-purple-700",
    delivered:       "bg-green-100 text-green-700",
  };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colors[status] || "bg-gray-100 text-gray-600"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
};

const StatCard = ({ label, value, color }) => (
  <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-1">
    <p className="text-sm text-gray-500">{label}</p>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

const DriverDashboard = () => {
  const { user } = useAuth();
  const { connected } = useSocket();

  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/orders/driver/assigned");
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const active    = orders.filter((o) => o.status === "out_for_delivery");
  const pending   = orders.filter((o) => ["pending", "packed"].includes(o.status));
  const delivered = orders.filter((o) => o.status === "delivered");

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Loading...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Hey, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Driver Dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${connected ? "bg-green-400" : "bg-gray-300"}`} />
          <span className="text-sm text-gray-500">{connected ? "Online" : "Offline"}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Active"    value={active.length}    color="text-purple-600" />
        <StatCard label="Pending"   value={pending.length}   color="text-yellow-500" />
        <StatCard label="Delivered" value={delivered.length} color="text-green-600"  />
      </div>
