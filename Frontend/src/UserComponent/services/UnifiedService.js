import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { sendWhatsAppMessage } from "../../App/Whatsapp";
import { handleBookingAndNotify } from "../../App/Message";
import WorkerSearch from "../../App/WorkerSearch";
import { Geolocation } from "@capacitor/geolocation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaUser,
  FaCheckCircle,
  FaPaperPlane,
  FaSpinner,
  FaSearch,
  FaCheck,
  FaPhone,
  FaQuestionCircle,
  FaTimes,
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
  FaQuoteLeft,
  FaCalendarAlt,
  FaUserCircle
} from "react-icons/fa";
import { MdOutlineVerified } from "react-icons/md";

export default function UnifiedService({
  serviceName,
  subtitle,
  welcomeMessage,
  serviceOptions = []
}) {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceType, setServiceType] = useState("");

  const [location, setLocation] = useState(() => {
    try {
      const saved = localStorage.getItem("userLocation");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (location) {
      localStorage.setItem("userLocation", JSON.stringify(location));
    }
  }, [location]);

  const [loadingLoc, setLoadingLoc] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [notification, setNotification] = useState(null);
  const [openSearch, setOpenSearch] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  
  const [showQueryPopup, setShowQueryPopup] = useState(false);
  const [queryForm, setQueryForm] = useState({
    userName: "",
    workerName: "",
    serviceCategory: "",
    query: "",
  });

  const [showReviewsPopup, setShowReviewsPopup] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewWorker, setReviewWorker] = useState(null);

  const openReviews = async (worker) => {
    setReviewWorker(worker);
    setShowReviewsPopup(true);
    setLoadingReviews(true);
    setReviews([]);
    
    try {
      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const baseUrl = isLocal ? "http://localhost:5005" : "https://fixit-app-w0dp.onrender.com";
      const email = worker.email;
      
      if (!email) {
        setLoadingReviews(false);
        return;
      }

      const res = await fetch(`${baseUrl}/api/feedback/${email}`);
      const data = await res.json();
      
      if (data.success) {
        setReviews(data.feedbacks || []);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    for (let i = 1; i <= 5; i++) {
      if (i <= full) stars.push(<FaStar key={i} className="text-yellow-400 inline" />);
      else if (half && i === full + 1) stars.push(<FaStarHalfAlt key={i} className="text-yellow-400 inline" />);
      else stars.push(<FaRegStar key={i} className="text-yellow-400 inline" />);
    }
    return stars;
  };

  useEffect(() => {
    fetchWorkers();
  }, [serviceName]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const showNotification = (msg, type = "info") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchWorkers = async () => {
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const baseUrl = isLocal ? "http://localhost:5005" : "https://fixit-app-w0dp.onrender.com";
    setLoadingWorkers(true);
    try {
      const res = await axios.get(
        `${baseUrl}/api/workers/by-service/${encodeURIComponent(serviceName)}`
      );

      if (res.data.success) {
        const activeWorkers = (res.data.workers || []).filter(
          (w) => ["active", "approved"].includes(w.status?.toLowerCase())
        );
        setWorkers(activeWorkers);
      } else {
        setWorkers([]);
      }
    } catch {
      setWorkers([]);
      showNotification("Failed to load workers.", "error");
    } finally {
      setLoadingWorkers(false);
    }
  };

  const filteredWorkers = useMemo(() => {
  let filtered = [...workers];

  // SEARCH FILTER
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase().trim();

    filtered = filtered.filter((worker) => {
      const nameMatch = worker.name?.toLowerCase().includes(term);

      const locStr =
        typeof worker.location === "string"
          ? worker.location
          : [
              worker.location?.address,
              worker.location?.locationString,
              worker.location?.city,
              worker.location?.district,
              worker.location?.state,
            ]
              .filter(Boolean)
              .join(" ");

      return nameMatch || locStr.toLowerCase().includes(term);
    });
  }

  if (location?.locationString) {
    const locStringLower = location.locationString.toLowerCase();

    filtered = filtered.filter((worker) => {
      const workerLoc =
        typeof worker.location === "string"
          ? worker.location.toLowerCase()
          : [
              worker.location?.address,
              worker.location?.locationString,
              worker.location?.city,
              worker.location?.district,
              worker.location?.state,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

      const parts = location.locationString.split(",").map(p => p.trim().toLowerCase()).filter(Boolean);
      return (
        workerLoc.includes(locStringLower) ||
        locStringLower.includes(workerLoc) ||
        parts.some(part => workerLoc.includes(part) || part.includes(workerLoc))
      );
    });
  }

  return filtered;
}, [workers, searchTerm, location]);

  const visibleWorkers = useMemo(() => {
    return filteredWorkers.slice(0, visibleCount);
  }, [filteredWorkers, visibleCount]);

 const getCurrentLocation = async () => {
  setLoadingLoc(true);

  try {
    const isNative = window.Capacitor?.isNativePlatform?.();

    // MOBILE APP
    if (isNative) {
      const permission = await Geolocation.requestPermissions();

      if (
        permission.location === "granted" ||
        permission.coarseLocation === "granted"
      ) {
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 0,
        });

        await fetchAddress(
          position.coords.latitude,
          position.coords.longitude
        );

        return;
      }
    }

    // WEBSITE BROWSER GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await fetchAddress(
            position.coords.latitude,
            position.coords.longitude
          );

          setLoadingLoc(false);
        },

        async () => {
          await fetchLocationViaIP();
        },

        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 0,
        }
      );
    } else {
      await fetchLocationViaIP();
    }
  } catch (err) {
    console.log("GPS Error:", err);

    await fetchLocationViaIP();
  } finally {
    setLoadingLoc(false);
  }
};
  const fetchLocationViaIP = async () => {
    try {
      let data = null;

      try {
        const res = await fetch("https://geolocation-db.com/json/");
        if (res.ok) {
          const ipData = await res.json();
          if (ipData && ipData.city && ipData.city !== "Not Found") {
            data = {
              city: ipData.city,
              region: ipData.state || "",
              postal: ipData.postal || "",
              latitude: ipData.latitude,
              longitude: ipData.longitude
            };
          }
        }
      } catch (err) {
        console.log("geolocation-db.com failed, trying freeipapi...", err);
      }

      if (!data || !data.city) {
        try {
          const res = await fetch("https://freeipapi.com/api/json");
          if (res.ok) {
            const ipData = await res.json();
            if (ipData && ipData.cityName) {
              data = {
                city: ipData.cityName,
                region: ipData.regionName,
                postal: ipData.zipCode,
                latitude: ipData.latitude,
                longitude: ipData.longitude
              };
            }
          }
        } catch (err) {
          console.log("freeipapi.com failed, trying ipapi.co...", err);
        }
      }

      if (!data || !data.city) {
        try {
          const res = await fetch("https://ipapi.co/json/");
          if (res.ok) {
            const ipData = await res.json();
            if (ipData && ipData.city) {
              data = {
                city: ipData.city,
                region: ipData.region,
                postal: ipData.postal,
                latitude: ipData.latitude,
                longitude: ipData.longitude
              };
            }
          }
        } catch (err) {
          console.log("ipapi.co failed, trying ipinfo.io...", err);
        }
      }

      if (!data || !data.city) {
        try {
          const res = await fetch("https://ipinfo.io/json");
          if (res.ok) {
            const ipData = await res.json();
            if (ipData && ipData.city) {
              const locParts = (ipData.loc || "").split(",");
              data = {
                city: ipData.city,
                region: ipData.region,
                postal: ipData.postal,
                latitude: parseFloat(locParts[0]) || 0,
                longitude: parseFloat(locParts[1]) || 0
              };
            }
          }
        } catch (err) {
          console.log("ipinfo.io failed", err);
        }
      }

      if (data && data.city) {
        let city = data.city;
        city = city.replace(/\s+District$/i, "").replace(/\s+County$/i, "").trim();
        const state = data.region || "";
        const postcode = data.postal || "";
        const addressText = [city, state, postcode].filter(Boolean).join(", ");
        
        const locationObj = {
          lat: data.latitude,
          lng: data.longitude,
          locationString: addressText,
          link: `https://www.google.com/maps?q=${data.latitude},${data.longitude}`,
        };

        setLocation(locationObj);
        localStorage.setItem("userLocation", JSON.stringify(locationObj));
        showNotification("Location detected successfully!", "success");
      } else {
        showNotification("Unable to detect location automatically", "error");
      }
    } catch (err) {
      showNotification("Unable to detect location automatically", "error");
    } finally {
      setLoadingLoc(false);
    }
  };

  const fetchAddress = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            Accept: "application/json",
            "User-Agent": "FixIt-App/1.0"
          }
        }
      );

      const data = await res.json();
      const addr = data.address || {};

      const resolvedState = addr.state || "";
      const cityVal = addr.city || addr.town || addr.village || addr.municipality || "";
      let districtVal = addr.city_district || addr.county || addr.state_district || "";
      if (districtVal) {
        districtVal = districtVal.replace(/\s+District$/i, "").replace(/\s+County$/i, "").trim();
      }

      const addressParts = [];
      const seen = new Set();
      if (resolvedState) seen.add(resolvedState.toLowerCase());

      const potentialAreas = [
        addr.amenity,
        addr.shop,
        addr.building,
        addr.house_number,
        addr.road,
        addr.suburb,
        addr.neighbourhood,
        addr.residential,
        addr.commercial,
        addr.subdistrict,
        addr.locality,
        addr.hamlet
      ];

      const uniqueAreaParts = [];
      for (const part of potentialAreas) {
        if (part && !seen.has(part.toLowerCase())) {
          // Skip long connecting highway segments or hyphenated strings to keep address clean
          if (part.includes(" - ") || part.length > 35) {
            continue;
          }
          uniqueAreaParts.push(part);
          seen.add(part.toLowerCase());
        }
      }
      const resolvedArea = uniqueAreaParts.slice(0, 2).join(", ");
      if (resolvedArea) addressParts.push(resolvedArea);

      if (cityVal && !seen.has(cityVal.toLowerCase())) {
        addressParts.push(cityVal);
        seen.add(cityVal.toLowerCase());
      }

      if (districtVal && !seen.has(districtVal.toLowerCase())) {
        addressParts.push(districtVal);
        seen.add(districtVal.toLowerCase());
      }

      if (resolvedState) {
        addressParts.push(resolvedState);
      }

      if (addr.postcode) {
        addressParts.push(addr.postcode);
      }

      let addressText = addressParts.join(", ");

      if (!addressText) {
        addressText = data.display_name || `${lat}, ${lng}`;
      }

      const locationObj = {
        lat,
        lng,
        locationString: addressText,
        link: `https://www.google.com/maps?q=${lat},${lng}`,
      };

      setLocation(locationObj);
      localStorage.setItem("userLocation", JSON.stringify(locationObj));

      showNotification("Location detected successfully!", "success");
    } catch (error) {
      showNotification("Failed to fetch address", "error");
    } finally {
      setLoadingLoc(false);
    }
  };

  const sendOtp = async () => {
    if (!selected || !name || !serviceType || phone.length < 10 || !location) {
      showNotification("Fill all details properly", "error");
      return;
    }

    setSendingOtp(true);

    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const baseUrl = isLocal ? "http://localhost:5005" : "https://fixit-app-w0dp.onrender.com";

    try {
      const res = await axios.post(
        `${baseUrl}/api/otp/send-otp`,
        { phone }
      );

      if (res.data.success) {
        setOtpStep(true);
        setResendCooldown(30);
        showNotification("OTP sent", "success");
      }
    } catch {
      showNotification("OTP send failed", "error");
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    setVerifyingOtp(true);

    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const baseUrl = isLocal ? "http://localhost:5005" : "https://fixit-app-w0dp.onrender.com";

    try {
      const res = await axios.post(
        `${baseUrl}/api/otp/verify-otp`,
        { phone, otp }
      );

      if (!res.data.success) {
        showNotification("Invalid OTP", "error");
        return;
      }

      const success = await handleBookingAndNotify({
        name,
        phone,
        serviceType,
        location: location.locationString,
        selected,
      });

      if (success) {
        sendWhatsAppMessage(selected.phone, name, serviceType);

        setOtpStep(false);
        setSelected(null);
        setName("");
        setPhone("");
        setServiceType("");
        setOtp("");

        showNotification("Booking Confirmed!", "success");
      }
    } catch {
      showNotification("Booking failed", "error");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleQuerySubmit = async () => {
    if (
      !queryForm.userName ||
      !queryForm.workerName ||
      !queryForm.serviceCategory ||
      !queryForm.query
    ) {
      showNotification("Please fill all query fields", "error");
      return;
    }

    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const baseUrl = isLocal ? "http://localhost:5005" : "https://fixit-app-w0dp.onrender.com";

    try {
      const res = await fetch(`${baseUrl}/api/queries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(queryForm),
      });

      const data = await res.json();

      if (data.success) {
        showNotification("Query Raised Successfully!", "success");
        setShowQueryPopup(false);
        setQueryForm({
          userName: "",
          workerName: "",
          serviceCategory: "",
          query: "",
        });
      } else {
        showNotification(data.message || "Failed to submit query", "error");
      }
    } catch (error) {
      console.error("Error submitting query:", error);
      showNotification("Server error, failed to submit query.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-3 right-3 sm:top-5 sm:right-5 z-50 w-[90%] sm:w-auto rounded-2xl shadow-2xl p-4 flex items-center gap-3 ${
              notification.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
            }`}
          >
            <FaCheckCircle className="text-xl shrink-0" />
            <span className="text-sm sm:text-base font-semibold">{notification.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative bg-gradient-to-r from-emerald-700 to-teal-700 text-white p-6 sm:p-10 md:p-12 overflow-hidden text-center shadow-md">
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight"
        >
          FIX<span className="text-emerald-300">IT</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-emerald-100 mt-2 text-sm sm:text-base md:text-lg font-medium"
        >
          {subtitle || "Professional Services Instantly"}
        </motion.p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        

        <div className="lg:col-span-7">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
              <FaUser className="text-emerald-600" /> Choose Expert
            </h2>

            <button
              onClick={() => setOpenSearch(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold w-full sm:w-auto shadow-md transition duration-200"
            >
              Search All
            </button>
          </div>

          <div className="relative mb-6">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
            <input
              className="w-full pl-11 pr-4 py-3 sm:py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none text-sm sm:text-base shadow-sm transition"
              placeholder="Search expert or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-4 max-h-[450px] sm:max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {loadingWorkers ? (
              <div className="text-center py-12">
                <FaSpinner className="animate-spin text-3xl sm:text-4xl text-emerald-500 mx-auto" />
                <p className="text-slate-500 mt-2 font-medium">Finding available experts...</p>
              </div>
            ) : visibleWorkers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <p className="text-slate-500 font-semibold">No experts found matching your search.</p>
              </div>
            ) : (
              visibleWorkers.map((w) => {
                const isSelected = selected?._id === w._id;
const locationAddress =
  typeof w.location === "string"
    ? w.location
    : [
        w.location?.address,
        w.location?.locationString,
        w.location?.city,
        w.location?.district,
        w.location?.state,
      ]
        .filter(Boolean)
        .join(", ") || "Local Expert";                const phoneNum = w.phone || w.mobile || "N/A";

                return (
                  <motion.div
                    key={w._id}
                    onClick={() => {
                      setSelected({ ...w, phone: phoneNum });
                      openReviews(w);
                    }}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`p-4 sm:p-5 rounded-2xl cursor-pointer border transition-all duration-200 ${
                      isSelected
                        ? "bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-200 shadow-md"
                        : "bg-white border-slate-100 shadow-sm hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="relative flex items-center gap-3 shrink-0">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg shadow-sm">
                          {w.name?.[0]?.toUpperCase()}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <h3 className="font-bold text-base sm:text-lg text-slate-800 flex items-center gap-1.5">
                            {w.name}
                            {isSelected && <MdOutlineVerified className="text-emerald-500 text-lg" />}
                          </h3>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                          <FaMapMarkerAlt className="text-emerald-500" /> {locationAddress}
                        </p>

                        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                          <FaPhone className="text-emerald-500" /> {phoneNum}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setQueryForm({
                              userName: name, // use quick book name if present
                              workerName: w.name || "",
                              serviceCategory: serviceName || "",
                              query: ""
                            });
                            setShowQueryPopup(true);
                          }}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition shadow-sm flex items-center gap-1"
                        >
                          <FaQuestionCircle /> Query
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openReviews(w);
                          }}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition shadow-sm flex items-center gap-1"
                        >
                          ⭐ Review
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}

            {visibleCount < filteredWorkers.length && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 5)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs sm:text-sm transition shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  Load More Workers
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-6 border border-emerald-50">
            <div className="bg-emerald-600 p-4 sm:p-5 text-white text-center font-bold shadow-sm flex items-center justify-center gap-2">
              <FaPaperPlane className="text-lg" />
              <h2 className="text-lg sm:text-xl font-bold">Quick Booking</h2>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Your Name</label>
                <input
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none text-sm sm:text-base focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Select Service Type</label>
                <select
                  className="w-full p-3 rounded-xl border border-gray-200 bg-white outline-none text-sm sm:text-base focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                >
                  <option value="">Select Service Type</option>
                  {serviceOptions.map((opt, idx) => (
                    <option key={idx} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Mobile Number</label>
                <input
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none text-sm sm:text-base focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition"
                  placeholder="Enter 10-digit phone"
                  value={phone}
                  maxLength={10}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  disabled={otpStep}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Your Location</label>
               <div className="flex gap-2 items-center">
  <div className="relative flex-1">
    <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 text-base" />

    <input
      className="w-full pl-10 pr-3 p-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-emerald-200 transition"
      placeholder="Street / Locality address..."
      value={location?.locationString ?? ""}
      onChange={(e) =>
        setLocation((prev) => ({
          ...prev,
          locationString: e.target.value
        }))
      }
    />
  </div>

  <button
    onClick={getCurrentLocation}
    disabled={loadingLoc}
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center shrink-0 transition shadow-sm"
  >
    {loadingLoc ? "Loading..." : "Get Location"}
  </button>
</div>
              </div>

              {selected && (
                <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-100 flex items-center justify-between gap-3 text-xs sm:text-sm animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      {selected.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <span className="text-slate-500">Selected Expert</span>
                      <p className="font-bold text-slate-800">{selected.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-red-500 font-bold hover:text-red-600 transition"
                  >
                    Change
                  </button>
                </div>
              )}

              {!otpStep ? (
                <button
                  onClick={sendOtp}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white p-3.5 rounded-xl font-bold text-sm sm:text-base shadow-md transition duration-200 flex items-center justify-center gap-2"
                  disabled={!selected || sendingOtp}
                >
                  {sendingOtp ? <FaSpinner className="animate-spin" /> : <FaCheck className="text-sm" />}
                  {sendingOtp ? "Sending OTP..." : "Send OTP to Book"}
                </button>
              ) : (
                <div className="space-y-4 pt-2 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider text-center">Enter Verification OTP</label>
                    <input
                      className="w-full p-3.5 rounded-xl border-2 border-emerald-500 text-center font-mono text-xl sm:text-2xl tracking-widest outline-none focus:ring-4 focus:ring-emerald-100 transition"
                      placeholder="Enter OTP"
                      value={otp}
                      maxLength={6}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={verifyOtp}
                    disabled={verifyingOtp}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white p-3.5 rounded-xl font-bold text-sm sm:text-base shadow-md transition duration-200 flex items-center justify-center gap-2"
                  >
                    {verifyingOtp ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                    {verifyingOtp ? "Verifying..." : "Verify & Confirm Booking"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      <WorkerSearch
        serviceName={serviceName}
        isOpen={openSearch}
        onClose={() => setOpenSearch(false)}
        onBookWorker={(w) => {
          setSelected(w);
          setOpenSearch(false);
        }}
        onQueryWorker={(w) => {
          setQueryForm({
            userName: name, // use typed name if present
            workerName: w.name || "",
            serviceCategory: w.service || serviceName || "",
            query: ""
          });
          setOpenSearch(false); // Close search overlay
          setShowQueryPopup(true); // Open modal
        }}
        onReviewWorker={(w) => {
          setOpenSearch(false);
          openReviews(w);
        }}
      />

      {/* Inline Query Modal */}
      {showQueryPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-fadeIn">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative border border-emerald-50"
          >
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaQuestionCircle /> Raise a Query
              </h2>
              <button 
                onClick={() => setShowQueryPopup(false)}
                className="p-1 rounded-full hover:bg-white/20 transition"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Your Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={queryForm.userName}
                  onChange={(e) => setQueryForm({ ...queryForm, userName: e.target.value })}
                  className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-200 transition text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Worker Name</label>
                <input
                  type="text"
                  readOnly
                  value={queryForm.workerName}
                  className="w-full border border-slate-100 bg-slate-50 p-3 rounded-xl text-slate-600 font-medium text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Service Category</label>
                <input
                  type="text"
                  readOnly
                  value={queryForm.serviceCategory}
                  className="w-full border border-slate-100 bg-slate-50 p-3 rounded-xl text-slate-600 font-medium text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Describe Query</label>
                <textarea
                  placeholder="Tell us how we can help you..."
                  value={queryForm.query}
                  onChange={(e) => setQueryForm({ ...queryForm, query: e.target.value })}
                  className="w-full border border-slate-200 p-3 rounded-xl h-28 resize-none outline-none focus:ring-2 focus:ring-emerald-200 transition text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowQueryPopup(false)}
                  className="w-1/2 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleQuerySubmit}
                  className="w-1/2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-200 transition text-sm flex items-center justify-center gap-2"
                >
                  <FaCheck /> Submit
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reviews Popup Modal */}
      {showReviewsPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-fadeIn">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden relative border border-emerald-100"
          >
            <div className="bg-gradient-to-r from-green-600 to-teal-600 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <FaStar className="text-2xl text-emerald-200" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-wide">Customer Reviews</h2>
                  <p className="text-xs opacity-90 font-medium">{reviewWorker?.name || "Expert"}</p>
                </div>
              </div>
              <button
                onClick={() => setShowReviewsPopup(false)}
                className="p-2 rounded-full bg-black/10 hover:bg-black/20 transition text-white"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto">
              {loadingReviews ? (
                <div className="py-20 text-center space-y-3">
                  <FaSpinner className="animate-spin text-4xl text-emerald-500 mx-auto" />
                  <p className="text-slate-500 font-medium animate-pulse">Loading feedbacks...</p>
                </div>
              ) : !reviewWorker?.email ? (
                <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                   <p className="text-slate-500 font-medium">Detailed profile not available for this worker yet.</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                   <FaQuoteLeft className="text-slate-200 text-5xl mx-auto mb-3" />
                   <p className="text-slate-600 font-bold text-lg">No reviews yet</p>
                   <p className="text-slate-400 text-sm">Be the first one to work with them!</p>
                </div>
              ) : (
                <div className="overflow-hidden border border-slate-100 rounded-2xl shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 text-sm border-b">
                          <th className="p-4 font-bold">Customer</th>
                          <th className="p-4 font-bold text-center">Rating</th>
                          <th className="p-4 font-bold">Date</th>
                          <th className="p-4 font-bold">Feedback</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reviews.map((fb) => (
                          <tr key={fb._id} className="hover:bg-emerald-50/30 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <FaUserCircle className="text-2xl text-slate-400" />
                                <span className="font-bold text-slate-700 text-sm">{fb.customerName}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col items-center">
                                <div className="flex text-xs">{renderStars(Number(fb.rating))}</div>
                                <span className="text-[10px] mt-0.5 font-bold text-slate-500">{fb.rating}/5</span>
                              </div>
                            </td>
                            <td className="p-4 text-xs text-slate-500 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <FaCalendarAlt className="text-slate-300" />
                                {new Date(fb.createdAt).toLocaleDateString("en-IN")}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="relative pl-4">
                                <FaQuoteLeft className="absolute top-0 left-0 text-slate-200 text-[10px]" />
                                <p className="text-slate-600 italic text-sm leading-relaxed line-clamp-3">{fb.comment}</p>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
