import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
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


  return (
    <nav className="bg-green-100 text-green-900 px-4 md:px-10 py-4 shadow-md sticky top-0 z-50 relative">

      {/* TOP NAV */}
      <div className="flex justify-between items-center">

        {/* LOGO */}
        {/* LOGO */}
<div>
  <Link to="/">
    <h1 className="text-2xl font-extrabold leading-tight">
      <span className="text-green-600">FIX</span>
      <span className="text-gray-800">IT</span>
    </h1>

    {/* NEW TAGLINE */}
    <p className="text-[11px] text-gray-600 tracking-wide">
      On-Demand Services
    </p>
  </Link>
</div>

        {/* MOBILE MENU ICON */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* MENU */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/">Home</Link>
          <Link to="/cmpy">About</Link>

          <div className="relative">
            <button onClick={() => setOpen(!open)} className="flex items-center gap-1">
              Our Services <RiArrowDropDownLine />
            </button>

            {open && (
              <div className="absolute top-10 left-0 bg-white border w-64 rounded shadow-lg">
                {services.map((s, i) => (
                  <Link key={i} to="/" className="block px-4 py-3 hover:bg-green-100">
                    {s}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/contact">Feedback</Link>
        </div>

        {/* RIGHT SIDE */}
        <div className="hidden md:flex items-center gap-3">

          {/* SOS */}
          <button
            onClick={handleOpenSOS}
            className="px-5 py-2 bg-red-500 text-white rounded-full animate-pulse"
          >
            🔴 SOS
          </button>

          {user ? (
            <>
              <span className="font-semibold text-green-700">{user.name}</span>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-full"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 bg-green-500 text-white rounded-full">
                Login
              </Link>

              <Link to="/register" className="px-4 py-2 border border-green-500 text-green-600 rounded-full">
                Sign Up
              </Link>
            </>
          )}

        </div>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-3">

          <Link to="/">Home</Link>
          <Link to="/cmpy">About</Link>

          <button
            onClick={handleOpenSOS}
            className="py-2 bg-red-500 text-white rounded"
          >
            🔴 SOS Emergency
          </button>

        </div>
      )}

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