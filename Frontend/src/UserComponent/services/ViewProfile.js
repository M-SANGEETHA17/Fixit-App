import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import {
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaTools,
  FaBriefcase,
  FaStar,
  FaCheckCircle,
  FaEnvelope,
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function ViewProfile() {

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedTasks, setCompletedTasks] = useState(0);

  // Feedback Form States
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [fbUserName, setFbUserName] = useState("");
  const [fbMessage, setFbMessage] = useState("");
  const [fbStars, setFbStars] = useState(5);
  const [fbImage, setFbImage] = useState("");
  const [submittingFb, setSubmittingFb] = useState(false);

  useEffect(() => {
    fetchWorker();
  }, []);

  const fetchWorker = async () => {
    try {
      const selectedWorker = JSON.parse(
        localStorage.getItem("selectedWorker")
      );

      if (!selectedWorker || !selectedWorker._id) {
        setLoading(false);
        return;
      }

      // 🔥 Fetch real worker data from backend API
      const res = await axios.get(`${API_BASE_URL}/api/profile/${selectedWorker._id}`);

      if (res.data && res.data.success) {
        setWorker(res.data.worker);
      } else {
        setWorker(selectedWorker);
      }

      // 🔥 Fetch actual completed bookings/jobs count
      try {
        const bookingRes = await axios.get(`${API_BASE_URL}/api/bookings/worker/${selectedWorker._id}`);
        if (bookingRes.data && bookingRes.data.success && Array.isArray(bookingRes.data.requests)) {
          const count = bookingRes.data.requests.filter(r => r.status === "Completed").length;
          setCompletedTasks(count);
        }
      } catch (e) {
        console.log("Failed to fetch booking count:", e);
      }

      setLoading(false);

    } catch (err) {
      console.log("Error fetching worker:", err);
      const selectedWorker = JSON.parse(
        localStorage.getItem("selectedWorker")
      );
      if (selectedWorker) {
        setWorker(selectedWorker);
      }
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFbImage(reader.result); // Store as Base64 string
    };
    reader.readAsDataURL(file);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!fbUserName.trim() || !fbMessage.trim()) {
      alert("Please fill out your name and feedback message.");
      return;
    }

    setSubmittingFb(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/profile/${worker._id}/feedback`, {
        userName: fbUserName,
        message: fbMessage,
        stars: fbStars,
        image: fbImage
      });

      if (res.data && res.data.success) {
        setWorker(res.data.worker); // Refresh worker data (includes new feedback/stars)
        setShowFeedbackModal(false);
        setFbUserName("");
        setFbMessage("");
        setFbStars(5);
        setFbImage("");
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setSubmittingFb(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center text-2xl font-bold text-green-600">
        Loading...
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="h-screen flex justify-center items-center text-2xl font-bold text-red-500">
        Worker Not Found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-200 p-6">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden"
      >

        {/* COVER IMAGE */}
        <div className="relative">
          <img
            src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg"
            alt=""
            className="w-full h-64 object-cover"
          />

          {/* PROFILE IMAGE */}
          <div className="absolute -bottom-16 left-10">
            <div className="w-32 h-32 rounded-full bg-white border-[6px] border-green-500 shadow-xl flex items-center justify-center overflow-hidden">
              {worker.profileImage ? (
                <img src={worker.profileImage} alt={worker.name} className="w-full h-full object-cover" />
              ) : (
                <FaUser className="text-5xl text-green-600" />
              )}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="pt-20 px-8 pb-10">

          {/* TOP SECTION */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-4xl font-bold text-gray-800">
                  {worker.name}
                </h1>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${
                  worker.isOnline === true 
                    ? "bg-green-50 text-green-600 border-green-200" 
                    : "bg-red-50 text-red-500 border-red-200"
                }`}>
                  {worker.isOnline === true ? "🟢 Online" : "🔴 Offline"}
                </span>
              </div>

              <p className="text-green-600 text-lg font-semibold mt-1">
                {worker.service}
              </p>

              <div className="flex items-center gap-2 mt-3 text-gray-600">
                <FaMapMarkerAlt />
                <span>{worker.location}</span>
              </div>
            </div>

            {/* RATING */}
            <div className="bg-green-50 px-6 py-4 rounded-2xl shadow-md">
              <div className="flex items-center gap-2 text-yellow-500 text-2xl font-bold">
                <FaStar />
                {worker.rating || "0.0"}
              </div>

              <p className="text-gray-600 text-sm mt-1">
                {worker.totalReviews || "0"} Reviews
              </p>
            </div>

          </div>

          {/* INFO CARDS */}
          <div className="grid md:grid-cols-3 gap-5 mt-10">

            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg"
            >
              <FaCheckCircle className="text-3xl mb-3" />
              <h2 className="text-3xl font-bold">{completedTasks}</h2>
              <p className="mt-2">Tasks Completed</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-white border border-green-100 p-6 rounded-2xl shadow-lg"
            >
              <FaBriefcase className="text-3xl text-green-600 mb-3" />
              <h2 className="text-2xl font-bold text-gray-800">
                {worker.experience || "5 Years"}
              </h2>
              <p className="text-gray-500 mt-2">Experience</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-white border border-green-100 p-6 rounded-2xl shadow-lg"
            >
              <FaPhone className="text-3xl text-green-600 mb-3" />
              <h2 className="text-xl font-bold text-gray-800">
                {worker.phone}
              </h2>
              <p className="text-gray-500 mt-2">Contact Number</p>
            </motion.div>

          </div>

          {/* ABOUT */}
          <div className="mt-10 bg-green-50 p-6 rounded-2xl shadow-md">

            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              About Worker
            </h2>

            <p className="text-gray-600 leading-7">
              {worker.about || "Experienced and professional worker with excellent customer satisfaction. Provides high-quality service and completes tasks on time with perfection."}
            </p>

          </div>

          {/* FEEDBACK SECTION */}
          <div className="mt-10">

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Customer Feedback
              </h2>

              <button
                onClick={() => setShowFeedbackModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl shadow-md transition duration-200 active:scale-95"
              >
                Give Feedback
              </button>
            </div>

            <div className="space-y-5 mt-6">
              {worker.feedbacks && worker.feedbacks.length > 0 ? (
                worker.feedbacks.map((fb, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white border border-green-100 p-5 rounded-2xl shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                          <FaUser className="text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">
                            {fb.userName || "Customer"}
                          </h3>
                          <div className="flex text-yellow-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <FaStar key={i} className={i < (fb.stars || 5) ? "text-yellow-500" : "text-gray-300"} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <FaEnvelope className="text-green-600 text-xl" />
                    </div>
                    <p className="text-gray-600 mt-4 leading-7">
                      {fb.message}
                    </p>
                    {fb.image && (
                      <div className="mt-4 max-w-md rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm">
                        <img src={fb.image} alt="Feedback Attachment" className="w-full max-h-64 object-contain" />
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 border border-dashed border-gray-200 rounded-2xl bg-white font-medium">
                  No customer reviews or feedback yet.
                </div>
              )}
            </div>

          </div>

        </div>
      </motion.div>
      {/* FEEDBACK MODAL POPUP */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-auto"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-extrabold tracking-tight">Write a Review</h3>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="bg-white/20 hover:bg-white/30 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold transition duration-200 text-lg"
              >
                &times;
              </button>
            </div>

      
            <form onSubmit={handleFeedbackSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-gray-700 font-bold text-sm mb-2">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Name.."
                  value={fbUserName}
                  onChange={(e) => setFbUserName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold text-sm mb-2">Star Rating</label>
                <div className="flex gap-1.5 text-3xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      onClick={() => setFbStars(star)}
                      className={`cursor-pointer transition duration-150 active:scale-90 ${star <= fbStars ? "text-yellow-400" : "text-gray-200"
                        }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold text-sm mb-2">Your Feedback</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Tell others about your experience..."
                  value={fbMessage}
                  onChange={(e) => setFbMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold text-sm mb-2">Add Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer transition"
                />

                {fbImage && (
                  <div className="mt-3 relative inline-block rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm h-24 w-24 group">
                    <img src={fbImage} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFbImage("")}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold transition duration-200"
                    >
                      &times;
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submittingFb}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3.5 rounded-xl font-black tracking-wide shadow-lg hover:shadow-xl transition duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {submittingFb ? "Submitting Review..." : "Submit Review"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}