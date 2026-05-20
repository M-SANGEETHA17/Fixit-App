import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";

export default function WorkerRegister() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    experience: "",
    location: "",
    password: ""
  });

  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    const { name, phone, email, service, experience, location, password } = form;

    if (!name || !phone || !email || !service || !experience || !location || !password) {
      alert("Fill all fields ❗");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/api/workers/register`, form);

      if (res.data.success) {
        setShowPopup(true);

        setForm({
          name: "",
          phone: "",
          email: "",
          service: "",
          experience: "",
          location: "",
          password: ""
        });
      }

    } catch (err) {
      console.log(err);
      alert("Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-green-100 via-white to-green-200">
      <div className="hidden md:flex w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&w=1200&q=80"
          className="w-full h-full object-cover brightness-75"
          alt="worker"
        />
        <div className="absolute inset-0 bg-green-900/70 flex items-center justify-center text-white text-center px-10">
          <div>
            <h1 className="text-4xl font-bold">Join FixIt</h1>
            <p className="mt-3 text-sm">Start earning by helping customers</p>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="bg-white/90 backdrop-blur-lg shadow-2xl rounded-3xl p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-green-600 text-center">
            Worker Register
          </h2>

          <p className="text-gray-500 text-center mt-2 mb-6 text-sm">
            Create your worker account
          </p>

          {/* Navigation Dropdown Selector */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Signup Type</label>
            <select
              value="worker"
              onChange={(e) => {
                if (e.target.value === "user") navigate("/register");
              }}
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 bg-white cursor-pointer text-gray-700"
            >
              <option value="user">User Signup</option>
              <option value="worker">Worker Signup</option>
            </select>
          </div>

          <input name="name" placeholder="Full Name"
            value={form.name} onChange={handleChange}
            className="w-full p-3 border rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-green-400" />

          <input name="phone" placeholder="Mobile Number"
            value={form.phone} onChange={handleChange}
            className="w-full p-3 border rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-green-400" />

          <input name="email" placeholder="Email"
            value={form.email} onChange={handleChange}
            className="w-full p-3 border rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-green-400" />

          <select
            name="service"
            value={form.service}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl mb-3 bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="">Select Service</option>
            <option>Home Cleaning</option>
            <option>Electrical Repair</option>
            <option>Plumbing</option>
            <option>AC Service</option>
            <option>Pest Control</option>
            <option>Carpentry</option>
          </select>

          <input name="experience" placeholder="Experience (in years)"
            value={form.experience} onChange={handleChange}
            className="w-full p-3 border rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-green-400" />

          <input name="location" placeholder="Location"
            value={form.location} onChange={handleChange}
            className="w-full p-3 border rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-green-400" />

          <input type="password" name="password" placeholder="Password"
            value={form.password} onChange={handleChange}
            className="w-full p-3 border rounded-xl mb-5 focus:outline-none focus:ring-2 focus:ring-green-400" />

          <button
            onClick={handleRegister}
            className="w-full bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 transition font-semibold"
          >
            Register
          </button>

          <p className="text-sm text-center mt-5">
            Already have account?{" "}
            <Link to="/workerlogin" className="text-green-600 font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl text-center">
            <h2 className="text-green-600 font-bold text-xl">
              Registration Successful
            </h2>
            <button
              onClick={() => setShowPopup(false)}
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}