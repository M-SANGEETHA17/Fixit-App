import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUser,
  FaBolt,
  FaFan,
  FaWrench,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaSpinner,
  FaCheckDouble,
  FaExternalLinkAlt, 
} from "react-icons/fa";
import Footer from "../UserComponent/Footer";
import { API_BASE_URL } from "../config";

export default function WorkerRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  // Show toast for 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Get worker from localStorage with validation
  const getWorker = useCallback(() => {
    const workerJson = localStorage.getItem("worker");
    if (!workerJson) {
      console.warn("No worker found in localStorage");
      return null;
    }
    try {
      const worker = JSON.parse(workerJson);
      if (!worker._id) {
        console.error("Worker object missing _id field", worker);
        return null;
      }
      return worker;
    } catch (err) {
      console.error("Failed to parse worker from localStorage", err);
      return null;
    }
  }, []);

  // Fetch requests assigned to this worker
  const fetchRequests = useCallback(async () => {
    const worker = getWorker();
    if (!worker || !worker._id) {
      setError("No valid worker logged in. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log(`Fetching requests for worker ID: ${worker._id}`);

      const res = await axios.get(
        `${API_BASE_URL}/api/bookings/worker/${worker._id}`
      );

      console.log("API response:", res.data);

      // Handle different possible response structures
      let bookings = [];
      if (res.data.requests) bookings = res.data.requests;
      else if (res.data.bookings) bookings = res.data.bookings;
      else if (Array.isArray(res.data)) bookings = res.data;
      else bookings = [];

      setRequests(bookings);
      if (bookings.length === 0) {
        // console.log("No requests found for this worker");
      }
    } catch (err) {
      // console.error("Fetch error:", err.response || err.message);
      setError(err.response?.data?.message || "Failed to load requests. Check backend.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [getWorker]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Helper to send WhatsApp message (opens in new tab, with fallback)
  const sendWhatsAppMessage = (phoneNumber, customerName, messageText) => {
    if (!phoneNumber) {
      console.warn("No phone number provided, skipping WhatsApp");
      return false;
    }

    let cleanPhone = phoneNumber.replace(/\s+/g, "");
    if (!cleanPhone.startsWith("+") && !cleanPhone.startsWith("91")) {
      cleanPhone = `91${cleanPhone}`;
    }
    cleanPhone = cleanPhone.replace(/^\+/, "");

    const message = encodeURIComponent(messageText);
    const url = `https://wa.me/${cleanPhone}?text=${message}`;

    try {
      window.open(url, "_blank");
      return true;
    } catch (err) {
      console.error("WhatsApp popup blocked:", err);
      return false;
    }
  };

  // NEW: Generate Google Maps link from address string
  const getMapLink = (address, geo) => {
    if (geo && geo.lat && geo.lng) {
      const coords = `${geo.lat},${geo.lng}`;
      console.log(`🗺️ [Map Render] Worker Requests -> Prioritizing Exact GPS: ${coords}`);
      return `https://www.google.com/maps?q=${encodeURIComponent(coords)}`;
    }

    if (!address) return "#";
    const coordPattern = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;
    if (coordPattern.test(address.trim())) {
      console.log(`🗺️ [Map Render] Worker Requests -> Fallback Coords Pattern: ${address.trim()}`);
      return `https://www.google.com/maps?q=${encodeURIComponent(address)}`;
    } else {
      console.log(`🗺️ [Map Render] Worker Requests -> Text Search Address: ${address}`);
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    }
  };

  const displayLocationText = (address, geo) => {
    if (geo && geo.lat && geo.lng) {
      return "View Map Location";
    }
    if (!address) return "Location not provided";
    const coordPattern = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;
    if (coordPattern.test(address.trim())) {
      return "View Map Location";
    }
    // Return the actual address text if it's text
    return address;
  };

  // Accept request
  const acceptRequest = async (bookingId, customerName, customerPhone, serviceType, address, bookingDate, bookingTime) => {
    if (!bookingId) return;
    setActionLoadingId(bookingId);
    try {
      console.log(`Accepting booking ${bookingId}`);
      const res = await axios.put(
        `${API_BASE_URL}/api/bookings/accept/${bookingId}`
      );

      if (res.data.success) {
        // Update local state
        setRequests((prev) =>
          prev.map((req) =>
            req._id === bookingId ? { ...req, status: "Accepted" } : req
          )
        );
        setToast({ type: "success", message: `Accepted request from ${customerName}` });

        // Send WhatsApp notification to customer
        const displayAddress = address && /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(address.trim()) ? "your map location" : (address || "your location");
        const dateStr = bookingDate ? new Date(bookingDate).toLocaleDateString() : "the requested date";
        const timeStr = bookingTime || "the requested time";
        const message = `Hi ${customerName}, your ${serviceType} request has been ACCEPTED. We will be there at ${displayAddress} on ${dateStr} at ${timeStr}. - FIXIT`;
        sendWhatsAppMessage(customerPhone, customerName, message);
      } else {
        throw new Error(res.data.message || "Accept failed");
      }
    } catch (err) {
      console.error("Accept error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Accept failed";
      setToast({ type: "error", message: errorMsg });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reject request
  const rejectRequest = async (bookingId, customerName, customerPhone, serviceType) => {
    if (!bookingId) return;
    setActionLoadingId(bookingId);
    try {
      console.log(`Rejecting booking ${bookingId}`);
      const res = await axios.put(
        `${API_BASE_URL}/api/bookings/reject/${bookingId}`
      );

      if (res.data.success) {
        setRequests((prev) =>
          prev.map((req) =>
            req._id === bookingId ? { ...req, status: "Rejected" } : req
          )
        );
        setToast({ type: "info", message: `Rejected ${customerName}'s request` });

        const message = `Hi ${customerName}, sorry your ${serviceType} request has been REJECTED. Please try another worker. - FIXIT`;
        sendWhatsAppMessage(customerPhone, customerName, message);
      } else {
        throw new Error(res.data.message || "Reject failed");
      }
    } catch (err) {
      console.error("Reject error:", err);
      setToast({ type: "error", message: err.response?.data?.message || "Reject failed" });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Complete request
  const completeRequest = async (bookingId, customerName, customerPhone, serviceType) => {
    if (!bookingId) return;
    setActionLoadingId(bookingId);
    try {
      console.log(`Completing booking ${bookingId}`);
      const res = await axios.put(
        `${API_BASE_URL}/api/bookings/complete/${bookingId}`
      );

      if (res.data.success) {
        setRequests((prev) =>
          prev.map((req) =>
            req._id === bookingId ? { ...req, status: "Completed" } : req
          )
        );
        setToast({ type: "success", message: `Marked ${customerName}'s service as completed` });

        const message = `Hi ${customerName}, your ${serviceType} service has been COMPLETED. Thank you for choosing FIXIT!`;
        sendWhatsAppMessage(customerPhone, customerName, message);
      } else {
        throw new Error(res.data.message || "Complete failed");
      }
    } catch (err) {
      console.error("Complete error:", err);
      setToast({ type: "error", message: err.response?.data?.message || "Complete failed" });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Helper for service icon
  const getServiceIcon = (service) => {
    if (!service) return <FaUser />;
    const s = service.toLowerCase();
    if (s.includes("ac") || s.includes("air")) return <FaFan className="text-blue-500" />;
    if (s.includes("electrical") || s.includes("electric")) return <FaBolt className="text-yellow-600" />;
    if (s.includes("plumbing")) return <FaWrench className="text-green-600" />;
    return <FaUser className="text-gray-500" />;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      Pending: { icon: <FaClock />, color: "bg-yellow-100 text-yellow-800" },
      Assigned: { icon: <FaClock />, color: "bg-yellow-100 text-yellow-800" },
      Accepted: { icon: <FaCheckCircle />, color: "bg-green-100 text-green-800" },
      Rejected: { icon: <FaTimesCircle />, color: "bg-red-100 text-red-800" },
      Completed: { icon: <FaCheckDouble />, color: "bg-blue-100 text-blue-800" },
    };
    const s = statusMap[status] || statusMap.Pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${s.color}`}>
        {s.icon}
        {status}
      </span>
    );
  };

  const worker = getWorker();
  if (!worker && !loading) {
    return (
      <div className="p-10 text-center">
        <div className="text-red-600 mb-4">Please login as worker</div>
        <button
          onClick={() => navigate("/worker-login")}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FaUser className="text-blue-600" />
            Worker Request
          </h1>
          {worker && (
            <div className="text-sm text-gray-600">
              Welcome, {worker.name || worker.email}
            </div>
          )}
        </div>

        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all ${
              toast.type === "success"
                ? "bg-green-500"
                : toast.type === "error"
                ? "bg-red-500"
                : "bg-blue-500"
            } text-white`}
          >
            {toast.message}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-4xl text-blue-500" />
            <span className="ml-3 text-gray-600">Loading requests...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchRequests}
              className="mt-2 text-sm text-red-700 underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Requests List */}
        {!loading && !error && (
          <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Scheduled For</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Contact & Address</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <FaUser className="text-4xl text-gray-300 mx-auto mb-3" />
                      <p className="text-lg font-medium text-gray-600">No service requests found.</p>
                      <p className="text-sm text-gray-400 mt-1">When customers book you, their requests will appear here.</p>
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-3 text-lg">
                          {getServiceIcon(req.serviceType)}
                          <span className="font-medium text-gray-900">{req.serviceType || "Service"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="text-base font-medium text-gray-900">{req.name || "Customer"}</div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-800">
                          {req.bookingDate ? new Date(req.bookingDate).toLocaleDateString() : "Not specified"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {req.bookingTime ? req.bookingTime : ""}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-base text-gray-900 flex items-center gap-2 mb-2">
                          <FaPhoneAlt className="text-gray-400 text-sm" /> {req.phone}
                        </div>
                        {/* MODIFIED: Address becomes a clickable Google Maps link */}
                        <div className="text-base text-gray-600 flex items-start gap-2">
                          <FaMapMarkerAlt className="text-gray-400 text-sm mt-1" />
                          <a
                            href={getMapLink(req.location || req.address, req.geoLocation)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[300px] inline-flex items-center gap-1"
                            title={req.location || req.address}
                          >
                            <span className="truncate">{displayLocationText(req.location || req.address, req.geoLocation)}</span>
                            <FaExternalLinkAlt className="text-xs flex-shrink-0" />
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(req.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(req.status === "Pending" || req.status === "Assigned") && (
                          <div className="flex gap-3">
                            <button
                              onClick={() => acceptRequest(req._id, req.name, req.phone, req.serviceType, req.location || req.address, req.bookingDate, req.bookingTime)}
                              disabled={actionLoadingId === req._id}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-medium rounded transition"
                            >
                              {actionLoadingId === req._id ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                              Accept
                            </button>
                            <button
                              onClick={() => rejectRequest(req._id, req.name, req.phone, req.serviceType)}
                              disabled={actionLoadingId === req._id}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-medium rounded transition"
                            >
                              {actionLoadingId === req._id ? <FaSpinner className="animate-spin" /> : <FaTimesCircle />}
                              Reject
                            </button>
                          </div>
                        )}
                        {req.status === "Accepted" && (
                          <button
                            onClick={() => completeRequest(req._id, req.name, req.phone, req.serviceType)}
                            disabled={actionLoadingId === req._id}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded transition"
                          >
                            {actionLoadingId === req._id ? <FaSpinner className="animate-spin" /> : <FaCheckDouble />}
                            Complete
                          </button>
                        )}
                        {(req.status === "Completed" || req.status === "Rejected") && (
                          <span className="text-xs text-gray-500 italic">No actions available</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}