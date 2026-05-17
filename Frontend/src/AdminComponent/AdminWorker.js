import { motion, AnimatePresence } from "framer-motion";
import { FaUserTie, FaPhone, FaTools, FaPlus, FaSearch, FaTimes, FaUsers, FaUserCheck, FaUserClock, FaStar, FaRegSmile, FaTrashAlt, FaEdit, FaMapMarkerAlt } from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import Footer from "../UserComponent/Footer";

const baseUrl = API_BASE_URL;

export default function AdminWorker() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    skill: "",
    location: "",
    status: "Active",
  });
  const [editForm, setEditForm] = useState({
    _id: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    skill: "",
    location: "",
    status: "Active",
  });

  const fetchWorkers = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/workers/all`);
      if (res.data.success) {
        const mappedWorkers = (res.data.workers || []).map(w => ({
          _id: w._id,
          name: w.name,
          skill: w.service,
          phone: w.phone,
          status: w.status,
          email: w.email,
          location: w.location
        }));
        setWorkers(mappedWorkers);
      }
    } catch (err) {
      console.error("Failed to fetch workers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  // Compute stats
  const totalWorkers = workers.length;
  const activeWorkers = workers.filter((w) => w.status === "Active" || w.status === "active" || w.status === "Approved" || w.status === "approved").length;
  const pendingWorkers = workers.filter((w) => w.status === "Pending" || w.status === "pending").length;

  const handleAddWorker = async () => {
    if (!form.name || !form.skill || !form.phone || !form.email || !form.password || !form.location) {
      alert("Please fill all fields!");
      return;
    }

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        service: form.skill,
        location: form.location,
        status: form.status || "Active"
      };

      const res = await axios.post(`${baseUrl}/api/workers/register`, payload);
      if (res.status === 201 || res.data.success) {
        alert("Worker added successfully!");
        fetchWorkers();
        handleCloseModal();
      }
    } catch (err) {
      console.error("Error adding worker:", err);
      alert(err.response?.data?.message || "Error registering worker on server");
    }
  };

  const handleDeleteWorker = async (id) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this worker?")) return;

    try {
      const res = await axios.delete(`${baseUrl}/api/workers/delete/${id}`);
      if (res.data.success) {
        alert("Worker deleted successfully!");
        fetchWorkers();
      }
    } catch (err) {
      console.error("Error deleting worker:", err);
      alert("Error deleting worker from server");
    }
  };

  const handleCloseModal = () => {
    setOpen(false);
    setForm({ name: "", email: "", password: "", phone: "", skill: "", location: "", status: "Active" });
  };

  const handleOpenEditModal = (worker) => {
    setEditForm({
      _id: worker._id,
      name: worker.name || "",
      email: worker.email || "",
      password: worker.password || "",
      phone: worker.phone || "",
      skill: worker.skill || "",
      location: worker.location || "",
      status: (worker.status === 'Approved' || worker.status === 'active' || worker.status === 'approved' || worker.status === 'Active') ? "Active" : (worker.status || "Active"),
    });
    setEditOpen(true);
  };

  const handleEditWorker = async () => {
    if (!editForm.name || !editForm.skill || !editForm.phone || !editForm.email || !editForm.location) {
      alert("Please fill all fields!");
      return;
    }

    try {
      const payload = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        service: editForm.skill,
        location: editForm.location,
        status: editForm.status,
      };

      if (editForm.password) {
        payload.password = editForm.password;
      }

      const res = await axios.put(`${baseUrl}/api/workers/update/${editForm._id}`, payload);
      if (res.data.success) {
        alert("Worker updated successfully!");
        fetchWorkers();
        handleCloseEditModal();
      }
    } catch (err) {
      console.error("Error updating worker:", err);
      alert(err.response?.data?.message || "Error updating worker on server");
    }
  };

  const updateWorkerStatus = async (id, newStatus) => {
    try {
      const endpoint = newStatus === "Active" ? `/api/workers/approve/${id}` : `/api/workers/reject/${id}`;
      const res = await axios.put(`${baseUrl}${endpoint}`);
      if (res.data.success) {
        fetchWorkers();
      }
    } catch (err) {
      console.error("Error updating worker status:", err);
      alert("Failed to update status");
    }
  };

  const handleCloseEditModal = () => {
    setEditOpen(false);
    setEditForm({ _id: "", name: "", email: "", password: "", phone: "", skill: "", location: "", status: "Active" });
  };

  const filteredWorkers = workers.filter(
    (worker) =>
      (worker.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (worker.skill || "").toLowerCase().includes(searchTerm.toLowerCase())
  );



  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } },
  };

  const statCardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 25 } },
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse delay-1000" />
      
      <div className="relative z-10 p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent"
            >
              Worker Hub
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-gray-500 mt-1"
            >
              Manage your workforce effortlessly
            </motion.p>
          </div>
          
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-emerald-200 transition-all duration-300"
          >
            <FaPlus className="text-sm" /> Add New Worker
          </motion.button>
        </div>

        <motion.div 
          variants={statCardVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
        >
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-white/50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <FaUsers className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Workers</p>
              <p className="text-3xl font-bold text-gray-800">{totalWorkers}</p>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-white/50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
              <FaUserCheck className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Active</p>
              <p className="text-3xl font-bold text-green-600">{activeWorkers}</p>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-white/50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
              <FaUserClock className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-3xl font-bold text-orange-600">{pendingWorkers}</p>
            </div>
          </div>
        </motion.div>

        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
            <FaStar className="text-emerald-500 text-sm" /> All Professionals
          </h2>
          <div className="relative w-full md:w-72">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/70 backdrop-blur-sm border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
            />
          </div>
        </div>

        {filteredWorkers.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-white/40 rounded-3xl backdrop-blur-sm"
          >
            <FaRegSmile className="text-5xl text-gray-300 mb-3" />
            <p className="text-gray-400 text-lg">No workers found</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="overflow-x-auto w-full bg-white/70 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-xl"
          >
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500 text-sm font-semibold bg-gray-50/50">
                  <th className="py-4 px-6">Worker Name</th>
                  <th className="py-4 px-6">Service Category</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Mobile Number</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkers.map((worker, index) => (
                  <tr
                    key={worker._id || index}
                    className="border-b border-gray-100 hover:bg-emerald-50/20 transition-colors last:border-none"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                          {(worker.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm sm:text-base">{worker.name}</p>
                          <p className="text-xs text-gray-400 font-medium">{worker.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-xs sm:text-sm">
                        <FaTools className="text-xs" /> {worker.skill}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-600 font-medium text-xs sm:text-sm flex items-center gap-1.5">
                        <FaMapMarkerAlt className="text-emerald-500 text-sm" /> {worker.location}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-gray-600 font-medium text-xs sm:text-sm flex items-center gap-1.5">
                        <FaPhone className="text-emerald-400 text-xs" /> {worker.phone}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => updateWorkerStatus(worker._id, 'Active')}
                          title="Set Active"
                          className={`text-[11px] font-bold px-3 py-1 rounded-full transition-all duration-200 border ${
                            worker.status === 'Active' || worker.status === 'active' || worker.status === 'Approved' || worker.status === 'approved'
                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                              : 'bg-white text-gray-400 border-gray-200 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          Active
                        </button>
                        <button 
                          onClick={() => updateWorkerStatus(worker._id, 'Rejected')}
                          title="Deactivate"
                          className={`text-[11px] font-bold px-3 py-1 rounded-full transition-all duration-200 border ${
                            worker.status === 'Rejected' || worker.status === 'rejected'
                              ? 'bg-red-500 text-white border-red-500 shadow-sm'
                              : 'bg-white text-gray-400 border-gray-200 hover:border-red-300 hover:text-red-600 hover:bg-red-50'
                          }`}
                        >
                          Deactive
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(worker)}
                          className="text-emerald-600 hover:text-emerald-800 p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition duration-200 shadow-sm"
                          title="Edit worker"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteWorker(worker._id)}
                          className="text-red-500 hover:text-red-700 p-2.5 rounded-xl bg-red-50 hover:bg-red-100 transition duration-200 shadow-sm"
                          title="Delete worker"
                        >
                          <FaTrashAlt size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white/95 backdrop-blur-xl rounded-3xl w-[90%] md:w-[450px] shadow-2xl border border-white/50 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                    Add New Worker
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>

                 <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                    <input
                      className="w-full border border-gray-200 p-3 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white/80"
                      placeholder="e.g., John Doe"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                    <input
                      className="w-full border border-gray-200 p-3 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white/80"
                      placeholder="e.g., john@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
                    <input
                      type="password"
                      className="w-full border border-gray-200 p-3 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white/80"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Skill / Profession</label>
                    <select
                      className="w-full border border-gray-200 p-3 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white/80 font-medium"
                      value={form.skill}
                      onChange={(e) => setForm({ ...form, skill: e.target.value })}
                    >
                      <option value="">-- Choose Service --</option>
                      <option value="AC Service"> AC Service</option>
                      <option value="Electrical Repair"> Electrical Repair</option>
                      <option value="Plumbing"> Plumbing</option>
                      <option value="Home Cleaning">Home Cleaning</option>
                      <option value="Pest Control"> Pest Control</option>
                      <option value="Carpentry"> Carpentry</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                    <input
                      className="w-full border border-gray-200 p-3 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white/80"
                      placeholder="9876543210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Location / City</label>
                    <input
                      className="w-full border border-gray-200 p-3 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white/80"
                      placeholder="e.g., Coimbatore"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                    <select
                      className="w-full border border-gray-200 p-3 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white/80"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="Active"> Accept</option>
                      <option value="Rejected"> Reject</option>
                      <option value="Pending"> Pending</option>
                    </select>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddWorker}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Add Worker
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {editOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            onClick={handleCloseEditModal}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white/95 backdrop-blur-xl rounded-3xl w-[90%] md:w-[450px] shadow-2xl border border-white/50 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                    Edit Worker Details
                  </h2>
                  <button
                    onClick={handleCloseEditModal}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                    <input
                      className="w-full border border-gray-200 p-3 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white/80"
                      placeholder="e.g., John Doe"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                    <input
                      className="w-full border border-gray-200 p-3 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white/80"
                      placeholder="e.g., john@example.com"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Password (Leave blank to keep unchanged)</label>
                    <input
                      type="password"
                      className="w-full border border-gray-200 p-3 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white/80"
                      placeholder="••••••••"
                      value={editForm.password || ""}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Skill / Profession</label>
                    <select
                      className="w-full border border-gray-200 p-3 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white/80 font-medium"
                      value={editForm.skill}
                      onChange={(e) => setEditForm({ ...editForm, skill: e.target.value })}
                    >
                      <option value="">-- Choose Service --</option>
                      <option value="AC Service"> AC Service</option>
                      <option value="Electrical Repair"> Electrical Repair</option>
                      <option value="Plumbing"> Plumbing</option>
                      <option value="Home Cleaning">Home Cleaning</option>
                      <option value="Pest Control"> Pest Control</option>
                      <option value="Carpentry"> Carpentry</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                    <input
                      className="w-full border border-gray-200 p-3 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white/80"
                      placeholder="9876543210"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Location / City</label>
                    <input
                      className="w-full border border-gray-200 p-3 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white/80"
                      placeholder="e.g., Coimbatore"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                    <select
                      className="w-full border border-gray-200 p-3 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white/80"
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    >
                      <option value="Active"> Accept</option>
                      <option value="Rejected"> Reject</option>
                      <option value="Pending"> Pending</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={handleCloseEditModal}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditWorker}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    <Footer />
    </>
  );
}