import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaUserCircle,
  FaSignOutAlt,
  FaCommentDots,
} from "react-icons/fa";

export default function WorkerNavbar() {
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const storedWorker = JSON.parse(localStorage.getItem("worker"));
    if (storedWorker) {
      setWorker(storedWorker);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("worker");
    navigate("/workerlogin");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-gradient-to-r from-green-100 to-emerald-100 text-gray-800 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center shadow-md sticky top-0 z-50">
        
        <div className="flex-shrink-0">
           <Link to="/adminlogin">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-widest">
            <span className="text-green-600">FIX</span>
            <span className="text-gray-800">IT</span>
          </h1>
          </Link>
          <p className="text-[8px] sm:text-[10px] text-green-600 -mt-1 tracking-widest hidden sm:block">
            Worker Panel Dashboard
          </p>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/workerdashboard" className="hover:text-green-600 transition">
            Dashboard
          </Link>
          <Link to="/workerrequests" className="hover:text-green-600 transition">
            Requests
          </Link>
          <Link to="/workerprofiles" className="hover:text-green-600 transition">
            Profile
          </Link>
          <Link to="/workercontact" className="hover:text-green-600 transition">
            Feedback
          </Link>
          
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold">{worker?.name || "Worker"}</p>
            <p className="text-[11px] text-gray-600 truncate max-w-[150px]">
              {worker?.email}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 sm:px-5 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white transition text-sm font-semibold flex items-center gap-2 shadow-sm"
            aria-label="Logout"
          >
            <FaSignOutAlt className="text-sm" />
            <span className="hidden sm:inline">Logout</span>
          </button>

          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-700 focus:outline-none text-2xl"
            aria-label="Menu"
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      <div
        className={`md:hidden fixed top-[72px] left-0 right-0 bg-white shadow-xl z-40 transition-all duration-300 ease-in-out overflow-hidden ${
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col p-4 gap-3 border-t border-green-100">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
            <FaUserCircle className="text-4xl text-green-600" />
            <div>
              <p className="font-semibold text-gray-800">
                {worker?.name || "Worker"}
              </p>
              <p className="text-xs text-gray-500">{worker?.email}</p>
            </div>
          </div>

          <Link
            to="/workerdashboard"
            onClick={closeMenu}
            className="py-2 px-3 rounded-lg hover:bg-green-50 transition text-gray-700 font-medium"
          >
            Dashboard
          </Link>

          <Link
            to="/workerrequests"
            onClick={closeMenu}
            className="py-2 px-3 rounded-lg hover:bg-green-50 transition text-gray-700 font-medium"
          >
            Requests
          </Link>

          <Link
            to="/workerprofiles"
            onClick={closeMenu}
            className="py-2 px-3 rounded-lg hover:bg-green-50 transition text-gray-700 font-medium"
          >
            Profile
          </Link>

          <Link
            to="/workercontact"
            onClick={closeMenu}
            className="py-2 px-3 rounded-lg hover:bg-green-50 transition text-gray-700 font-medium"
          >
            Contact
          </Link>

          <Link
            to="/workercontact"
            onClick={closeMenu}
            className="py-2 px-3 rounded-lg hover:bg-green-50 transition text-gray-700 font-medium flex items-center gap-2"
          >
            <FaCommentDots />
            Feedback
          </Link>
        </div>
      </div>
    </>
  );
}