import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  FaFileAlt,
  FaUsers,
  FaClipboardList,
  FaRupeeSign,
  FaChartLine,
  FaDownload,
  FaArrowUp,
  FaTools,
  FaUserTie
} from "react-icons/fa";
import Footer from "../UserComponent/Footer";

export default function AdminReport() {
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
  const [topServices, setTopServices] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const downloadpdf = () => {
  const input = document.getElementById("report-content");

  html2canvas(input, { scale: 2 }).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("Admin-Report.pdf");
  });
};

  const fetchReportData = async () => {
    try {
      const statsRes = await axios.get(`${API_BASE_URL}/api/admin/stats`);
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
        const mappedServices = (statsRes.data.topServices || []).map(s => ({
          name: s._id || "Other",
          count: s.count
        }));
        setTopServices(mappedServices);
      }

      const bookingsRes = await axios.get(`${API_BASE_URL}/api/bookings`);
      if (bookingsRes.data.success) {
        setRecentBookings(bookingsRes.data.bookings || []);
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  return (
    <>
<div
  id="report-content"
  className="min-h-screen bg-gradient-to-br from-green-100 via-white to-emerald-100 p-4 md:p-8"
>
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Admin Analytics Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Monitor users, revenue, bookings and worker performance
          </p>
        </div>

        <select className="border px-4 py-2 rounded-xl shadow">
          <option>This Month</option>
          <option>This Week</option>
          <option>This Year</option>
        </select>
      </motion.div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

        {[
          {
            title: "Total Users",
            value: stats.users.toString(),
            icon: <FaUsers />,
            growth: "+12%"
          },
          {
            title: "Bookings",
            value: stats.orders.toString(),
            icon: <FaClipboardList />,
            growth: "+8%"
          },
          {
            title: "Revenue",
            value: `₹${stats.revenue.toLocaleString()}`,
            icon: <FaRupeeSign />,
            growth: "+15%"
          },
          {
            title: "Workers",
            value: stats.totalWorkers.toString(),
            icon: <FaUserTie />,
            growth: "+5%"
          }
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="bg-white p-6 rounded-3xl shadow-lg border"
          >
            <div className="flex justify-between items-center">
              <div className="text-gray-500">{item.title}</div>
              <div className="text-green-500 text-xl">{item.icon}</div>
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mt-3">
              {item.value}
            </h2>

            <p className="text-green-600 flex items-center gap-2 mt-2 text-sm">
              <FaArrowUp /> {item.growth} from last month
            </p>
          </motion.div>
        ))}
      </div>

      {/* CHART PLACEHOLDER */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">

        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-white p-6 rounded-3xl shadow-lg"
        >
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FaChartLine className="text-green-500" />
            Revenue Growth
          </h2>

          <div className="h-56 flex items-end gap-3">
            {[40, 70, 55, 90, 65, 100, 80].map((h, i) => (
              <div
                key={i}
                className="bg-green-400 rounded-t-lg w-full"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-white p-6 rounded-3xl shadow-lg"
        >
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FaTools className="text-green-500" />
            Top Services
          </h2>

          <div className="space-y-4">
            {topServices.length === 0 ? (
              <p className="text-gray-400 text-sm py-8 text-center">No service bookings yet</p>
            ) : (
              topServices.slice(0, 3).map((service, i) => {
                const percentage = stats.orders > 0 ? Math.round((service.count / stats.orders) * 100) : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between mb-1 text-sm font-medium">
                      <span>{service.name}</span>
                      <span className="text-green-600">{percentage}% ({service.count})</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-green-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      

      {/* RECENT BOOKINGS */}
      <div className="mt-8 bg-white rounded-3xl shadow-lg p-6 overflow-x-auto border">
        <h2 className="text-xl font-bold mb-4">Recent Bookings</h2>

        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b text-left text-gray-500 text-sm">
              <th className="py-3 font-semibold">Customer</th>
              <th className="font-semibold">Service</th>
              <th className="font-semibold">Location</th>
              <th className="font-semibold">Status</th>
            </tr>
          </thead>

          <tbody className="text-sm">
            {recentBookings.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-gray-400">No bookings available</td>
              </tr>
            ) : (
              recentBookings.slice(0, 5).map((booking) => (
                <tr key={booking._id} className="border-b hover:bg-green-50/50 transition">
                  <td className="py-3.5 font-medium text-gray-800">{booking.name}</td>
                  <td>
                    <span className="px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">
                      {booking.serviceType}
                    </span>
                  </td>
                  <td className="text-gray-600">{booking.location}</td>
                  <td>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      booking.status === "Completed" ? "bg-green-100 text-green-700" :
                      booking.status === "Accepted" ? "bg-blue-100 text-blue-700" :
                      booking.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

       <div className="mt-8 flex justify-end">
        <motion.button
          whileTap={{ scale: 0.95 }} onClick={downloadpdf}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
        >
          <FaDownload />
          Download Bookings
        </motion.button>
      </div>
     
    </div>
    <Footer />
    </>
  );
}