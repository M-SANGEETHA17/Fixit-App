import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaUserCircle,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaClipboardList,
  FaBriefcase,
  FaUserEdit,
  FaBell,
  FaChartLine,
} from "react-icons/fa";

export default function WorkerDashboard() {
  const [worker, setWorker] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [pendingCount, setPendingCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  const updateStatusMessage = (status) => {
    if (status === "Active") {
      setStatusMsg("Your account is approved by admin");
    } else if (status === "Pending") {
      setStatusMsg("Waiting for admin approval");
    } else if (status === "Rejected") {
      setStatusMsg("Your account was rejected");
    }
  };

  const loadCounts = () => {
    const allRequests = JSON.parse(localStorage.getItem("allWorkerRequests") || "[]");
    
    const pending = allRequests.filter(r => r.status === "Pending" || !r.status).length;
    const accepted = allRequests.filter(r => r.status === "Accepted").length;
    const rejected = allRequests.filter(r => r.status === "Rejected").length;
    const completed = allRequests.filter(r => r.status === "Completed").length;
    
    setPendingCount(pending);
    setAcceptedCount(accepted);
    setRejectedCount(rejected);
    setCompletedCount(completed);
  };

  // FETCH WORKER + UPDATE COUNTS
  const fetchWorkerData = async () => {
    const data = JSON.parse(localStorage.getItem("worker"));
    if (!data) return;

    try {
      const res = await axios.get(`https://fixit-app-w0dp.onrender.com/api/workers/${data._id}`);
      const updated = res.data.worker || data;
      setWorker(updated);
      localStorage.setItem("worker", JSON.stringify(updated));
      updateStatusMessage(updated.status);

      const bookingsRes = await axios.get(`https://fixit-app-w0dp.onrender.com/api/bookings/worker/${data._id}`);
      const pendingRequests = bookingsRes.data.requests || [];
      const storedRequests = JSON.parse(localStorage.getItem("allWorkerRequests") || "[]");
      const nonPendingStored = storedRequests.filter(req => req.status !== "Pending");
      const combined = [...pendingRequests, ...nonPendingStored];
      const uniqueRequests = combined.reduce((unique, req) => {
        if (!unique.find(r => r._id === req._id)) unique.push(req);
        return unique;
      }, []);
      
      localStorage.setItem("allWorkerRequests", JSON.stringify(uniqueRequests));
      loadCounts();
    } catch (err) {
      console.log(err);
      setWorker(data);
      updateStatusMessage(data.status);
      loadCounts();
    }
  };

  useEffect(() => {
    fetchWorkerData();
    const interval = setInterval(loadCounts, 2000);
    return () => clearInterval(interval);
  }, []);

  const statusIcon = () => {
    if (worker?.status === "Active") return <FaCheckCircle className="text-green-500" />;
    if (worker?.status === "Pending") return <FaClock className="text-yellow-500" />;
    if (worker?.status === "Rejected") return <FaTimesCircle className="text-red-500" />;
    return null;
  };

  const getStatusColorClass = () => {
    if (worker?.status === "Active") return "bg-green-100 text-green-700 border-green-300";
    if (worker?.status === "Pending") return "bg-yellow-100 text-yellow-700 border-yellow-300";
    return "bg-red-100 text-red-700 border-red-300";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 p-4 sm:p-6 md:p-8">
      {/* Animated Background Decoration - responsive sizing */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-64 h-64 sm:w-80 sm:h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-64 h-64 sm:w-80 sm:h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden mb-6 sm:mb-8 border border-gray-100">
          <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl"></div>
          <div className="relative p-5 sm:p-6 md:p-8 flex flex-col sm:flex-row justify-between items-center gap-5 sm:gap-6">
            <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-md opacity-60"></div>
                <FaUserCircle className="text-5xl sm:text-6xl text-white relative z-10" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">
                  {worker?.name || "Worker"}
                </h1>
                <p className="text-gray-500 text-xs sm:text-sm mt-1 flex items-center gap-1 justify-center sm:justify-start">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-400"></span>
                  {worker?.email}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-center sm:items-end gap-2">
              <div className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border ${getStatusColorClass()}`}>
                {statusIcon()}
                <span className="font-semibold text-xs sm:text-sm">{worker?.status}</span>
              </div>
              <p className="text-xs text-gray-400">Last sync: just now</p>
            </div>
          </div>
        </div>

        <div className={`mb-6 sm:mb-8 p-4 sm:p-5 rounded-xl sm:rounded-2xl backdrop-blur-sm border shadow-sm transition-all hover:shadow-md ${getStatusColorClass().replace("border", "border-l-4 border")}`}>
          <div className="flex items-center gap-3">
            {statusIcon()}
            <p className="font-medium text-sm sm:text-base">{statusMsg}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
       
          <div className="group bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-yellow-200">
            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-yellow-100 text-yellow-600 group-hover:scale-110 transition-transform">
                  <FaClock size={20} className="sm:w-6 sm:h-6" />
                </div>
                <span className="text-xl sm:text-2xl font-black text-yellow-600">{pendingCount}</span>
              </div>
              <h3 className="font-bold text-gray-700 mt-3 sm:mt-4 text-sm sm:text-base">Pending Requests</h3>
              <p className="text-xs text-gray-400 mt-1">Awaiting your action</p>
            </div>
            <div className="h-1 bg-yellow-500 w-0 group-hover:w-full transition-all duration-500"></div>
          </div>

         
          <div className="group bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-200">
            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-green-100 text-green-600 group-hover:scale-110 transition-transform">
                  <FaCheckCircle size={20} className="sm:w-6 sm:h-6" />
                </div>
                <span className="text-xl sm:text-2xl font-black text-green-600">{acceptedCount}</span>
              </div>
              <h3 className="font-bold text-gray-700 mt-3 sm:mt-4 text-sm sm:text-base">Accepted Tasks</h3>
              <p className="text-xs text-gray-400 mt-1">Jobs you committed to</p>
            </div>
            <div className="h-1 bg-green-500 w-0 group-hover:w-full transition-all duration-500"></div>
          </div>

          
          <div className="group bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-red-200">
            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-red-100 text-red-600 group-hover:scale-110 transition-transform">
                  <FaTimesCircle size={20} className="sm:w-6 sm:h-6" />
                </div>
                <span className="text-xl sm:text-2xl font-black text-red-600">{rejectedCount}</span>
              </div>
              <h3 className="font-bold text-gray-700 mt-3 sm:mt-4 text-sm sm:text-base">Rejected Tasks</h3>
              <p className="text-xs text-gray-400 mt-1">Declined requests</p>
            </div>
            <div className="h-1 bg-red-500 w-0 group-hover:w-full transition-all duration-500"></div>
          </div>

          
          <div className="group bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200">
            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                  <FaChartLine size={20} className="sm:w-6 sm:h-6" />
                </div>
                <span className="text-xl sm:text-2xl font-black text-blue-600">{completedCount}</span>
              </div>
              <h3 className="font-bold text-gray-700 mt-3 sm:mt-4 text-sm sm:text-base">Completed Jobs</h3>
              <p className="text-xs text-gray-400 mt-1">Successfully finished</p>
            </div>
            <div className="h-1 bg-blue-500 w-0 group-hover:w-full transition-all duration-500"></div>
          </div>
        </div>

       
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-5 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-2">
              <FaBell className="text-white text-lg sm:text-xl" />
              <h2 className="text-lg sm:text-xl font-bold text-white">Quick Actions</h2>
            </div>
            <p className="text-green-100 text-xs sm:text-sm mt-1">Manage your work efficiently</p>
          </div>
          
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Link
                to="/workerrequests"
                className="group flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 transition-all duration-200"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-yellow-100 text-yellow-600 group-hover:scale-110 transition-transform">
                    <FaClipboardList size={16} className="sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 text-sm sm:text-base">All Requests</p>
                    <p className="text-xs text-gray-400">
                      {pendingCount + acceptedCount + rejectedCount + completedCount} total
                    </p>
                  </div>
                </div>
                <span className="text-gray-400 group-hover:text-green-500 transition text-sm sm:text-base">→</span>
              </Link>

              <Link
                to="/workerjobs"
                className="group flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 transition-all duration-200"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                    <FaBriefcase size={16} className="sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 text-sm sm:text-base">Active Jobs</p>
                    <p className="text-xs text-gray-400">{acceptedCount} in progress</p>
                  </div>
                </div>
                <span className="text-gray-400 group-hover:text-green-500 transition text-sm sm:text-base">→</span>
              </Link>

              <Link
                to="/workerprofiles"
                className="group flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 transition-all duration-200"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-purple-100 text-purple-600 group-hover:scale-110 transition-transform">
                    <FaUserEdit size={16} className="sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 text-sm sm:text-base">Profile</p>
                    <p className="text-xs text-gray-400">View & edit details</p>
                  </div>
                </div>
                <span className="text-gray-400 group-hover:text-green-500 transition text-sm sm:text-base">→</span>
              </Link>
            </div>
          </div>
        </div>

        
        <div className="mt-6 text-center text-xs text-gray-400">
          Dashboard auto-refreshes every 2 seconds • {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}