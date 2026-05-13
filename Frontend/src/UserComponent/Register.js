import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GiAutoRepair } from "react-icons/gi";
import axios from "axios";
export default function Register() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    address: ""
  });

  const [showAlert, setShowAlert] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async () => {
  const { name, phone, email, password, address } = form;

  if (!name || !phone || !email || !password || !address) {
    setError("Please fill all the fields");
    return;
  }

  try {
    const res = await axios.post(
      "https://fixit-app-w0dp.onrender.com/api/users/register",
      form
    );

    console.log(res.data);

    setShowAlert(true);
    setError("");

    
    setForm({
      name: "",
      phone: "",
      email: "",
      password: "",
      address: ""
    });

  } catch (err) {
      console.log(err); 
    setError(err.response?.data?.message || "Something went wrong");
  }
};


  return (
    <div className="min-h-screen flex bg-green-50">

      {showAlert && (
  <div className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg animate-bounce z-50 text-center">
           Welcome to FIXIT! <GiAutoRepair className="inline" /> <br />
          Discover trusted home services with FIXIT
        </div>
      )}

      {error && (
        <div className="fixed top-5 right-5 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50">
          {error}
        </div>
      )}

      <motion.div
        className="hidden md:flex w-1/2 items-center justify-center bg-gradient-to-br from-green-200 to-green-600"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center px-10">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1995/1995574.png"
            className="w-72 mx-auto mb-6"
            alt="services"
          />
          <h1 className="text-3xl font-bold text-white">
            FIXIT Services
          </h1>
          <p className="text-white mt-3 text-sm">
            Home Cleaning  Plumbing  Electrical  AC Repair 
          </p>
        </div>
      </motion.div>

      <motion.div
        className="w-full md:w-1/2 flex items-center justify-center"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white shadow-2xl rounded-2xl p-10 w-[90%] max-w-md">

          <h2 className="text-3xl font-bold text-green-600 text-center">
            Create Account
          </h2>

          <p className="text-gray-500 text-center mb-6 text-sm">
            Join FIXIT & book services instantly
          </p>

          {/* INPUTS */}
          <input
            name="name"
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-green-400 outline-none"
          />

          <input
            name="phone"
            onChange={handleChange}
            placeholder="Phone Number"
            className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-green-400 outline-none"
          />

          <input
            name="email"
            onChange={handleChange}
            placeholder="Email"
            className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-green-400 outline-none"
          />

          <input
            name="password"
            type="password"
            onChange={handleChange}
            placeholder="Password"
            className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-green-400 outline-none"
          />

          <textarea
            name="address"
            onChange={handleChange}
            placeholder="Address"
            className="w-full p-3 border rounded-lg mb-5 focus:ring-2 focus:ring-green-400 outline-none"
          />

          {/* BUTTON */}
          <button
            onClick={handleSubmit}
            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition shadow-md"
          >
            Sign Up
          </button>

          <p className="text-sm text-center mt-4 text-gray-600">
            Already have account?{" "}
            <Link to="/login" className="text-green-600 font-semibold">
              Login
            </Link>
          </p>

        </div>
      </motion.div>

    </div>
  );
}