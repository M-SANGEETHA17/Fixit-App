import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUserShield, FaLock } from "react-icons/fa";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (username === "admin" && password === "1234") {
      localStorage.setItem("isAdminAuthenticated", "true");
      navigate("/admindashboard");
    } else {
      alert("Invalid Admin Credentials ");
    }
  };

  return (
<div className="min-h-[calc(100vh-80px)] flex bg-gradient-to-br from-green-200 via-white to-green-100">
      <div className="hidden md:flex w-1/2 items-center justify-center bg-green-100">
        <div className="text-center px-6">
          <img
            src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800"
            className="w-80 h-64 object-cover rounded-2xl shadow-xl mx-auto"
            alt="admin"
          />
          <h1 className="mt-6 text-3xl font-bold text-green-800">
            FixIt Services
          </h1>
          <p className="text-green-700 mt-2 text-sm">
            Manage workers & requests easily
          </p>
        </div>
      </div>

      {/* RIGHT (FULL MOBILE + HALF DESKTOP) */}
<div className="w-full md:w-1/2 flex items-center justify-center px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6"
        >
          {/* HEADER */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <div className="bg-green-100 p-3 rounded-full">
                <FaUserShield className="text-green-600 text-2xl" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800">
              Admin Login
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Login to continue
            </p>
          </div>

          {/* INPUTS */}
          <div className="space-y-4">
            <div className="flex items-center bg-green-50 rounded-lg px-3">
              <FaUserShield className="text-green-500" />
              <input
                type="text"
                placeholder="Username"
                className="w-full p-3 bg-transparent outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="flex items-center bg-green-50 rounded-lg px-3">
              <FaLock className="text-green-500" />
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 bg-transparent outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* BUTTON */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleLogin}
            className="w-full mt-6 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition mb-8"
          >
            Login
          </motion.button>

          <div className="text-center">
  <Link
    to="/"
    className="text-green-600 font-medium hover:text-green-700 hover:underline"
  >
    ← Back to Home
  </Link>
</div>

         
        </motion.div>
      </div>

    </div>
  );
}