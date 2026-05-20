import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { sendWhatsAppMessage } from "../../App/Whatsapp";
import { handleBookingAndNotify } from "../../App/Message";
import WorkerSearch from "../../App/WorkerSearch";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "../../config";
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
  FaUserCircle,
  FaCommentDots,
  FaLightbulb,
  FaTools,
  FaChevronDown,
  FaMicrophone,
  FaHistory,
} from "react-icons/fa";
import { MdOutlineVerified } from "react-icons/md";





function DiagnosisModal({ isOpen, onClose, issue, diagnosis, loading }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1100] p-4">
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 30 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-emerald-100"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <FaLightbulb className="text-2xl text-emerald-100" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide">AI Issue Diagnosis</h2>
              <p className="text-xs text-emerald-100 font-medium truncate max-w-[200px]">{issue}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/10 hover:bg-black/25 transition"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <FaSpinner className="animate-spin text-4xl text-emerald-500" />
              <p className="text-slate-500 font-semibold text-sm animate-pulse">Analysing your issue with AI...</p>
            </div>
          ) : diagnosis ? (
            <>
              {/* Possible Causes */}
              <div>
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-[10px] font-black">!</span>
                  Possible Causes
                </h3>
                <ul className="space-y-2">
                  {diagnosis.causes.map((c, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {i + 1}
                      </span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Service */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <FaTools className="text-emerald-500" /> Recommended Service
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">{diagnosis.service}</p>
              </div>

              {/* CTA */}
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-200 transition flex items-center justify-center gap-2"
              >
                <FaCheck /> Got it — Book a Service
              </button>
            </>
          ) : (
            <div className="py-10 text-center text-slate-400 text-sm">
              No diagnosis available. Please try again.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
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
  const [recentWorkers, setRecentWorkers] = useState([]);
  const [email, setEmail] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        return parsed.email || "";
      }
    } catch (e) {
      console.error("Error reading email from localStorage:", e);
    }
    return "";
  });
  const [name, setName] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        return parsed.name || "";
      }
    } catch (e) {
      console.error("Error reading name from localStorage:", e);
    }
    return "";
  });
  const [phone, setPhone] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        return parsed.phone || parsed.mobile || "";
      }
    } catch (e) {
      console.error("Error reading phone from localStorage:", e);
    }
    return "";
  });
  const [serviceType, setServiceType] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
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

  const fetchRecentWorkers = async () => {
    try {
      if (!phone && !name) return;
      const queryParams = new URLSearchParams();
      if (phone) queryParams.append("phone", phone);
      if (name) queryParams.append("name", name);

      const res = await fetch(`${API_BASE_URL}/api/bookings/user?${queryParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        setRecentWorkers(data.recentWorkers || []);
      }
    } catch (err) {
      console.error("Error fetching recent workers:", err);
    }
  };

  useEffect(() => {
    fetchRecentWorkers();
  }, [phone, name]);

  const [loadingLoc, setLoadingLoc] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [notification, setNotification] = useState(null);
  const [openSearch, setOpenSearch] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState(null);
const [diagnosisLoading, setDiagnosisLoading] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showQueryPopup, setShowQueryPopup] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showNotification("Your browser does not support Speech Recognition. Please try Chrome or Edge.", "error");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      showNotification("Listening... Speak your issue now.", "success");
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      console.log("[SpeechRecognition] result:", speechToText);
      setServiceType(speechToText);
      showNotification(`Recognized: "${speechToText}"`, "success");
    };

    recognition.onerror = (event) => {
      console.error("[SpeechRecognition] error:", event.error);
      setIsListening(false);
      showNotification(`Speech recognition error: ${event.error}`, "error");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };
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
      const baseUrl = API_BASE_URL;
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

  const fetchWorkers = async (retryCount = 0) => {
    const baseUrl = API_BASE_URL;
    if (retryCount === 0) setLoadingWorkers(true);
    
    try {
      const targetUrl = `${baseUrl}/api/workers/by-service/${encodeURIComponent(serviceName)}`;
      console.log(`API Request [Try ${retryCount + 1}]:`, targetUrl);

      const response = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        }
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();

      if (data && data.success) {
        const activeWorkers = (data.workers || []).filter(
          (w) => ["active", "approved"].includes(w.status?.toLowerCase())
        );
        setWorkers(activeWorkers);
        setLoadingWorkers(false);
      } else {
        setWorkers([]);
        setLoadingWorkers(false);
      }
    } catch (err) {
      console.error(`Fetch workers error [Try ${retryCount + 1}]:`, err);
      
      // Render Free-tier cold start auto-retry (3 seconds delay gives it time to wake up)
      if (retryCount < 1) {
        showNotification("Waking up server, please wait 3 seconds...", "info");
        setTimeout(() => fetchWorkers(retryCount + 1), 3000);
      } else {
        setWorkers([]);
        setLoadingWorkers(false);
        
        // Expose dynamic technical details in case of local network / SSL issues
        const errMsg = err.message || "Network Failure";
        showNotification(`Failed to load workers: ${errMsg}`, "error");
      }
    }
  };

  const filteredWorkers = useMemo(() => {
  let filtered = [...workers];

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

return (
  nameMatch ||
  (locStr || "").toLowerCase().includes(term)
);    });
  }

  if (location?.locationString) {
    const locStringLower = location.locationString.toLowerCase();

    const locFiltered = filtered.filter((worker) => {
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

    if (locFiltered.length > 0) {
      filtered = locFiltered;
    }
  }

  // Ensure Online workers are sorted to the top
  filtered.sort((a, b) => {
    const aOnline = a.isOnline === true;
    const bOnline = b.isOnline === true;
    if (aOnline === bOnline) return 0;
    return aOnline ? -1 : 1;
  });

  return filtered;
}, [workers, searchTerm, location]);

  const visibleWorkers = useMemo(() => {
    return filteredWorkers.slice(0, visibleCount);
  }, [filteredWorkers, visibleCount]);

  const useSavedLocation = () => {
    try {
      const storedUserStr = localStorage.getItem("user");
      if (!storedUserStr) {
        showNotification("Please Login to your account first to use this feature!", "error");
        return;
      }
      
      const storedUser = JSON.parse(storedUserStr);
      const userAddress = storedUser.address || storedUser.location;
      
      if (userAddress) {
        const locationObj = {
          lat: null,
          lng: null,
          locationString: userAddress,
          link: `https://www.google.com/maps?q=${encodeURIComponent(userAddress)}`,
        };
        setLocation(locationObj);
        localStorage.setItem("userLocation", JSON.stringify(locationObj));
        showNotification("Exact location fetched from your database profile!", "success");
      } else {
        showNotification("No address found in your database profile.", "error");
      }
    } catch (err) {
      showNotification("Error fetching saved location", "error");
    }
  };

