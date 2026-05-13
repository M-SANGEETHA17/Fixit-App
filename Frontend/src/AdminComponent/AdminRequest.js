import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaCheck, 
  FaTimes, 
  FaClipboardList, 
  FaHardHat, 
  FaCalendarAlt,
  FaSpinner,
  FaUserCheck,
  FaUserTimes
} from "react-icons/fa";

export default function AdminRequests() {
  const [workers, setWorkers] = useState([]);     // All workers (pending + approved + rejected)
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState("workers");
  const [loadingActions, setLoadingActions] = useState({});

  // ✅ NEW: Fetch ALL workers (not just pending)
  const fetchAllWorkers = async () => {
    try {
      // 👉 You need to create this backend endpoint: GET /api/workers/all
      // It should return all workers regardless of status.
      const res = await axios.get("https://fixit-app-w0dp.onrender.com/api/workers/all");
      setWorkers(res.data.workers || []);
    } catch (err) {
      console.error("Failed to fetch workers", err);
      // Fallback: if "/all" doesn't exist, use pending only and keep existing workers
      // (but then approved workers won't appear after page refresh)
      const pendingRes = await axios.get("https://fixit-app-w0dp.onrender.com/api/workers/pending");
      setWorkers(prev => {
        const merged = [...prev];
        for (const pending of pendingRes.data.workers || []) {
          const index = merged.findIndex(w => w._id === pending._id);
          if (index >= 0) merged[index] = pending;
          else merged.push(pending);
        }
        return merged;
      });
    }
  };

  // Fetch all bookings (keep as is)
  const fetchBookings = async () => {
    try {
      const res = await axios.get("https://fixit-app-w0dp.onrender.com/api/bookings");
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.log(err);
      setBookings([]);
    }
  };

  useEffect(() => {
    fetchAllWorkers();
    fetchBookings();

    // Auto-refresh every 5 seconds (silent, no popup)
    const interval = setInterval(() => {
      fetchAllWorkers();
      fetchBookings();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Approve worker - stays in list (status changes to "Approved")
  const approveWorker = async (id) => {
    if (loadingActions[`worker_${id}`]) return;
    setLoadingActions(prev => ({ ...prev, [`worker_${id}`]: 'approve' }));

    // Optimistic update
    const originalWorkers = [...workers];
    setWorkers(prev =>
      prev.map(w =>
        w._id === id ? { ...w, status: "Approved", _optimistic: true } : w
      )
    );

    try {
      await axios.put(`https://fixit-app-w0dp.onrender.com/api/workers/approve/${id}`);
      // ✅ Refresh from backend – but because we use /all, the worker remains
      await fetchAllWorkers();
    } catch (err) {
      console.error(err);
      setWorkers(originalWorkers); // revert on error
    } finally {
      setLoadingActions(prev => {
        const newState = { ...prev };
        delete newState[`worker_${id}`];
        return newState;
      });
    }
  };

  // Reject worker - stays in list with status "Rejected"
  const rejectWorker = async (id) => {
    if (loadingActions[`worker_${id}`]) return;
    setLoadingActions(prev => ({ ...prev, [`worker_${id}`]: 'reject' }));
    const originalWorkers = [...workers];
    setWorkers(prev =>
      prev.map(w =>
        w._id === id ? { ...w, status: "Rejected", _optimistic: true } : w
      )
    );

    try {
      await axios.put(`https://fixit-app-w0dp.onrender.com/api/workers/reject/${id}`);
      await fetchAllWorkers();
    } catch (err) {
      console.error(err);
      setWorkers(originalWorkers);
    } finally {
      setLoadingActions(prev => {
        const newState = { ...prev };
        delete newState[`worker_${id}`];
        return newState;
      });
    }
  };

  // Accept booking (unchanged, but bookings also won't disappear if you change to fetchAllBookings)
  const acceptBooking = async (id) => {
    if (loadingActions[`booking_${id}`]) return;
    setLoadingActions(prev => ({ ...prev, [`booking_${id}`]: 'accept' }));
    const originalBookings = [...bookings];
    setBookings(prev =>
      prev.map(b =>
        b._id === id ? { ...b, status: "Accepted", _optimistic: true } : b
      )
    );

    try {
      await axios.put(`https://fixit-app-w0dp.onrender.com/api/bookings/accept/${id}`);
      await fetchBookings();
    } catch (err) {
      console.error(err);
      setBookings(originalBookings);
    } finally {
      setLoadingActions(prev => {
        const newState = { ...prev };
        delete newState[`booking_${id}`];
        return newState;
      });
    }
  };

  // Reject booking
  const rejectBooking = async (id) => {
    if (loadingActions[`booking_${id}`]) return;
    setLoadingActions(prev => ({ ...prev, [`booking_${id}`]: 'reject' }));
    const originalBookings = [...bookings];
    setBookings(prev =>
      prev.map(b =>
        b._id === id ? { ...b, status: "Rejected", _optimistic: true } : b
      )
    );

    try {
      await axios.put(`https://fixit-app-w0dp.onrender.com/api/bookings/reject/${id}`);
      await fetchBookings();
    } catch (err) {
      console.error(err);
      setBookings(originalBookings);
    } finally {
      setLoadingActions(prev => {
        const newState = { ...prev };
        delete newState[`booking_${id}`];
        return newState;
      });
    }
  };

  // Count pending items for badges
  const pendingWorkersCount = workers.filter(w => w.status === "Pending").length;
  const pendingBookingsCount = bookings.filter(b => b.status === "Pending").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 md:p-8 font-sans">
      {/* ... same background decorations ... */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-3 rounded-2xl shadow-lg">
              <FaClipboardList className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-500 mt-1">Manage workers & booking requests</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm border border-white/50">
              <div className="flex items-center gap-2 text-emerald-600">
                <FaHardHat />
                <span className="font-semibold">{pendingWorkersCount}</span>
                <span className="text-sm text-gray-500">Pending Workers</span>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm border border-white/50">
              <div className="flex items-center gap-2 text-cyan-600">
                <FaCalendarAlt />
                <span className="font-semibold">{pendingBookingsCount}</span>
                <span className="text-sm text-gray-500">Pending Bookings</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs (unchanged) */}
        <div className="flex gap-3 mb-6 bg-white/40 backdrop-blur-sm p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setTab("workers")}
            className={`relative px-6 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
              tab === "workers"
                ? "text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md"
                : "text-gray-600 hover:bg-white/50"
            }`}
          >
            <FaHardHat className="text-sm" />
            Workers
            {pendingWorkersCount > 0 && tab !== "workers" && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingWorkersCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("bookings")}
            className={`relative px-6 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
              tab === "bookings"
                ? "text-white bg-gradient-to-r from-cyan-500 to-blue-500 shadow-md"
                : "text-gray-600 hover:bg-white/50"
            }`}
          >
            <FaCalendarAlt className="text-sm" />
            Bookings
            {pendingBookingsCount > 0 && tab !== "bookings" && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingBookingsCount}
              </span>
            )}
          </button>
        </div>

        {/* Main Table Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
              {tab === "workers" ? (
                <><FaHardHat className="text-emerald-500" /> Worker Registration Requests</>
              ) : (
                <><FaCalendarAlt className="text-cyan-500" /> Booking Requests</>
              )}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Name</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">
                    {tab === "workers" ? "Service" : "Service Type"}
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Location</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>

              <tbody>
                <AnimatePresence mode="wait">
                  {tab === "workers" && (
                    <>
                      {workers.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-12 text-center">
                            <div className="flex flex-col items-center gap-3 text-gray-400">
                              <FaHardHat className="text-5xl opacity-50" />
                              <p className="text-lg">No worker requests</p>
                              <p className="text-sm">All caught up! ✨</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        workers.map((worker, idx) => (
                          <motion.tr
                            key={worker._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ backgroundColor: "#f0fdf4" }}
                            className="border-b border-gray-100 group transition-colors"
                          >
                            <td className="p-4 font-medium text-gray-800">{worker.name}</td>
                            <td className="p-4">
                              <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm">
                                {worker.service}
                              </span>
                            </td>
                            <td className="p-4 text-gray-600">{worker.location}</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
                                ${worker.status === "Approved" ? "bg-green-100 text-green-700" : 
                                  worker.status === "Rejected" ? "bg-red-100 text-red-700" : 
                                  "bg-amber-100 text-amber-700"}`}>
                                {worker.status === "Approved" && <FaUserCheck className="text-xs" />}
                                {worker.status === "Rejected" && <FaUserTimes className="text-xs" />}
                                {worker.status || "Pending"}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex justify-center gap-3">
                                {/* Disable buttons if not pending */}
                                <button
                                  onClick={() => approveWorker(worker._id)}
                                  disabled={worker.status !== "Pending" || loadingActions[`worker_${worker._id}`]}
                                  className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300
                                    ${worker.status !== "Pending" 
                                      ? "bg-gray-300 cursor-not-allowed opacity-50" 
                                      : loadingActions[`worker_${worker._id}`] === 'approve' 
                                        ? "bg-gray-400 cursor-not-allowed" 
                                        : "bg-gradient-to-r from-emerald-500 to-green-500 hover:shadow-lg hover:scale-105"}`}
                                >
                                  {loadingActions[`worker_${worker._id}`] === 'approve' ? (
                                    <FaSpinner className="animate-spin text-white" />
                                  ) : (
                                    <FaCheck className="text-white text-sm" />
                                  )}
                                  <span className="text-white text-sm font-medium">Accept</span>
                                </button>
                                <button
                                  onClick={() => rejectWorker(worker._id)}
                                  disabled={worker.status !== "Pending" || loadingActions[`worker_${worker._id}`]}
                                  className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300
                                    ${worker.status !== "Pending" 
                                      ? "bg-gray-300 cursor-not-allowed opacity-50" 
                                      : loadingActions[`worker_${worker._id}`] === 'reject' 
                                        ? "bg-gray-400 cursor-not-allowed" 
                                        : "bg-gradient-to-r from-rose-500 to-red-500 hover:shadow-lg hover:scale-105"}`}
                                >
                                  {loadingActions[`worker_${worker._id}`] === 'reject' ? (
                                    <FaSpinner className="animate-spin text-white" />
                                  ) : (
                                    <FaTimes className="text-white text-sm" />
                                  )}
                                  <span className="text-white text-sm font-medium">Reject</span>
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </>
                  )}

                  {tab === "bookings" && (
                    // ... booking table remains same, but you can also make bookings stay later
                    <>
                      {bookings.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-12 text-center">
                            <div className="flex flex-col items-center gap-3 text-gray-400">
                              <FaCalendarAlt className="text-5xl opacity-50" />
                              <p className="text-lg">No booking requests</p>
                              <p className="text-sm">Bookings will appear here ✨</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        bookings.map((booking, idx) => (
                          <motion.tr
                            key={booking._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ backgroundColor: "#eff6ff" }}
                            className="border-b border-gray-100 group transition-colors"
                          >
                            <td className="p-4 font-medium text-gray-800">{booking.name}</td>
                            <td className="p-4">
                              <span className="inline-block px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-sm">
                                {booking.serviceType}
                              </span>
                            </td>
<td className="p-4 text-gray-600">
  <a
    href={`https://www.google.com/maps?q=${booking.location}`}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 inline-block"
  >
     Open Map
  </a>
</td>                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
                                ${booking.status === "Accepted" ? "bg-green-100 text-green-700" : 
                                  booking.status === "Rejected" ? "bg-red-100 text-red-700" : 
                                  "bg-amber-100 text-amber-700"}`}>
                                {booking.status === "Accepted" && <FaUserCheck className="text-xs" />}
                                {booking.status === "Rejected" && <FaUserTimes className="text-xs" />}
                                {booking.status || "Pending"}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex justify-center gap-3">
                                <button
                                  onClick={() => acceptBooking(booking._id)}
                                  disabled={booking.status !== "Pending" || loadingActions[`booking_${booking._id}`]}
                                  className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300
                                    ${booking.status !== "Pending" 
                                      ? "bg-gray-300 cursor-not-allowed opacity-50" 
                                      : loadingActions[`booking_${booking._id}`] === 'accept' 
                                        ? "bg-gray-400 cursor-not-allowed" 
                                        : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg hover:scale-105"}`}
                                >
                                  {loadingActions[`booking_${booking._id}`] === 'accept' ? (
                                    <FaSpinner className="animate-spin text-white" />
                                  ) : (
                                    <FaCheck className="text-white text-sm" />
                                  )}
                                  <span className="text-white text-sm font-medium">Accept</span>
                                </button>
                                <button
                                  onClick={() => rejectBooking(booking._id)}
                                  disabled={booking.status !== "Pending" || loadingActions[`booking_${booking._id}`]}
                                  className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300
                                    ${booking.status !== "Pending" 
                                      ? "bg-gray-300 cursor-not-allowed opacity-50" 
                                      : loadingActions[`booking_${booking._id}`] === 'reject' 
                                        ? "bg-gray-400 cursor-not-allowed" 
                                        : "bg-gradient-to-r from-rose-500 to-red-500 hover:shadow-lg hover:scale-105"}`}
                                >
                                  {loadingActions[`booking_${booking._id}`] === 'reject' ? (
                                    <FaSpinner className="animate-spin text-white" />
                                  ) : (
                                    <FaTimes className="text-white text-sm" />
                                  )}
                                  <span className="text-white text-sm font-medium">Reject</span>
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}