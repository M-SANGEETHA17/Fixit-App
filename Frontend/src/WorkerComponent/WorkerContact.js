import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
  FaSmileWink,
  FaFrown,
  FaMeh,
  FaCalendarAlt,
  FaUserCircle,
  FaChartLine,
  FaSyncAlt,
  FaQuoteLeft,
  FaInbox,
  FaThumbsUp,
  FaHandsHelping,
  FaSignInAlt,
} from "react-icons/fa";

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const baseUrl = isLocal ? "http://localhost:5005" : "https://fixit-app-w0dp.onrender.com";

export default function WorkerFeedbackDashboard() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workerName, setWorkerName] = useState("Worker");
  const [stats, setStats] = useState({
    avgRating: 0,
    total: 0,
    positive: 0,
  });
  const [workerEmail, setWorkerEmail] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    getWorkerEmailAndFetch();
  }, []);

  const getWorkerEmailAndFetch = () => {
    // Try 1: localStorage
    let storedWorker = localStorage.getItem("worker");
    let email = null;
    let name = null;

    if (storedWorker) {
      try {
        const worker = JSON.parse(storedWorker);
        email = worker.email;
        name = worker.name;
      } catch(e) {}
    }

    // Try 2: URL query param ?email=xxx
    if (!email) {
      email = searchParams.get("email");
    }

    // Try 3: If still no email, show login button
    if (!email) {
      setLoading(false);
      return;
    }

    setWorkerEmail(email);
    if (name) setWorkerName(name);
    else setWorkerName(email.split("@")[0]);

    fetchFeedback(email);
  };

  const fetchFeedback = async (email) => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/api/feedback/${email}`);
      const data = await res.json();

      if (data.success) {
        setFeedbacks(data.feedbacks || []);
        calculateStats(data.feedbacks || []);
      }
      setLoading(false);
    } catch (error) {
      console.log("Fetch feedback error:", error);
      setLoading(false);
    }
  };

  const calculateStats = (fbList) => {
    const total = fbList.length;
    if (total === 0) {
      setStats({ avgRating: 0, total: 0, positive: 0 });
      return;
    }
    const avg = fbList.reduce((sum, fb) => sum + Number(fb.rating), 0) / total;
    const positive = fbList.filter((fb) => Number(fb.rating) >= 4).length;
    setStats({ avgRating: avg.toFixed(1), total, positive });
  };

  const renderStars = (rating) => {
    const stars = [];
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    for (let i = 1; i <= 5; i++) {
      if (i <= full) stars.push(<FaStar key={i} className="text-yellow-400 inline" />);
      else if (half && i === full + 1) stars.push(<FaStarHalfAlt key={i} className="text-yellow-400 inline" />);
      else stars.push(<FaRegStar key={i} className="text-yellow-400 inline" />);
    }
    return stars;
  };

  const getMoodIcon = (rating) => {
    if (rating >= 4.5) return <FaSmileWink className="text-green-500 text-2xl" />;
    if (rating >= 3) return <FaMeh className="text-yellow-500 text-2xl" />;
    return <FaFrown className="text-red-400 text-2xl" />;
  };

  // If no worker email found, show login prompt
  if (!workerEmail && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <FaHandsHelping className="text-6xl text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">Please login to view your feedback dashboard.</p>
          <button
            onClick={() => navigate("/workerlogin")}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto"
          >
            <FaSignInAlt /> Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-4xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
              <FaHandsHelping className="text-green-600" />
              Hello, {workerName}!
            </h1>
            <p className="text-gray-600 mt-1">Here's what customers are saying about your work</p>
          </div>
          <button
            onClick={() => fetchFeedback(workerEmail)}
            className="flex items-center gap-2 bg-white px-5 py-2 rounded-full shadow-md hover:shadow-lg transition"
          >
            <FaSyncAlt className={`text-green-600 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <p className="text-gray-600 text-sm">Total Feedback</p>
            <p className="text-4xl font-bold text-green-700">{stats.total}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <p className="text-gray-600 text-sm">Average Rating</p>
            <p className="text-4xl font-bold text-yellow-600">{stats.avgRating}</p>
            <div>{renderStars(Number(stats.avgRating))}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <p className="text-gray-600 text-sm">Happy Customers (4+ ⭐)</p>
            <p className="text-4xl font-bold text-green-600">{stats.positive}</p>
          </div>
        </div>

        {/* Feedback cards */}
        {loading ? (
          <div className="text-center py-20"><p>Loading feedback...</p></div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow">
            <FaInbox className="text-7xl mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-600">No feedback yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                  <th className="p-4 font-semibold">Customer</th>
                  <th className="p-4 font-semibold text-center">Rating</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Feedback/Comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {feedbacks.map((fb) => (
                  <tr key={fb._id} className="hover:bg-green-50/50 transition-colors duration-200">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <FaUserCircle className="text-3xl text-green-600 flex-shrink-0" />
                        <span className="font-bold text-gray-800 whitespace-nowrap">{fb.customerName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <div className="flex items-center">
                          {renderStars(Number(fb.rating))}
                        </div>
                        <span className="text-xs font-medium text-gray-600">({fb.rating} / 5)</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-emerald-500" />
                        {new Date(fb.createdAt).toLocaleDateString("en-IN")}
                      </div>
                    </td>
                    <td className="p-4 text-gray-700">
                      <div className="relative pl-5 italic text-sm leading-relaxed text-gray-600">
                        <FaQuoteLeft className="absolute top-0 left-0 text-green-200 text-xs" />
                        {fb.comment}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Your hard work makes customers smile. Keep shining!</p>
        </div>
      </div>
    </div>
  );
}