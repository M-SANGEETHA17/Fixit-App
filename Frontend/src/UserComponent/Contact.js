import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaStar,
  FaSmile,
  FaRegStar,
} from "react-icons/fa";

import { API_BASE_URL } from "../config";
import Footer from "./Footer";

const baseUrl = API_BASE_URL;

export default function Feedback() {
  const location = useLocation();

  const [form, setForm] = useState({
    name: "",
    email: "",
    rating: 5,
    feedback: "",
  });

  const [allWorkers, setAllWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [showQueryPopup, setShowQueryPopup] = useState(false);

  const [queryForm, setQueryForm] = useState({
    userName: "",
    workerName: "",
    serviceCategory: "",
    query: "",
  });

  useEffect(() => {
    loadWorkers();
  }, []);

  useEffect(() => {
    if (location.state?.openQuery) {
      setShowQueryPopup(true);

      const stored = localStorage.getItem("selectedWorker");

      if (stored) {
        const parsed = JSON.parse(stored);

        setQueryForm((prev) => ({
          ...prev,
          workerName: parsed.name || "",
          serviceCategory: parsed.service || "",
        }));
      }
    }
  }, [location]);

  const loadWorkers = async () => {
    try {
      setLoadingWorkers(true);

      const res = await fetch(`${baseUrl}/api/workers/all`);
      const data = await res.json();

      if (data.success) {
        const activeList = (data.workers || []).filter((w) =>
          ["active", "approved"].includes(w.status?.toLowerCase())
        );

        setAllWorkers(activeList);

        const stored = localStorage.getItem("selectedWorker");

        if (stored) {
          const parsed = JSON.parse(stored);

          const matched = activeList.find(
            (w) => w.email === parsed.email || w._id === parsed._id
          );

          if (matched) setSelectedWorker(matched);
          else setSelectedWorker(parsed);
        }
      }
    } catch (err) {
      console.error("Failed to fetch workers:", err);
    } finally {
      setLoadingWorkers(false);
    }
  };

  const handleWorkerChange = (workerId) => {
    const worker = allWorkers.find((w) => w._id === workerId);

    if (worker) {
      setSelectedWorker(worker);
      localStorage.setItem("selectedWorker", JSON.stringify(worker));
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRating = (rate) => {
    setForm({
      ...form,
      rating: rate,
    });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.feedback) {
      alert("Please fill all fields");
      return;
    }

    if (!selectedWorker || !selectedWorker.email) {
      alert("Please select an expert");
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          workerEmail: selectedWorker.email,
          workerName: selectedWorker.name,
          customerName: form.name,
          rating: form.rating,
          comment: form.feedback,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitted(true);

        setTimeout(() => {
          setSubmitted(false);

          setForm({
            name: "",
            email: "",
            rating: 5,
            feedback: "",
          });
        }, 3000);
      } else {
        alert("Feedback submission failed");
      }
    } catch (error) {
      console.log(error);
      alert("Server error");
    }
  };

  const handleQuerySubmit = async () => {
    if (
      !queryForm.userName ||
      !queryForm.workerName ||
      !queryForm.serviceCategory ||
      !queryForm.query
    ) {
      alert("Please fill all query fields");
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/queries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(queryForm),
      });

      const data = await res.json();

      if (data.success) {
        alert("Query Raised Successfully!");

        setShowQueryPopup(false);

        setQueryForm({
          userName: "",
          workerName: "",
          serviceCategory: "",
          query: "",
        });
      } else {
        alert(data.message || "Failed to submit query");
      }
    } catch (error) {
      console.error("Error submitting query:", error);
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100 flex flex-col">

      {/* MAIN CONTENT */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">

        <div className="w-full max-w-6xl bg-white rounded-[30px] overflow-hidden shadow-2xl grid lg:grid-cols-2">

          {/* LEFT SIDE */}
          <div
            className="relative min-h-[400px] lg:min-h-full p-10 flex flex-col justify-center text-white"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1581579185169-1a9f6c7b9b6b?auto=format&fit=crop&w=1200&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-green-900/75"></div>

            <div className="relative z-10">

              <div className="mb-6">
                <h1 className="text-5xl font-extrabold leading-tight">
                  FIX<span className="text-green-300">IT</span>
                </h1>

                <p className="mt-3 text-green-100 text-sm leading-6 max-w-md">
                  We value your experience. Share your honest feedback and help
                  us improve our service quality for everyone.
                </p>
              </div>

              <div className="space-y-5 text-sm">

                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-full">
                    <FaPhone />
                  </div>

                  <span>+91 98765 43210</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-full">
                    <FaEnvelope />
                  </div>

                  <span>feedback@fixit.com</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-full">
                    <FaMapMarkerAlt />
                  </div>

                  <span>Madurai, Tamil Nadu</span>
                </div>

              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="p-6 md:p-10">

            <div className="mb-6">
              <h2 className="text-3xl font-bold text-green-700">
                Share Your Feedback
              </h2>

              <p className="text-gray-500 text-sm mt-2">
                Your feedback helps us build better services.
              </p>
            </div>

            {/* WORKER SELECT */}
            <div className="mb-6 bg-green-50 border border-green-100 rounded-2xl p-5">

              <label className="block text-sm font-semibold text-green-700 mb-3">
                Select Expert
              </label>

              {loadingWorkers ? (
                <div className="bg-white border rounded-xl p-4 text-sm text-gray-500">
                  Loading experts...
                </div>
              ) : (
                <select
                  value={selectedWorker?._id || ""}
                  onChange={(e) => handleWorkerChange(e.target.value)}
                  className="w-full border border-green-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="" disabled>
                    -- Select an Expert --
                  </option>

                  {allWorkers.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.name} ({w.service})
                    </option>
                  ))}
                </select>
              )}

              {selectedWorker && (
                <div className="mt-3 text-xs bg-white border border-green-100 rounded-lg p-3 text-green-700">
                  ⭐ Reviewing :
                  <span className="font-bold ml-1">
                    {selectedWorker.name}
                  </span>
                </div>
              )}
            </div>

            {submitted ? (
              <div className="bg-green-100 border border-green-200 rounded-2xl p-8 text-center">

                <FaSmile className="text-5xl text-green-600 mx-auto mb-4" />

                <h3 className="text-2xl font-bold text-green-700 mb-2">
                  Thank You!
                </h3>

                <p className="text-green-600">
                  Your feedback has been submitted successfully.
                </p>

              </div>
            ) : (
              <>
                {/* NAME */}
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl p-4 mb-4 outline-none focus:ring-2 focus:ring-green-400"
                />

                {/* EMAIL */}
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl p-4 mb-4 outline-none focus:ring-2 focus:ring-green-400"
                />

                {/* RATING */}
                <div className="mb-5">

                  <label className="block font-semibold text-gray-700 mb-3">
                    Rating
                  </label>

                  <div className="flex gap-3">

                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRating(star)}
                        className="text-3xl transition hover:scale-110"
                      >
                        {star <= form.rating ? (
                          <FaStar className="text-yellow-400" />
                        ) : (
                          <FaRegStar className="text-gray-300" />
                        )}
                      </button>
                    ))}

                  </div>
                </div>

                {/* FEEDBACK */}
                <textarea
                  name="feedback"
                  placeholder="Write your feedback..."
                  value={form.feedback}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl p-4 h-32 resize-none mb-5 outline-none focus:ring-2 focus:ring-green-400"
                />

                {/* BUTTON */}
                <button
                  onClick={handleSubmit}
                  className="w-full bg-green-600 hover:bg-green-700 transition-all duration-300 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-green-200"
                >
                  <FaPaperPlane />
                  Submit Feedback
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* QUERY POPUP */}
      {showQueryPopup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 animate-fadeIn">

            <h2 className="text-3xl font-bold text-green-700 text-center mb-6">
              Raise a Query
            </h2>

            <div className="space-y-4">

              <input
                type="text"
                placeholder="User Name"
                value={queryForm.userName}
                onChange={(e) =>
                  setQueryForm({
                    ...queryForm,
                    userName: e.target.value,
                  })
                }
                className="w-full border rounded-xl p-4 outline-none focus:ring-2 focus:ring-green-400"
              />

              <input
                type="text"
                placeholder="Worker Name"
                value={queryForm.workerName}
                onChange={(e) =>
                  setQueryForm({
                    ...queryForm,
                    workerName: e.target.value,
                  })
                }
                className="w-full border rounded-xl p-4 outline-none focus:ring-2 focus:ring-green-400"
              />

              <input
                type="text"
                placeholder="Service Category"
                value={queryForm.serviceCategory}
                onChange={(e) =>
                  setQueryForm({
                    ...queryForm,
                    serviceCategory: e.target.value,
                  })
                }
                className="w-full border rounded-xl p-4 outline-none focus:ring-2 focus:ring-green-400"
              />

              <textarea
                placeholder="Enter your query..."
                value={queryForm.query}
                onChange={(e) =>
                  setQueryForm({
                    ...queryForm,
                    query: e.target.value,
                  })
                }
                className="w-full border rounded-xl p-4 h-28 resize-none outline-none focus:ring-2 focus:ring-green-400"
              />

              <div className="flex gap-3 pt-2">

                <button
                  onClick={() => setShowQueryPopup(false)}
                  className="w-1/2 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 font-semibold"
                >
                  Cancel
                </button>

                <button
                  onClick={handleQuerySubmit}
                  className="w-1/2 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold"
                >
                  Submit
                </button>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="w-full mt-auto">
        <Footer />
      </div>
    </div>
  );
}