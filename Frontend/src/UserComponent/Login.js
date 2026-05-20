import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/users/login`, {
        email,
        password
      });

      localStorage.setItem("user", JSON.stringify(res.data.user));
      console.log(res.data);
      alert("Successfully Logged In..Welcome to FixIt");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Login Failed");
    }
  };

  const handleForgotPassword = () => {
    alert("Password reset instructions have been sent to your email!");
  };

  return (
    <div className="min-h-screen flex bg-green-50">
      {/* Left Pane - Original UI */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-gradient-to-br from-green-200 to-green-500">
        <div className="text-center px-10">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3209/3209265.png"
            className="w-72 mx-auto mb-6"
            alt="service"
          />
          <h1 className="text-3xl font-bold text-white">FIXIT Services</h1>
          <p className="text-white mt-3 text-sm">On-demand home services at your doorstep</p>
        </div>
      </div>

      {/* Right Pane - Original UI with Dropdown & Forgot Password */}
      <div className="w-full md:w-1/2 flex items-center justify-center">
        <div className="bg-white shadow-xl rounded-2xl p-10 w-[90%] max-w-md">
          <h2 className="text-3xl font-bold text-green-600 text-center mb-2">Welcome Back</h2>
          <p className="text-gray-500 text-center mb-6 text-sm">Login to continue FIXIT services</p>

          {/* Navigation Dropdown Selector */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Login Type</label>
            <select
              value="user"
              onChange={(e) => {
                if (e.target.value === "worker") navigate("/workerlogin");
              }}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white cursor-pointer text-gray-700"
            >
              <option value="user">User Login</option>
              <option value="worker">Worker Login</option>
            </select>
          </div>

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Forgot Password Link */}
          <div className="text-right mb-4">
            <button
              onClick={handleForgotPassword}
              className="text-xs font-semibold text-green-600 hover:text-green-700 hover:underline transition"
            >
              Forgot password?
            </button>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition shadow-md font-semibold"
          >
            Login
          </button>

          <p className="text-sm text-center mt-4 text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-green-600 font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
