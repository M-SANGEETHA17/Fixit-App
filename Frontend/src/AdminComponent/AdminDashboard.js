import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  FaUsers,
  FaClipboardList,
  FaRupeeSign,
  FaChartLine,
  FaBoxOpen,
  FaStar,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import Footer from "../UserComponent/Footer";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    revenue: 0,
    completedBookings: 0,
    pendingBookings: 0,
    activeWorkers: 0,
    busyWorkers: 0,
    totalWorkers: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/stats`);
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentBookings(res.data.recentBookings || []);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);


  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { scale: 1.03, transition: { duration: 0.2, type: "spring", stiffness: 300 } },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
    hover: { scale: 1.02, transition: { duration: 0.2 } },
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6 md:p-8">
      {/* Floating Background Blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 -left-20 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 -right-20 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header with date & welcome */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
              FixIt Admin
            </h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <FaCalendarAlt className="text-green-500" />
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm text-gray-600">Live Dashboard</span>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {/* Total Users Card */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/50"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/30 to-emerald-400/30 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider">Total Users</p>
                  <p className="text-4xl font-extrabold text-green-700 mt-2">{stats.users}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-100 text-green-600 group-hover:scale-110 transition-transform">
                  <FaUsers size={28} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className="flex items-center text-green-600"><FaArrowUp size={12} /> +8%</span>
                <span className="text-gray-400">from last month</span>
              </div>
              <div className="mt-3 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </motion.div>

          {/* Orders Card */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            whileHover="hover"
            className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/50"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider">Orders</p>
                  <p className="text-4xl font-extrabold text-blue-700 mt-2">{stats.orders}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                  <FaClipboardList size={28} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className="flex items-center text-green-600"><FaArrowUp size={12} /> +12%</span>
                <span className="text-gray-400">vs last week</span>
              </div>
              <div className="mt-3 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </motion.div>

         {/* Total Workers Card */}
<motion.div
  variants={cardVariants}
  initial="hidden"
  animate="visible"
  transition={{ delay: 0.2 }}
  whileHover="hover"
  className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/50"
>
  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

  <div className="relative p-6">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500 uppercase tracking-wider">
          Total Workers
        </p>
        <p className="text-4xl font-extrabold text-purple-700 mt-2">
          {stats.totalWorkers}
        </p>
      </div>

      <div className="p-3 rounded-xl bg-purple-100 text-purple-600 group-hover:scale-110 transition-transform">
        <FaUsers size={28} />
      </div>
    </div>

    <div className="mt-4 flex items-center gap-2 text-sm">
      <span className="flex items-center text-green-600">
        <FaArrowUp size={12} /> +5%
      </span>
      <span className="text-gray-400">active workforce</span>
    </div>

    <div className="mt-3 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full w-4/5 bg-purple-500 rounded-full"></div>
    </div>
  </div>
</motion.div>
</div>

        {/* Additional Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-white/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <FaChartLine className="text-green-500" /> Platform Metrics
              </h3>
              <span className="text-xs text-gray-400">Live DB Metrics</span>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Booking completion rate</span>
                  <span className="font-semibold">
                    {stats.orders > 0 ? Math.round((stats.completedBookings / stats.orders) * 100) : 0}%
                  </span>
                </div>
                <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${stats.orders > 0 ? (stats.completedBookings / stats.orders) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Active workforce utilization</span>
                  <span className="font-semibold">
                    {stats.totalWorkers > 0 ? Math.round((stats.activeWorkers / stats.totalWorkers) * 100) : 0}%
                  </span>
                </div>
                <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${stats.totalWorkers > 0 ? (stats.activeWorkers / stats.totalWorkers) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Pending bookings queue</span>
                  <span className="font-semibold">
                    {stats.orders > 0 ? Math.round((stats.pendingBookings / stats.orders) * 100) : 0}%
                  </span>
                </div>
                <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${stats.orders > 0 ? (stats.pendingBookings / stats.orders) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-white/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <FaStar className="text-yellow-500" /> Recent Booking Activity
              </h3>
              <FaBoxOpen className="text-gray-400" />
            </div>
            <ul className="space-y-3 text-sm max-h-[160px] overflow-y-auto pr-1">
              {recentBookings.length === 0 ? (
                <li className="text-gray-400 text-center py-4">No recent bookings</li>
              ) : (
                recentBookings.map((booking) => (
                  <li key={booking._id} className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-gray-800">{booking.name}</p>
                      <p className="text-[11px] text-gray-500">{booking.serviceType} • {booking.location}</p>
                    </div>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                      booking.status === "Completed" ? "bg-green-100 text-green-700" :
                      booking.status === "Accepted" ? "bg-blue-100 text-blue-700" :
                      booking.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"
                    }`}>
                      {booking.status}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        </div>

        {/* Image Gallery / Analytics with captions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            className="relative overflow-hidden rounded-2xl shadow-lg group"
          >
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
              className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              alt="team"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <p className="text-white font-semibold">Team Collaboration</p>
            </div>
          </motion.div>

          <motion.div
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            whileHover="hover"
            className="relative overflow-hidden rounded-2xl shadow-lg group"
          >
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71"
              className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              alt="analytics"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <p className="text-white font-semibold flex items-center gap-2"><FaChartLine /> Performance Metrics</p>
            </div>
          </motion.div>

          <motion.div
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            whileHover="hover"
            className="relative overflow-hidden rounded-2xl shadow-lg group"
          >
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f"
              className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              alt="growth"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <p className="text-white font-semibold flex items-center gap-2"><FaArrowUp /> Business Growth</p>
            </div>
          </motion.div>
        </div>

                {/* Footer note */}
        <div className="mt-8 text-center text-xs text-gray-400 border-t border-gray-200 pt-6">
          Admin Dashboard • Real-time insights • Data refreshes automatically
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}