const getCurrentLocation = async () => {
  try {
    setLoadingLoc(true);

    if (!navigator.geolocation) {
      showNotification("Geolocation not supported in this browser", "error");
      setLoadingLoc(false);
      return;
    }

    showNotification("Fetching exact location...", "info");

    const getPosition = (options) => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });
    };

    let position;
    try {
      position = await getPosition({ enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
    } catch (err) {
      if (err.code === 1) { // PERMISSION_DENIED
        showNotification("Location permission denied. Please allow access.", "error");
        setLoadingLoc(false);
        return;
      }
      try {
        position = await getPosition({ enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 });
      } catch (err2) {
        try {
          position = await getPosition({ enableHighAccuracy: false, timeout: 2000, maximumAge: Infinity });
        } catch (err3) {
          try {
            const storedUserStr = localStorage.getItem("user");
            if (storedUserStr) {
              const storedUser = JSON.parse(storedUserStr);
              if (storedUser && storedUser.address) {
                const locationObj = {
                  lat: null,
                  lng: null,
                  locationString: storedUser.address,
                  link: `https://www.google.com/maps?q=${encodeURIComponent(storedUser.address)}`,
                };
                setLocation(locationObj);
                localStorage.setItem("userLocation", JSON.stringify(locationObj));
                showNotification("Exact location fetched from profile!", "success");
                setLoadingLoc(false);
                return;
              }
            }
          } catch (e) {
          }

          try {
            showNotification("Using network area. (Use a phone for exact address)", "info");
            const res = await fetch("https://ipapi.co/json/");
            if (res.ok) {
              const data = await res.json();
              if (data.latitude && data.longitude) {
                await fetchAddress(data.latitude, data.longitude);
                return;
              }
            }
          
            const res2 = await fetch("https://ipinfo.io/json");
            if (res2.ok) {
              const data2 = await res2.json();
              if (data2.loc) {
                const [lat, lng] = data2.loc.split(',');
                await fetchAddress(parseFloat(lat), parseFloat(lng));
                return;
              }
            }
            throw new Error("IP location failed");
          } catch (ipErr) {
            showNotification("Unable to fetch exact location. Enter manually.", "error");
            setLoadingLoc(false);
            return;
          }
        }
      }
    }

    if (position && position.coords) {
      const { latitude, longitude } = position.coords;
      await fetchAddress(latitude, longitude);
    }
  } catch (err) {
    console.error(err);
    showNotification("Failed to fetch current location", "error");
    setLoadingLoc(false);
  }
};

