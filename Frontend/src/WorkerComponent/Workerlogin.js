import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaTools } from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";

export default function WorkerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Fill all fields");
      return;
    }

    try {
      const res = await axios.post(
        "https://fixit-app-w0dp.onrender.com/api/workers/login",
        { email, password }
      );

      if (!res.data.success) {
        alert("Invalid credentials");
        return;
      }

      const worker = res.data.worker;

      // status checks
      if (!worker?.status) {
        alert("Account not approved yet");
        return;
      }

      if (worker.status.toLowerCase() === "pending") {
        alert(" Waiting for admin approval");
        return;
      }

      if (worker.status.toLowerCase() === "rejected") {
        alert("Your account has been deactivated by admin.");
        return;
      }

      // ✅ STORE WORKER DATA FOR FEEDBACK DASHBOARD
      // The dashboard expects an object with "email" and "name"
      const workerForDashboard = {
        _id: worker._id,
        email: worker.email,               // ✅ required for fetching feedback
        name: worker.name || worker.fullName || "Worker", // ✅ required for greeting
        phone: worker.phone || "",
        service: worker.service || "",
        status: worker.status
      };

      localStorage.setItem("workerId", worker._id);
      localStorage.setItem("worker", JSON.stringify(workerForDashboard));

      alert("Login successful");
      navigate("/workerdashboard");

    } catch (err) {
      console.log(err);

      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Login error");
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-green-100 via-white to-green-200">

      <motion.div
        initial={{ opacity: 0, x: -80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden md:flex w-1/2 relative"
      >
        <img
          src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80"
          alt="worker"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 to-green-500/40 flex flex-col items-center justify-center text-white text-center px-10">
          <FaTools className="text-5xl mb-4 animate-bounce" />
          <h1 className="text-4xl font-extrabold">Worker Portal</h1>
          <p className="mt-3 text-sm opacity-90">
            Manage jobs, accept requests & grow your earnings
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full md:w-1/2 flex items-center justify-center p-6"
      >

        <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-8 w-full max-w-md border border-green-100">

          <h2 className="text-3xl font-bold text-green-600 text-center">
            Worker Login
          </h2>

          <p className="text-gray-500 text-center mt-2 mb-6 text-sm">
            Login to access your dashboard
          </p>

          <input
            type="email"
            placeholder="Enter Email"
            className="w-full p-3 border rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter Password"
            className="w-full p-3 border rounded-xl mb-6 focus:outline-none focus:ring-2 focus:ring-green-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl hover:scale-105 transition shadow-lg font-semibold"
          >
            Login
          </button>

          <p className="text-sm text-center mt-5 text-gray-600">
            Don’t have an account?{" "}
            <Link
              to="/workerRegister"
              className="text-green-600 font-semibold hover:underline"
            >
              Register here
            </Link>
          </p>

          
          <div className="text-center">
  <Link
    to="/"
    className="text-green-600 font-medium hover:text-green-700 hover:underline"
  >
    ← Back to Home
  </Link>
</div>

        </div>
      </motion.div>

    </div>
  );
}