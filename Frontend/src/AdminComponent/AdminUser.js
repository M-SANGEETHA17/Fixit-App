import { motion, AnimatePresence } from "framer-motion";
import {
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaMapMarkerAlt,
  FaRegSmile,
  FaPhoneAlt,
  FaFolderOpen,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";

const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const baseUrl = isLocal
  ? "http://localhost:5005"
  : "https://fixit-app-w0dp.onrender.com";

export default function AdminUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/admin/users`);

      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId, currentStatus) => {
    const isCurrentlyActive =
      currentStatus === "Active" || currentStatus === "active";

    const newStatus = isCurrentlyActive ? "Inactive" : "Active";

    const actionLabel = isCurrentlyActive
      ? "deactivate"
      : "activate";

    if (
      !window.confirm(
        `Are you sure you want to ${actionLabel} this user?`
      )
    ) {
      return;
    }

    try {
      const res = await axios.put(
        `${baseUrl}/api/users/status/${userId}`,
        { status: newStatus }
      );

      if (res.data.success) {
        alert(`User successfully ${actionLabel}d!`);
        fetchUsers();
      }
    } catch (err) {
      console.error(`Failed to ${actionLabel} user:`, err);

      alert(
        err.response?.data?.message ||
          `Error updating user status.`
      );
    }
  };

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (u) => u.status === "Active" || u.status === "active"
  ).length;

  const inactiveUsers = users.filter(
    (u) => u.status === "Inactive" || u.status === "inactive"
  ).length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 250,
        damping: 20,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 overflow-hidden relative">
      {/* Background Blur */}
      <div className="absolute top-0 left-0 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-300/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />

      <div className="absolute bottom-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-cyan-300/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse delay-1000" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent"
            >
              User Hub
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-gray-500 mt-2 text-sm sm:text-base max-w-2xl"
            >
              Manage and monitor all registered users,
              activity status and service information.
            </motion.p>
          </div>
        </div>

        {/* STAT CARDS */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8"
        >
          {/* TOTAL USERS */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -3, scale: 1.02 }}
            className="bg-white/80 backdrop-blur-md rounded-3xl p-5 shadow-lg border border-white/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <FaUsers className="text-2xl" />
                </div>

                <div>
                  <p className="text-xs uppercase text-gray-400 font-bold">
                    Total Users
                  </p>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
                    {loading ? "..." : totalUsers}
                  </h2>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ACTIVE USERS */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -3, scale: 1.02 }}
            className="bg-white/80 backdrop-blur-md rounded-3xl p-5 shadow-lg border border-white/50"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-green-600">
                <FaUserCheck className="text-2xl" />
              </div>

              <div>
                <p className="text-xs uppercase text-gray-400 font-bold">
                  Active Users
                </p>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-green-600">
                  {loading ? "..." : activeUsers}
                </h2>
              </div>
            </div>
          </motion.div>

          {/* INACTIVE USERS */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -3, scale: 1.02 }}
            className="bg-white/80 backdrop-blur-md rounded-3xl p-5 shadow-lg border border-white/50 sm:col-span-2 xl:col-span-1"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
                <FaUserTimes className="text-2xl" />
              </div>

              <div>
                <p className="text-xs uppercase text-gray-400 font-bold">
                  Inactive Users
                </p>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-red-600">
                  {loading ? "..." : inactiveUsers}
                </h2>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* TITLE */}
        <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-gray-700 flex items-center gap-2">
              <FaFolderOpen className="text-emerald-500" />
              All Registered Customers
            </h2>

            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">
              {users.length}
            </span>
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white/60 backdrop-blur-md rounded-3xl border border-white/50">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>

            <p className="mt-4 text-sm font-semibold text-gray-500">
              Loading users...
            </p>
          </div>
        ) : users.length === 0 ? (
          /* EMPTY */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-white/60 rounded-3xl border border-white/50"
          >
            <FaRegSmile className="text-6xl text-gray-300 mb-4" />

            <p className="text-lg font-bold text-gray-500">
              No users available
            </p>
          </motion.div>
        ) : (
          <>
            {/* MOBILE CARD VIEW */}
            <div className="grid grid-cols-1 md:hidden gap-5">
              <AnimatePresence>
                {users.map((user, index) => (
                  <motion.div
                    key={user._id || index}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0 }}
                    className="bg-white/80 backdrop-blur-md rounded-3xl p-5 shadow-lg border border-gray-100"
                  >
                    {/* TOP */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xl font-bold">
                        {(user.name || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-800 truncate">
                          {user.name}
                        </h3>

                        <p className="text-xs text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* DETAILS */}
                    <div className="space-y-3">
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-400 text-sm">
                          Category
                        </span>

                        <span className="text-emerald-700 font-semibold text-sm text-right">
                          {user.serviceCategory ||
                            "Home Cleaning"}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-gray-400 text-sm">
                          Location
                        </span>

                        <span className="text-gray-700 font-medium text-sm text-right">
                          {user.address ||
                            "No Location Listed"}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-gray-400 text-sm">
                          Phone
                        </span>

                        <span className="text-gray-700 font-medium text-sm">
                          {user.phone || "N/A"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center gap-3">
                        <span className="text-gray-400 text-sm">
                          Status
                        </span>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            user.status === "Active" ||
                            user.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.status || "Active"}
                        </span>
                      </div>
                    </div>

                    {/* BUTTON */}
                    <button
                      onClick={() =>
                        handleToggleStatus(
                          user._id,
                          user.status
                        )
                      }
                      className={`w-full mt-5 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
                        user.status === "Active" ||
                        user.status === "active"
                          ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100"
                      }`}
                    >
                      {user.status === "Active" ||
                      user.status === "active"
                        ? "Deactivate"
                        : "Activate"}
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* DESKTOP TABLE */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="hidden md:block overflow-x-auto bg-white/80 backdrop-blur-md rounded-3xl border border-gray-200 shadow-xl"
            >
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="bg-gray-50 border-b text-left text-xs uppercase text-gray-500 tracking-wider">
                    <th className="py-5 px-6">Username</th>
                    <th className="py-5 px-6">Category</th>
                    <th className="py-5 px-6">Location</th>
                    <th className="py-5 px-6">Phone</th>
                    <th className="py-5 px-6">Status</th>
                    <th className="py-5 px-6 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <AnimatePresence>
                    {users.map((user, index) => (
                      <motion.tr
                        key={user._id || index}
                        variants={itemVariants}
                        className="border-b border-gray-100 hover:bg-emerald-50/30 transition-all"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
                              {(user.name || "U")
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="font-bold text-gray-800">
                                {user.name}
                              </p>

                              <p className="text-xs text-gray-400">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                            {user.serviceCategory ||
                              "Home Cleaning"}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-sm text-gray-600 font-medium">
                          <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-emerald-500" />

                            {user.address ||
                              "No Location Listed"}
                          </div>
                        </td>

                        <td className="py-4 px-6 text-sm text-gray-600 font-medium">
                          <div className="flex items-center gap-2">
                            <FaPhoneAlt className="text-emerald-500" />

                            {user.phone || "N/A"}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              user.status === "Active" ||
                              user.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {user.status || "Active"}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() =>
                              handleToggleStatus(
                                user._id,
                                user.status
                              )
                            }
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                              user.status === "Active" ||
                              user.status === "active"
                                ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100"
                            }`}
                          >
                            {user.status === "Active" ||
                            user.status === "active"
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </motion.div>
          </>
        )}

        {/* FOOTER */}
        <div className="mt-10 text-center text-xs sm:text-sm text-gray-400 font-semibold border-t border-gray-200 pt-5">
          FixIt User Hub • Real-time Operations Console
        </div>
      </div>
    </div>
  );
}