const fetchAddress = async (lat, lng) => {
  try {
    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      }
    );

    clearTimeout(timeoutId);

    const data = await res.json();

    if (!data || !data.address) {
      showNotification("Address not found", "error");
      return;
    }

    const addr = data.address;

    const road = addr.road || addr.pedestrian || "";
    const suburb = addr.suburb || addr.neighbourhood || addr.residential || "";
    const city = addr.city || addr.town || addr.village || addr.municipality || "";
    const postcode = addr.postcode || "";

    let parts = [road, suburb, city, postcode].filter(Boolean);
    
    parts = [...new Set(parts)];
    
    const finalAddress = parts.join(", ");

    const locationObj = {
      lat,
      lng,
      locationString: finalAddress || data.display_name,
      link: `https://www.google.com/maps?q=${lat},${lng}`,
    };

    setLocation(locationObj);

    localStorage.setItem(
      "userLocation",
      JSON.stringify(locationObj)
    );

    showNotification("Current location fetched successfully!", "success");

  } catch (err) {

    if (err.name === "AbortError") {
      showNotification("Address fetch timeout", "error");
    } else {
      showNotification("Failed to fetch address", "error");
    }

    console.error(err);

  } finally {
    setLoadingLoc(false);
  }
};


const CLIENT_DIAGNOSIS = [
  { keywords: ["cockroach","pest","termite","mosquito","rodent","rat","bedbug","insect"],
    causes: ["Food residue in cracks","Moisture near sink/pipes","Entry from neighbouring units"],
    service: "Pest Control Service — professional treatment with gel-bait, spray, or fogging.",
    urgency: "High" },
  { keywords: ["fan installation"],
    causes: ["Loose wiring connections","Faulty ceiling mount bracket","Wrong voltage supply"],
    service: "Electrical Repair — fan installation by licensed electrician.",
    urgency: "Medium" },
  { keywords: ["fan"],
    causes: ["Capacitor failure","Worn motor bearings","Loose blade screws"],
    service: "Electrical Repair — fan capacitor/motor replacement and balancing.",
    urgency: "Low" },
  { keywords: ["light fitting","light","switchboard","wiring","electrical","circuit"],
    causes: ["Loose neutral wire","Short circuit","Overloaded circuit"],
    service: "Electrical Repair — wiring inspection, fitting replacement by certified electrician.",
    urgency: "Medium" },
  { keywords: ["pipe replacement","pipe","leak","plumbing","bathroom fitting","water tank","tap"],
    causes: ["Corroded pipe joints","Worn rubber seals","High water pressure"],
    service: "Plumbing Service — leak repair, pipe assessment, and fitting replacement.",
    urgency: "High" },
  { keywords: ["ac installation"],
    causes: ["Wrong bracket placement","Refrigerant line routing issue","Drain pipe slope"],
    service: "AC Service — professional installation with refrigerant line setup.",
    urgency: "Low" },
  { keywords: ["cooling","gas refill","compressor","air conditioner","ac"],
    causes: ["Low refrigerant (gas leak)","Dirty air filter","Faulty compressor"],
    service: "AC Service — gas top-up, filter cleaning, and compressor diagnostics.",
    urgency: "High" },
  { keywords: ["furniture","door","window","carpentry","woodwork","modular kitchen"],
    causes: ["Joint separation","Moisture warping","Hinge/slider failure"],
    service: "Carpentry Service — furniture repair, woodwork, and fixture replacement.",
    urgency: "Low" },
  { keywords: ["sofa","carpet","deep clean","home clean","cleaning"],
    causes: ["Dust mite accumulation","Stain penetration","Long gap since last cleaning"],
    service: "Cleaning Service — deep cleaning, hot-water extraction, and sanitisation.",
    urgency: "Low" },
];

