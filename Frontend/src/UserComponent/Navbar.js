import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";
import { FaBars, FaTimes } from "react-icons/fa";
import axios from "axios";
import API_BASE_URL from "../config";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const [showSOS, setShowSOS] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);
  const [sosResult, setSosResult] = useState(null); // { success, worker, message }

  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("user"));
    setUser(loggedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };

  const services = [
    "Electrical",
    "Plumbing",
    "AC Repair",
    "Home Cleaning",
    "Carpentry",
    "Pest Control",
  ];

  const serviceLinks = [
    { name: "Electrical", path: "/electricalrepair" },
    { name: "Plumbing", path: "/plumbing" },
    { name: "AC Repair", path: "/acservice" },
    { name: "Home Cleaning", path: "/homecleaning" },
    { name: "Carpentry", path: "/carpentry" },
    { name: "Pest Control", path: "/pestcontrol" },
  ];

  const handleOpenSOS = () => {
    setSelectedIssue("");
    setSosResult(null);
    setShowSOS(true);
  };

  const handleSOS = async () => {
    if (!selectedIssue) {
      alert("Please select a service type first.");
      return;
    }

    // Extract user details from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userName  = storedUser?.name  || "Unknown User";
    const userPhone = storedUser?.phone || "0000000000";
    // Support both "city" and "location" fields depending on your User schema
    const userCity  = storedUser?.city  || storedUser?.location || "";
    const userAddress = storedUser?.address || userCity;

    setSosLoading(true);
    setSosResult(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/sos/create`, {
        userName,
        userPhone,
        userCity,
        userAddress,
        issue: selectedIssue,
      });

      setSosResult({
        success: true,
        message: response.data.message,
        worker:  response.data.worker,
        bookingId: response.data.bookingId,
      });
    } catch (err) {
      console.error("[SOS] Request failed:", err);
      // Use the backend's descriptive message if available
      const errMsg =
        err.response?.data?.message ||
        "SOS request failed. Please try again or call us directly.";
      setSosResult({ success: false, message: errMsg });
    } finally {
      setSosLoading(false);
    }
  };

  const handleCloseSOSModal = () => {
    setShowSOS(false);
    setSosResult(null);
    setSelectedIssue("");
    setShowDropdown(false);
  };

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on desktop resizing
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className="bg-green-100/95 backdrop-blur-md border-b border-green-200 text-green-950 px-4 sm:px-6 lg:px-8 py-3.5 shadow-sm sticky top-0 z-50 relative">
      {/* Container to center and constrain max-width */}
      <div className="max-w-7xl mx-auto flex justify-between items-center w-full">
        {/* LOGO */}
        <div className="flex-shrink-0">
          <Link to="/adminlogin" className="group">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-widest transition-all duration-300">
              <span className="text-green-600 group-hover:text-green-500 transition-colors">FIX</span>
              <span className="text-gray-800 group-hover:text-gray-900 transition-colors">IT</span>
            </h1>
            <p className="text-[11px] text-green-700 tracking-wide font-medium">
              On-Demand Services
            </p>
          </Link>
        </div>

        {/* MOBILE MENU ICON */}
        <div className="lg:hidden">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-green-800 hover:text-green-600 hover:bg-green-200/50 rounded-lg transition-colors focus:outline-none"
            aria-label="Toggle Menu"
          >
            {menuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
          </button>
        </div>

        {/* DESKTOP MENU */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-green-800">
          <Link to="/" className="hover:text-green-950 transition-colors">Home</Link>
          <Link to="/cmpy" className="hover:text-green-950 transition-colors">About</Link>

          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setOpen(!open)} 
              className="flex items-center gap-1 hover:text-green-950 focus:outline-none transition-colors"
            >
              Our Services <RiArrowDropDownLine className={`text-2xl transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-green-100 w-64 rounded-xl shadow-xl py-2 z-50 transform transition-all duration-200 ease-out origin-top-left animate-fadeIn">
                {serviceLinks.map((s, i) => (
                  <Link 
                    key={i} 
                    to={s.path} 
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2.5 text-sm text-green-900 hover:bg-green-50 hover:text-green-950 transition-colors"
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/contact" className="hover:text-green-950 transition-colors">Feedback</Link>
        </div>

        {/* DESKTOP RIGHT SIDE */}
        <div className="hidden lg:flex items-center gap-4">
          {/* SOS */}
          <button
            onClick={handleOpenSOS}
            className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full shadow-md shadow-red-200 transition-all hover:scale-105 animate-pulse flex items-center gap-1.5"
          >
            🔴 SOS
          </button>

          {user ? (
            <div className="flex items-center gap-3 bg-green-200/50 pl-3 pr-1 py-1 rounded-full border border-green-300/40">
              <span className="font-semibold text-green-800 text-sm">{user.name}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-semibold transition-all shadow-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full shadow-sm transition-all text-sm">
                Login
              </Link>
              <Link to="/register" className="px-5 py-2 border border-green-600 text-green-750 hover:bg-green-200/30 font-semibold rounded-full shadow-sm transition-all text-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE BACKDROP OVERLAY */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black/35 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* MOBILE MENU */}
      <div 
        className={`lg:hidden absolute top-full left-0 right-0 bg-green-50 border-b border-green-250 shadow-xl z-40 transition-all duration-300 ease-in-out origin-top ${
          menuOpen 
            ? "opacity-100 translate-y-0 pointer-events-auto" 
            : "opacity-0 -translate-y-4 pointer-events-none"
        } overflow-y-auto`}
      >
        <div className="px-6 py-6 space-y-6">
          {/* Navigation Links */}
          <div className="flex flex-col gap-4 text-base font-semibold text-green-800">
            <Link 
              to="/" 
              onClick={() => setMenuOpen(false)} 
              className="hover:text-green-950 transition-colors py-1 border-b border-green-100/60"
            >
              Home
            </Link>
            <Link 
              to="/cmpy" 
              onClick={() => setMenuOpen(false)} 
              className="hover:text-green-950 transition-colors py-1 border-b border-green-100/60"
            >
              About
            </Link>
            
            {/* Expandable Services Accordion */}
            <div className="border-b border-green-100/60">
              <button 
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                className="w-full flex items-center justify-between hover:text-green-950 transition-colors py-1 text-left"
              >
                <span>Our Services</span>
                <RiArrowDropDownLine className={`text-2xl transition-transform duration-200 ${mobileServicesOpen ? "rotate-180" : ""}`} />
              </button>
              
              {mobileServicesOpen && (
                <div className="pl-4 mt-1 mb-2 border-l border-green-200/80 flex flex-col gap-1.5">
                  {serviceLinks.map((s, i) => (
                    <Link 
                      key={i} 
                      to={s.path} 
                      onClick={() => setMenuOpen(false)}
                      className="block py-2 text-sm text-green-700 hover:text-green-950 transition-colors"
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            <Link 
              to="/contact" 
              onClick={() => setMenuOpen(false)} 
              className="hover:text-green-950 transition-colors py-1"
            >
              Feedback
            </Link>
          </div>

          <hr className="border-green-150" />

          {/* SOS & Authentication Area */}
          <div className="flex flex-col gap-4">
            {/* SOS Trigger */}
            <button
              onClick={() => {
                setMenuOpen(false);
                handleOpenSOS();
              }}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold shadow-md shadow-red-200 flex items-center justify-center gap-2 animate-pulse"
            >
              🔴 SOS Emergency
            </button>

            {/* Auth Section */}
            {user ? (
              <div className="bg-green-100/50 border border-green-200 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center font-bold text-green-800">
                    {user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-green-600 font-medium">Logged in as</p>
                    <p className="font-bold text-green-900">{user.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold transition-colors text-sm shadow-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  to="/login" 
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-center rounded-full font-semibold shadow-sm transition-colors text-sm"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 py-2.5 border border-green-600 text-green-700 hover:bg-green-100/35 text-center rounded-full font-semibold transition-colors text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SOS POPUP */}
      {showSOS && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-[340px] max-w-[95vw]">

            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-red-600 font-bold text-lg">🆘 Emergency SOS</h2>
              <button
                onClick={handleCloseSOSModal}
                className="text-gray-400 hover:text-gray-700 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* ── Result View (after API response) ── */}
            {sosResult ? (
              sosResult.success ? (
                <div className="text-center">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-green-700 font-semibold mb-1">Worker Assigned!</p>
                  <p className="text-xs text-gray-500 mb-3">{sosResult.message}</p>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-left text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={sosResult.worker?.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                        alt="worker"
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                      <div>
                        <p className="font-bold text-gray-800">{sosResult.worker?.name}</p>
                        <p className="text-gray-500 text-xs">{sosResult.worker?.service}</p>
                      </div>
                    </div>
                    <p className="text-gray-700">📞 <span className="font-medium">{sosResult.worker?.phone}</span></p>
                    <p className="text-gray-700">📍 {sosResult.worker?.location}</p>
                    <p className="text-gray-700">⭐ {sosResult.worker?.rating ?? "N/A"} · {sosResult.worker?.experience}</p>
                  </div>
                  <button
                    onClick={handleCloseSOSModal}
                    className="mt-4 w-full bg-green-500 text-white py-2 rounded-full font-medium"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-4xl mb-2">❌</div>
                  <p className="text-red-600 font-semibold mb-2">Request Failed</p>
                  <p className="text-sm text-gray-600 mb-4">{sosResult.message}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setSosResult(null); }}
                      className="flex-1 bg-red-500 text-white py-2 rounded-full text-sm"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={handleCloseSOSModal}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-full text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )
            ) : (
              /* ── Service Selection View (Combo-box) ── */
              <>
                <p className="text-sm text-gray-500 mb-2">Select or type the emergency service you need:</p>

                {/* Combo-box wrapper */}
                <div className="relative">
                  <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-red-400">
                    {/* Editable text input */}
                    <input
                      id="sos-service-input"
                      type="text"
                      value={selectedIssue}
                      onChange={(e) => {
                        setSelectedIssue(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="e.g. Electrical, Plumbing…"
                      className="flex-1 px-3 py-2 text-sm outline-none bg-white text-gray-800 placeholder-gray-400"
                    />
                    {/* Dropdown toggle arrow */}
                    <button
                      type="button"
                      onClick={() => setShowDropdown((prev) => !prev)}
                      className="px-2 py-2 text-gray-500 hover:text-red-500 bg-gray-50 border-l"
                    >
                      ▾
                    </button>
                    {/* Clear button */}
                    {selectedIssue && (
                      <button
                        type="button"
                        onClick={() => { setSelectedIssue(""); setShowDropdown(false); }}
                        className="px-2 py-2 text-gray-400 hover:text-red-500 bg-gray-50 border-l text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Dropdown suggestions */}
                  {showDropdown && (
                    <ul className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-10 max-h-44 overflow-y-auto">
                      {services
                        .filter((s) =>
                          s.toLowerCase().includes(selectedIssue.toLowerCase())
                        )
                        .map((s, i) => (
                          <li
                            key={i}
                            onMouseDown={() => {
                              setSelectedIssue(s);
                              setShowDropdown(false);
                            }}
                            className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                              selectedIssue === s
                                ? "bg-red-500 text-white"
                                : "hover:bg-red-50 text-gray-700"
                            }`}
                          >
                            {s}
                          </li>
                        ))}
                      {/* If typed value doesn't match any suggestion, show custom option */}
                      {selectedIssue &&
                        !services.some(
                          (s) => s.toLowerCase() === selectedIssue.toLowerCase()
                        ) && (
                          <li
                            onMouseDown={() => setShowDropdown(false)}
                            className="px-3 py-2 text-sm text-red-600 font-medium bg-red-50 cursor-default"
                          >
                            🔍 Using: &quot;{selectedIssue}&quot;
                          </li>
                        )}
                    </ul>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleSOS}
                    disabled={sosLoading || !selectedIssue.trim()}
                    className={`flex-1 py-2 rounded-full font-semibold text-sm transition-all ${
                      sosLoading || !selectedIssue.trim()
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-red-500 text-white hover:bg-red-600"
                    }`}
                  >
                    {sosLoading ? "Sending…" : "Trigger SOS"}
                  </button>
                  <button
                    onClick={handleCloseSOSModal}
                    disabled={sosLoading}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-full text-sm hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </nav>
  );
}