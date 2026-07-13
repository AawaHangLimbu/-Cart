import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

const STATUS_FLOW = ["pending", "packed", "out_for_delivery", "delivered"];

const StatusBadge = ({ status }) => {
  const colors = {
    pending:          "bg-yellow-100 text-yellow-700",
    packed:           "bg-blue-100 text-blue-700",
    out_for_delivery: "bg-purple-100 text-purple-700",
    delivered:        "bg-green-100 text-green-700",
  };
  return (
    <span className={`text-xs font-medium px-3 py-1 rounded-full ${colors[status] || "bg-gray-100 text-gray-600"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
};

const AssignedDeliveries = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError]       = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load order.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const nextStatus = order
    ? STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1]
    : null;

  const handleAdvanceStatus = async () => {
    if (!nextStatus) return;
    setUpdating(true);
    setError(null);
    try {
      const { data } = await api.patch("/orders/status", {
        orderId: order.id,
        status: nextStatus,
      });
      setOrder(data);
      // If now out for delivery, go to live tracking
      if (nextStatus === "out_for_delivery") {
        navigate(`/driver/live/${order.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Loading...
    </div>
  );

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Order not found.
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1"
      >
        ← Back
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Order #{order.id}</h1>
        <StatusBadge status={order.status} />
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {/* Status timeline */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-4">Delivery Progress</p>
        <div className="flex items-center gap-2">
          {STATUS_FLOW.map((step, i) => {
            const currentIdx = STATUS_FLOW.indexOf(order.status);
            const done    = i <= currentIdx;
            const isLast  = i === STATUS_FLOW.length - 1;
            return (
              <div key={step} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                    done ? "bg-purple-600 border-purple-600" : "bg-white border-gray-300"
                  }`} />
                  <p className={`text-[10px] text-center leading-tight ${
                    done ? "text-purple-600 font-medium" : "text-gray-400"
                  }`}>
                    {step.replace(/_/g, " ")}
                  </p>
                </div>
                {!isLast && (
                  <div className={`h-0.5 flex-1 mb-4 ${i < currentIdx ? "bg-purple-600" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery address */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Delivery Address</p>
        {order.location ? (
          <div className="space-y-1">
            {order.location.landmark && (
              <p className="text-sm text-gray-800">
                 <span className="font-medium">{order.location.landmark}</span>
              </p>
            )}
            {order.location.description && (
              <p className="text-sm text-gray-500">{order.location.description}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {order.location.latitude}, {order.location.longitude}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-400">No address provided.</p>
        )}
      </div>

      {/* Order items */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-3">Items</p>
        <div className="space-y-3">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-800">{item.product?.name}</p>
                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-medium text-gray-700">
                Rs. {item.price * item.quantity}
              </p>
            </div>
          ))}
        </div>
        <div className="border-t mt-4 pt-3 flex justify-between">
          <p className="text-sm font-semibold text-gray-700">Total</p>
          <p className="text-sm font-bold text-gray-800">Rs. {order.total_price}</p>
        </div>
      </div>

      {/* Action button */}
      {nextStatus ? (
        <button
          onClick={handleAdvanceStatus}
          disabled={updating}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-2xl py-3 text-sm transition"
        >
          {updating
            ? "Updating..."
            : nextStatus === "out_for_delivery"
            ? " Start Delivery"
            : nextStatus === "delivered"
            ? "✅Mark as Delivered"
            : `Advance to "${nextStatus.replace(/_/g, " ")}"`}
        </button>
      ) : (
        <div className="w-full bg-green-50 text-green-600 font-medium rounded-2xl py-3 text-sm text-center">
          Delivery Complete
        </div>
      )}
    </div>
  );
};

export default AssignedDeliveries;