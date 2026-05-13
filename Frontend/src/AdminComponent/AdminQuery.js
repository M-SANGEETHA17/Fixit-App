import { motion } from "framer-motion";
import { FaSearch, FaComments } from "react-icons/fa";
import { useState, useEffect } from "react";

const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const baseUrl = isLocal
  ? "http://localhost:5005"
  : "https://fixit-app-w0dp.onrender.com";

export default function AdminQueries() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${baseUrl}/api/queries/all`);
      const data = await res.json();

      if (data.success) {
        setQueries(data.queries || []);
      }
    } catch (err) {
      console.error("Failed to fetch queries:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredQueries = queries.filter(
    (item) =>
      (item.userName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (item.workerName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (item.query || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (item.serviceCategory || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-emerald-700 flex items-center gap-3">
              <FaComments /> Queries Management
            </h1>

            <p className="text-gray-500 mt-1">
              View all user complaints and reports
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Search username, worker or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-300 outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-emerald-600 text-white">
                <tr>
                  <th className="py-4 px-6 text-left">Username</th>

                  <th className="py-4 px-6 text-left">
                    Worker Name
                  </th>

                  <th className="py-4 px-6 text-left">
                    Service
                  </th>

                  <th className="py-4 px-6 text-left">
                    Query / Complaint
                  </th>

                  <th className="py-4 px-6 text-left">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-10 text-center text-gray-400"
                    >
                      Loading reports...
                    </td>
                  </tr>
                ) : filteredQueries.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-10 text-center text-gray-400"
                    >
                      No queries or reports found.
                    </td>
                  </tr>
                ) : (
                  filteredQueries.map((item, index) => (
                    <tr
                      key={item._id || index}
                      className={`border-b ${
                        index % 2 === 0
                          ? "bg-gray-50"
                          : "bg-white"
                      } hover:bg-emerald-50 transition`}
                    >
                      {/* Username */}
                      <td className="py-4 px-6 font-medium text-gray-700">
                        {item.userName || "Anonymous"}
                      </td>

                      {/* Worker */}
                      <td className="py-4 px-6 text-emerald-700 font-medium">
                        {item.workerName || "N/A"}
                      </td>

                      {/* Service */}
                      <td className="py-4 px-6">
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                          {item.serviceCategory || "N/A"}
                        </span>
                      </td>

                      {/* Query */}
                      <td className="py-4 px-6 text-gray-600">
                        {item.query}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-gray-500 text-sm">
                        {item.createdAt
                          ? new Date(
                              item.createdAt
                            ).toLocaleDateString("en-IN")
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}