function getClientDiagnosis(issue) {
  const lower = issue.toLowerCase();
  for (const entry of CLIENT_DIAGNOSIS) {
    if (entry.keywords.some((kw) => {
      const esc = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`(?<![a-z])${esc}(?![a-z])`, "i").test(lower);
    })) {
      return { causes: entry.causes, service: entry.service, urgency: entry.urgency };
    }
  }
  return {
    causes: ["Wear and tear over time","Improper previous installation","Environmental factors (dust, moisture)"],
    service: "A professional will inspect on-site and recommend the appropriate fix.",
    urgency: "Medium",
  };
}

const getAIDiagnosis = async () => {
  if (diagnosisLoading) return;
  if (!serviceType || serviceType.trim() === "") {
    showNotification("Please select your issue first", "error");
    return;
  }

  setDiagnosisLoading(true);
  setShowDiagnosis(true); // open modal immediately with loading spinner

  const targetUrl = `${API_BASE_URL}/api/diagnose`;
  console.log("[Diagnosis] Requesting AI diagnosis from API URL:", targetUrl);
  console.log("[Diagnosis] Issue description payload:", serviceType);

  try {
    const res = await axios.post(
      targetUrl,
      { issue: serviceType },
      { timeout: 12000 } // 12s timeout — handles Render cold start
    );

    console.log("[Diagnosis] Backend response received:", res.data);

    if (res.data && res.data.success) {
      setAiDiagnosis(res.data.diagnosis);
    } else {
      console.error("[Diagnosis] Backend returned success: false or invalid response format", res.data);
      showNotification(res.data?.message || "Failed to load AI diagnosis", "error");
    }
  } catch (error) {
    console.error("[Diagnosis] AI API unreachable or failed completely:", error.message);
    console.warn("[Diagnosis] Falling back to local Client Diagnosis.");
    setAiDiagnosis(getClientDiagnosis(serviceType));
  } finally {
    setDiagnosisLoading(false);
  }
};



  const sendOtp = async () => {
    if (!selected || !name || !serviceType || !email || !location || !bookingDate || !bookingTime) {
      showNotification("Fill all details properly", "error");
      return;
    }

    const selectedDate = new Date(`${bookingDate}T${bookingTime}`);
    if (selectedDate < new Date()) {
      showNotification("Cannot select a past date or time", "error");
      return;
    }

    setSendingOtp(true);

    const baseUrl = API_BASE_URL;

    try {
      const res = await axios.post(
        `${baseUrl}/api/otp/send-otp`,
        { email }
      );

      if (res.data.success) {
        setOtpStep(true);
        setResendCooldown(30);
        showNotification("OTP sent", "success");
      } else {
        showNotification(res.data.message || "Failed to send OTP", "error");
      }
    } catch {
      showNotification("OTP send failed", "error");
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    setVerifyingOtp(true);

    const baseUrl = API_BASE_URL;

    try {
      const res = await axios.post(
        `${baseUrl}/api/otp/verify-otp`,
        { email, otp }
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
        bookingDate,
        bookingTime,
        geoLocation: location.lat && location.lng ? { lat: location.lat, lng: location.lng } : undefined,
        selected,
      });

      if (success) {
        sendWhatsAppMessage(selected.phone, name, serviceType, bookingDate, bookingTime, location.locationString);

        setOtpStep(false);
        setSelected(null);
        fetchRecentWorkers();
        try {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setName(parsed.name || "");
            setPhone(parsed.phone || parsed.mobile || "");
            setEmail(parsed.email || "");
          } else {
            setName("");
            setPhone("");
            setEmail("");
          }
        } catch (e) {
          setName("");
          setPhone("");
          setEmail("");
        }
        setServiceType("");
        setBookingDate("");
        setBookingTime("");
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

    const baseUrl = API_BASE_URL;

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

          {/* RECENTLY BOOKED EXPERTS */}
          {recentWorkers && recentWorkers.length > 0 ? (
            <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm animate-fade-in">
              <h3 className="text-xs font-black text-slate-500 tracking-wider uppercase mb-3 flex items-center gap-1.5">
                <FaHistory className="text-emerald-600 animate-pulse text-sm" /> Your Recent Bookings
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-2 scroll-smooth custom-scrollbar">
                {recentWorkers.map((w) => (
                  <motion.div
                    key={w._id}
                    onClick={() => {
                      setSelected(w);
                      localStorage.setItem("selectedWorker", JSON.stringify(w));
                      navigate("/viewprofile");
                    }}
                    whileHover={{ y: -3, scale: 1.02 }}
                    className="flex-shrink-0 w-60 bg-white border border-slate-200/65 p-4 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                        {w.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm truncate">{w.name}</h4>
                        <p className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded inline-block mt-0.5">{w.service}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1 text-slate-500">
                      <p className="text-xs font-semibold flex items-center gap-1.5 truncate">
                        <FaPhone className="text-emerald-500 text-[10px]" /> {w.phone}
                      </p>
                      <p className="text-xs font-semibold flex items-center gap-1.5 truncate">
                        <FaMapMarkerAlt className="text-emerald-500 text-[10px]" /> {w.location || "Local Expert"}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-6 bg-slate-50/50 p-4 rounded-2xl border border-dashed border-slate-200 text-center">
              <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase mb-1.5 flex items-center justify-center gap-1.5">
                <FaHistory className="text-slate-400 text-sm" /> Your Recent Bookings
              </h3>
              <p className="text-xs text-slate-400 font-medium">You haven't booked any experts yet. Once you make a booking, they will appear here!</p>
            </div>
          )}

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
        .join(", ") || "Local Expert";       
        
        const phoneNum = w.phone || w.mobile || "N/A";
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
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-bold text-base sm:text-lg text-slate-800 flex items-center gap-1.5">
                            {w.name}
                            {isSelected && <MdOutlineVerified className="text-emerald-500 text-lg" />}
                          </h3>
                          <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full border shadow-sm ${
                            w.isOnline === true 
                              ? "bg-green-50 text-green-600 border-green-200" 
                              : "bg-red-50 text-red-500 border-red-200"
                          }`}>
                            {w.isOnline === true ? "🟢 Online" : "🔴 Offline"}
                          </span>
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
                          <FaQuestionCircle /> Report
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            localStorage.setItem("selectedWorker", JSON.stringify(w));
                            navigate("/viewprofile");
                          }}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition shadow-sm flex items-center gap-1"
                        >
                          <FaUser /> View Profile
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
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Select / Describe Your Issue</label>
                {/* ── Combo-box: dropdown + editable input ── */}
                <div className="relative">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-200 focus-within:border-emerald-500 transition">
                    {/* Editable text input */}
                    <input
                      id="service-type-select"
                      type="text"
                      value={serviceType}
                      onChange={(e) => {
                        console.log("[Diagnose] serviceType typed:", e.target.value);
                        setServiceType(e.target.value);
                        setShowServiceDropdown(true);
                      }}
                      onFocus={() => setShowServiceDropdown(true)}
                      onBlur={() => setTimeout(() => setShowServiceDropdown(false), 150)}
                      placeholder="Select or type your issue…"
                      className="flex-1 p-3 text-sm sm:text-base outline-none bg-white text-slate-700 placeholder-gray-400"
                    />
                    {/* Speech recognition mic button */}
                    <button
                      type="button"
                      onClick={startListening}
                      className={`px-3.5 py-3 border-l border-gray-200 transition-all duration-300 flex items-center justify-center ${
                        isListening
                          ? "text-red-600 bg-red-50 animate-pulse scale-105 font-bold"
                          : "text-slate-400 hover:text-emerald-600 hover:bg-slate-50 bg-gray-50"
                      }`}
                      title="Speak your issue"
                    >
                      <FaMicrophone className={`${isListening ? "scale-125 text-red-600" : "text-slate-500 hover:text-emerald-600"}`} />
                    </button>
                    {/* Dropdown arrow toggle */}
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); setShowServiceDropdown((p) => !p); }}
                      className="px-3 py-3 text-gray-400 hover:text-emerald-600 bg-gray-50 border-l border-gray-200 transition"
                    >
                      <FaChevronDown className={`text-xs transition-transform duration-200 ${showServiceDropdown ? "rotate-180" : ""}`} />
                    </button>
                    {/* Clear button */}
                    {serviceType && (
                      <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); setServiceType(""); setShowServiceDropdown(false); }}
                        className="px-3 py-3 text-gray-400 hover:text-red-500 bg-gray-50 border-l border-gray-200 transition text-xs font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Dropdown suggestion list */}
                  {showServiceDropdown && serviceOptions.length > 0 && (
                    <ul className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 z-20 max-h-48 overflow-y-auto">
                      {serviceOptions
                        .filter((opt) =>
                          opt.toLowerCase().includes(serviceType.toLowerCase())
                        )
                        .map((opt, idx) => (
                          <li
                            key={idx}
                            onMouseDown={() => {
                              console.log("[Diagnose] serviceType selected:", opt);
                              setServiceType(opt);
                              setShowServiceDropdown(false);
                            }}
                            className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                              serviceType === opt
                                ? "bg-emerald-500 text-white font-semibold"
                                : "hover:bg-emerald-50 text-slate-700"
                            }`}
                          >
                            {opt}
                          </li>
                        ))}
                      {/* Custom input indicator */}
                      {serviceType &&
                        !serviceOptions.some(
                          (o) => o.toLowerCase() === serviceType.toLowerCase()
                        ) && (
                          <li className="px-4 py-2.5 text-sm text-emerald-700 font-medium bg-emerald-50 border-t border-emerald-100 cursor-default">
                            🔍 Using custom: &quot;{serviceType}&quot;
                          </li>
                        )}
                    </ul>
                  )}
                </div>

                <button
                  type="button"
                  onClick={getAIDiagnosis}
                  className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                >
                  {diagnosisLoading
                    ? <FaSpinner className="animate-spin" />
                    : <FaLightbulb />}
                  {diagnosisLoading ? "Diagnosing..." : "Diagnose My Issue"}
                </button>
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
  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
    Email Address
  </label>

  <input
    type="email"
    className="w-full p-3 rounded-xl border border-gray-200 outline-none text-sm sm:text-base focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition"
    placeholder="Enter your email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    disabled={otpStep}
  />
