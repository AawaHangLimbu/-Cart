import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useSocket } from "../../context/SocketContext";
import api from "../../services/api";

// Fix leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const driverIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Re-centers map when position changes
const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
};

const LiveTracking = () => {
  const { id: orderId } = useParams();
  const navigate = useNavigate();
  const { emitLocation, joinOrderRoom } = useSocket();

  const [position, setPosition]       = useState(null); // [lat, lng]
  const [order, setOrder]             = useState(null);
  const [tracking, setTracking]       = useState(false);
  const [error, setError]             = useState(null);
  const [completing, setCompleting]   = useState(false);
  const watchIdRef = useRef(null);

  // Load order details
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/orders/${orderId}`);
        setOrder(data);
      } catch {
        setError("Failed to load order.");
      }
    })();
  }, [orderId]);

  // Join socket room for this order
  useEffect(() => {
    joinOrderRoom(orderId);
  }, [orderId, joinOrderRoom]);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setTracking(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const pos = [coords.latitude, coords.longitude];
        setPosition(pos);
        emitLocation(coords.latitude, coords.longitude);
      },
      (err) => {
        setError(`Location error: ${err.message}`);
        setTracking(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
  };

  // Cleanup on unmount
  useEffect(() => () => stopTracking(), []);

  const handleCompleteDelivery = async () => {
    setCompleting(true);
    try {
      await api.patch("/orders/status", {
        orderId: order.id,
        status: "delivered",
      });
      stopTracking();
      navigate("/driver");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete delivery.");
    } finally {
      setCompleting(false);
    }
  };

  // Default center — Kathmandu
  const defaultCenter = [27.7172, 85.3240];
  const mapCenter = position || defaultCenter;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>
        <div className="text-center">
          <p className="font-semibold text-gray-800">Live Tracking</p>
          <p className="text-xs text-gray-400">Order #{orderId}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${tracking ? "bg-green-400 animate-pulse" : "bg-gray-300"}`} />
          <span className="text-xs text-gray-500">{tracking ? "Live" : "Paused"}</span>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={mapCenter}
          zoom={15}
          style={{ height: "100%", minHeight: "400px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {position && (
            <Marker position={position} icon={driverIcon}>
              <Popup>You are here</Popup>
            </Marker>
          )}
          {order?.location && (
            <Marker position={[order.location.latitude, order.location.longitude]}>
              <Popup>
                <p className="font-medium">{order.location.landmark || "Customer"}</p>
                {order.location.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{order.location.description}</p>
                )}
              </Popup>
            </Marker>
          )}
          <RecenterMap position={position} />
        </MapContainer>
      </div>

      {/* Controls */}
      <div className="bg-white px-6 py-5 space-y-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        {/* Delivery info */}
        {order?.location?.landmark && (
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-400">Delivering to</p>
            <p className="text-sm font-medium text-gray-800 mt-0.5">
              📍 {order.location.landmark}
            </p>
            {order.location.description && (
              <p className="text-xs text-gray-500 mt-0.5">{order.location.description}</p>
            )}
          </div>
        )}

        {!tracking ? (
          <button
            onClick={startTracking}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-2xl py-3 text-sm transition"
          >
            🚀 Start Sharing Location
          </button>
        ) : (
          <button
            onClick={stopTracking}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-2xl py-3 text-sm transition"
          >
            ⏸ Pause Location Sharing
          </button>
        )}

        <button
          onClick={handleCompleteDelivery}
          disabled={completing}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium rounded-2xl py-3 text-sm transition"
        >
          {completing ? "Completing..." : "✅ Mark as Delivered"}
        </button>
      </div>
    </div>
  );
};

export default LiveTracking;