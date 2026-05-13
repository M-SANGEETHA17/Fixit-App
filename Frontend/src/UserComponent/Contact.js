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

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const baseUrl = isLocal ? "http://localhost:5005" : "https://fixit-app-w0dp.onrender.com";

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
        // filter only active
        const activeList = (data.workers || []).filter(w => 
          ["active", "approved"].includes(w.status?.toLowerCase())
        );
        setAllWorkers(activeList);

        // Initialize current selection
        const stored = localStorage.getItem("selectedWorker");
        if (stored) {
          const parsed = JSON.parse(stored);
          // find actual object in fresh list just in case
          const matched = activeList.find(w => w.email === parsed.email || w._id === parsed._id);
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
    const worker = allWorkers.find(w => w._id === workerId);
    if (worker) {
      setSelectedWorker(worker);
      localStorage.setItem("selectedWorker", JSON.stringify(worker));
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRating = (rate) => {
    setForm({ ...form, rating: rate });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.feedback) {
      alert("Please fill all fields");
      return;
    }

    try {
      if (!selectedWorker || !selectedWorker.email) {
        alert("Please select an expert to review.");
        return;
      }

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
      alert("Server error, failed to submit query.");
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl grid md:grid-cols-2 overflow-hidden">
        <div
          className="relative text-white p-8 flex flex-col justify-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1581579185169-1a9f6c7b9b6b?auto=format&fit=crop&w=1200&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-green-800/70"></div>

          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">
              FIX<span className="text-green-300">IT</span> Feedback
            </h1>

            <p className="text-sm mb-6 opacity-90">
              Your opinion helps us serve you better
            </p>

            <div className="space-y-4 text-sm">
              <p className="flex items-center gap-2">
                <FaPhone /> +91 98765 43210
              </p>

              <p className="flex items-center gap-2">
                <FaEnvelope /> feedback@fixit.com
              </p>

              <p className="flex items-center gap-2">
                <FaMapMarkerAlt /> Madurai, Tamil Nadu
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-green-700 mb-4">
            Share Your Feedback
          </h2>

          {/* Live Selection Dropdown */}
          <div className="mb-6 bg-emerald-50/80 border border-emerald-100 p-4 rounded-xl">
            <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
              Target Expert
            </label>
            <div className="relative">
              {loadingWorkers ? (
                <div className="p-3 text-sm text-gray-500 italic bg-white border rounded-lg">Loading specialists...</div>
              ) : (
                <select
                  className="w-full p-3 border border-emerald-200 rounded-lg shadow-sm focus:ring-2 focus:ring-green-300 focus:border-green-500 outline-none bg-white font-medium text-gray-800"
                  value={selectedWorker?._id || ""}
                  onChange={(e) => handleWorkerChange(e.target.value)}
                >
                  <option value="" disabled>-- Select an Expert --</option>
                  {allWorkers.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.name} ({w.service})
                    </option>
                  ))}
                </select>
              )}
            </div>
            {selectedWorker && (
              <p className="text-[11px] text-emerald-600 mt-2 italic flex items-center gap-1">
                 ⭐ Currently rating: <strong>{selectedWorker.name}</strong> ({selectedWorker.email})
              </p>
            )}
          </div>

          {submitted ? (
            <div className="bg-green-100 text-green-700 p-4 rounded-lg text-center">
              <FaSmile className="inline text-3xl mb-2" />
              <p>Thank you for your feedback!</p>
            </div>
          ) : (
            <>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your Name"
                className="w-full p-3 border rounded-lg mb-3"
              />

              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Your Email"
                className="w-full p-3 border rounded-lg mb-3"
              />

              <div className="mb-3">
                <label className="block text-gray-700 mb-1">
                  Rating
                </label>

                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRating(star)}
                      className="text-2xl"
                    >
                      {star <= form.rating ? (
                        <FaStar className="text-yellow-500" />
                      ) : (
                        <FaRegStar className="text-gray-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                name="feedback"
                value={form.feedback}
                onChange={handleChange}
                placeholder="Your Feedback / Suggestions"
                className="w-full p-3 border rounded-lg mb-4 h-28"
              />

              <button
                onClick={handleSubmit}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <FaPaperPlane />
                Submit Feedback
              </button>

            </>
          )}
        </div>
      </div>

      {showQueryPopup && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">

      <h2 className="text-2xl font-bold text-green-700 mb-5 text-center">
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
          className="w-full border p-3 rounded-lg"
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
          className="w-full border p-3 rounded-lg"
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
          className="w-full border p-3 rounded-lg"
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
          className="w-full border p-3 rounded-lg h-28 resize-none"
        />

        <div className="flex gap-3">
          <button
            onClick={() => setShowQueryPopup(false)}
            className="w-1/2 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 font-semibold"
          >
            Cancel
          </button>

          <button
            onClick={handleQuerySubmit}
            className="w-1/2 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold"
          >
            Submit
          </button>
        </div>

      </div>
    </div>
  </div>
)}
    </div>
  );
}