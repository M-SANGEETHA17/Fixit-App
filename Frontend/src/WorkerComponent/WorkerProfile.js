import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaTools,
  FaEdit,
  FaBriefcase,
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function WorkerProfile() {

  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  const didFetch = useRef(false);

  const fetchWorkerProfile = async () => {
    try {
      const workerId = localStorage.getItem("workerId");

      if (!workerId) {
        alert("Worker not logged in");
        setLoading(false);
        return;
      }

      const res = await axios.get(
        `https://fixit-app-w0dp.onrender.com/api/workers/${workerId}`
      );

      if (res.data.success) {
        setProfile(res.data.worker);
      }

      setLoading(false);

    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (didFetch.current) return;

    didFetch.current = true;
    fetchWorkerProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    try {
      const workerId = localStorage.getItem("workerId");

      const res = await axios.put(
        `https://fixit-app-w0dp.onrender.com/api/workers/update/${workerId}`,
        profile
      );

      if (res.data.success) {
        setProfile(res.data.worker);
        setEdit(false);
        alert("Profile updated successfully..");
      }

    } catch (err) {
      console.log(err);
      alert("Update failed ");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        No profile found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 via-white to-green-100 flex items-center justify-center p-6">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden"
      >

        <div className="relative">
          <img
            src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg"
            className="w-full h-40 object-cover"
          />

          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
            <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-green-400">
              <FaUser className="text-green-600 text-3xl" />
            </div>
          </div>
        </div>

        <div className="pt-14 pb-6 px-6">

          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {profile.name}
            </h2>
            <p className="text-green-600 font-medium">
              {profile.service}
            </p>
          </div>

          <div className="mt-6 space-y-4">

            {[
              { icon: <FaUser />, name: "name" },
              { icon: <FaPhone />, name: "phone" },
              { icon: <FaTools />, name: "service" },
              { icon: <FaMapMarkerAlt />, name: "location" },
              { icon: <FaBriefcase />, name: "experience" }
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                className="flex items-center gap-3 bg-green-50 p-3 rounded-xl shadow-sm"
              >
                <div className="text-green-600">{item.icon}</div>

                {edit ? (
                  <input
                    type="text"
                    name={item.name}
                    value={profile[item.name] || ""}
                    onChange={handleChange}
                    className="w-full bg-transparent outline-none"
                  />
                ) : (
                  <p className="text-gray-700">
                    {profile[item.name]}
                  </p>
                )}
              </motion.div>
            ))}

          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (edit) {
                saveProfile();   // 🔥 SAVE TO DB
              } else {
                setEdit(true);
              }
            }}
            className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg"
          >
            <FaEdit />
            {edit ? "Save Profile" : "Edit Profile"}
          </motion.button>

        </div>
      </motion.div>
    </div>
  );
}