</div>



              <div>
  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
     Preferred Date & Time
  </label>

  <div className="grid grid-cols-2 gap-3">

    <input
      type="date"
      value={bookingDate}
      onChange={(e) => setBookingDate(e.target.value)}
      className="w-full p-3 rounded-xl border border-gray-200 outline-none"
    />

    <input
      type="time"
       value={bookingTime}
    onChange={(e) => setBookingTime(e.target.value)}
      className="w-full p-3 rounded-xl border border-gray-200 outline-none"
    />

  </div>
</div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Your Location</label>
               <div className="flex gap-2 items-center">
  <div className="relative flex-1">
    <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 text-base" />

   <input
  className="w-full pl-10 pr-3 p-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-emerald-200 transition"
  placeholder="Street / Locality address..."
  list="local-areas"
  value={location?.locationString ?? ""}
  onChange={(e) =>
    setLocation((prev) => ({
      ...(prev || {}),
      locationString: e.target.value,
    }))
  }
/>
    <datalist id="local-areas">
      <option value="JJ Nagar, Reddiarpatti, Tirunelveli" />
      <option value="Palayamkottai, Tirunelveli" />
      <option value="Reddiarpatti, Tirunelveli" />
      <option value="Vannarpettai, Tirunelveli" />
      <option value="Tirunelveli Junction" />
      <option value="Tirunelveli Town" />
      <option value="Melapalayam, Tirunelveli" />
      <option value="Pettai, Tirunelveli" />
      <option value="Tirunelveli, Tamil Nadu" />
      <option value="Madurai, Tamil Nadu" />
    </datalist>
  </div>

  <div className="flex flex-col sm:flex-row gap-2 shrink-0">
    <button
      onClick={useSavedLocation}
      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center transition shadow-sm whitespace-nowrap"
      title="Fetch address from your profile"
    >
      Saved Loc
    </button>
    <button
      onClick={getCurrentLocation}
      disabled={loadingLoc}
      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center transition shadow-sm whitespace-nowrap"
    >
      {loadingLoc ? "..." : "Get GPS"}
    </button>
  </div>
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
            userName: name, 
            workerName: w.name || "",
            serviceCategory: w.service || serviceName || "",
            query: ""
          });
          setOpenSearch(false);
          setShowQueryPopup(true);
        }}
        onReviewWorker={(w) => {
          setOpenSearch(false);
          openReviews(w);
        }}
      />

      {/* Diagnosis Modal */}
      <AnimatePresence>
        {showDiagnosis && (
         <DiagnosisModal
  isOpen={showDiagnosis}
  onClose={() => { setShowDiagnosis(false); setAiDiagnosis(null); }}
  issue={serviceType}
  diagnosis={aiDiagnosis}
  loading={diagnosisLoading}
/>
        )}
      </AnimatePresence>

      
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
                                {fb.image && (
                                  <div className="mt-2 max-w-[200px] rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
                                    <img src={fb.image} alt="Feedback Attachment" className="w-full max-h-32 object-contain" />
                                  </div>
                                )}
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
