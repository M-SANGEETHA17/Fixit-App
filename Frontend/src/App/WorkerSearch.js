import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaSearch,
  FaTimes,
  FaUser,
  FaMapMarkerAlt,
  FaStar,
  FaPhone,
  FaBookmark,
  FaSpinner,
  FaThLarge,
  FaList,
  FaLocationArrow,
  FaWhatsapp,
  FaQuestionCircle
} from "react-icons/fa";
import { MdOutlineVerified } from "react-icons/md";
import { Geolocation } from "@capacitor/geolocation";
import { API_BASE_URL } from "../config";

export default function WorkerSearch({
  isOpen,
  onClose,
  onBookWorker,
  onQueryWorker,
  onReviewWorker,
  serviceName = "workers"
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [locating, setLocating] = useState(false);

  const recentSearches = [
    `${serviceName} in madurai`,
    `${serviceName} in trichy`,
    `${serviceName} in chennai`,
  ];

  const normalizeQuery = (rawQuery) => {
    return rawQuery.replace(/\s+from\s+/gi, ' in ');
  };

  const searchWorkersWithQuery = async (rawQuery) => {
    const searchQuery = normalizeQuery(rawQuery); 
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);

    const parts = searchQuery.split(' in ');
    if (parts.length !== 2) {
      console.error("Invalid search format. Use 'service in city' or 'service from city'");
      setLoading(false);
      setResults([]);
      return;
    }
    const service = parts[0].trim();
    const city = parts[1].trim();

    const baseUrl = API_BASE_URL;

    try {
    
      let dbWorkers = [];
      try {
        const dbRes = await axios.get(
          `${baseUrl}/api/workers/search?service=${encodeURIComponent(service)}&city=${encodeURIComponent(city)}`
        );
        if (dbRes.data.success && Array.isArray(dbRes.data.workers)) {
            dbWorkers = dbRes.data.workers.map(w => ({
              _id: w._id,
              name: w.name,
              email: w.email,
              phone: w.phone || "Not available",
              location: w.location || "Not specified",
              service: w.service || service,
              rating: "5.0",
              verified: true,
              isDbWorker: true,
            }));
        }
      } catch (dbErr) {
        console.error("DB Workers Search Error:", dbErr);
      }

      let mapWorkers = [];
      try {
        const res = await axios.get(
          `${baseUrl}/api/fetch?service=${encodeURIComponent(service)}&city=${encodeURIComponent(city)}`
        );
        if (res.data.success && Array.isArray(res.data.data)) {
          mapWorkers = res.data.data.map(business => ({
            _id: business.placeId || business.id || Math.random().toString(),
            name: business.title || business.name || "Unknown",
            phone: business.phone || "Not available",
            location: business.address || "Not specified",
            service: service,
            rating: business.rating || "N/A",
            verified: true,
          }));
        }
      } catch (mapErr) {
        console.error("Apify Fetch Error:", mapErr);
      }

      setResults([...dbWorkers, ...mapWorkers]);
    } catch (err) {
      console.error("Search Error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const searchWorkers = () => {
    searchWorkersWithQuery(query);
  };

  const handleWhatsApp = (worker) => {
    let phoneNum = worker.phone ? worker.phone.toString().replace(/\D/g, '') : '';
    if (phoneNum.length === 10) {
      phoneNum = "91" + phoneNum;
    }
    const defaultMsg = encodeURIComponent(`Hi ${worker.name}, I found your contact on FixIt. I am looking for ${worker.service} services.`);
    window.open(`https://wa.me/${phoneNum}?text=${defaultMsg}`, "_blank");
  };

  const fetchAddressAndSearch = async (latitude, longitude) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "FixIt-App/1.0"
        }
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      const addr = data.address || {};
      let city = addr.city || addr.town || addr.village || addr.city_district || addr.municipality || addr.county || addr.state_district || "";
      
      if (city) {
        city = city.replace(/\s+District$/i, "").replace(/\s+County$/i, "").trim();
      }
      
      if (city) {
        const newQuery = `${serviceName} in ${city}`;
        setQuery(newQuery);
        searchWorkersWithQuery(newQuery);
      } else {
        fetchLocationViaIP();
      }
    } catch (error) {
      try {
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
        const data = await res.json();
        let city = data.city || data.locality || "";
        if (city) {
          city = city.replace(/\s+District$/i, "").replace(/\s+County$/i, "").trim();
        }
        if (city) {
          const newQuery = `${serviceName} in ${city}`;
          setQuery(newQuery);
          searchWorkersWithQuery(newQuery);
        } else {
          fetchLocationViaIP();
        }
      } catch (err2) {
        fetchLocationViaIP();
      }
    } finally {
      setLocating(false);
    }
  };

  const handleLocationSearch = async () => {
    setLocating(true);
    let latitude, longitude;

    try {
      await Geolocation.requestPermissions();
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });
      if (position && position.coords) {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        console.log("Search: Capacitor coords fetched:", latitude, longitude);
      }
    } catch (capErr) {
      console.log("Search: Running on Web browser, using IP Geolocation.");
    }

    if (latitude !== undefined && longitude !== undefined) {
      await fetchAddressAndSearch(latitude, longitude);
    } else {
      await fetchLocationViaIP();
    }
  };

  const fetchLocationViaIP = async () => {
    try {
      setLocating(true);
      let data = null;

      try {
        const res = await fetch("https://geolocation-db.com/json/");
        if (res.ok) {
          const ipData = await res.json();
          if (ipData && ipData.city && ipData.city !== "Not Found") {
            data = { city: ipData.city };
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
              data = { city: ipData.cityName };
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
              data = { city: ipData.city };
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
              data = { city: ipData.city };
            }
          }
        } catch (err) {
          console.log("ipinfo.io failed", err);
        }
      }

      if (data && data.city) {
        let city = data.city;
        city = city.replace(/\s+District$/i, "").replace(/\s+County$/i, "").trim();
        const newQuery = `${serviceName} in ${city}`;
        setQuery(newQuery);
        searchWorkersWithQuery(newQuery);
      } else {
        alert("Could not retrieve your location automatically. Please select from the Quick Select City list below.");
      }
    } catch (err) {
      alert("Could not retrieve your location automatically. Please select from the Quick Select City list below.");
    } finally {
      setLocating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex justify-center items-start p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden animate-fadeInUp">

        {/* NAVBAR */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Search Workers Here</h1>
            <p className="text-xs sm:text-sm text-white/80">
              Search workers by service & city
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 sm:p-3 rounded-full hover:bg-white/10"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* SEARCH BOX */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Example: ${serviceName} in madurai`}
                className="w-full pl-11 pr-4 py-4 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>

            <button
              onClick={handleLocationSearch}
              disabled={locating}
              className="bg-teal-100 hover:bg-teal-200 text-teal-800 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold flex items-center justify-center gap-2 transition"
            >
              {locating ? <FaSpinner className="animate-spin" /> : <FaLocationArrow />}
              <span className="inline">Use Location</span>
            </button>

            <button
              onClick={searchWorkers}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition"
            >
              {loading && !locating ? <FaSpinner className="animate-spin" /> : "Search"}
            </button>
          </div>

          {/* Popular Cities Quick Select */}
          <div className="flex flex-wrap gap-1.5 mt-3 items-center">
            <span className="text-xs text-gray-500 mr-1 font-medium">Quick Select City:</span>
            {["Chennai", "Sattur", "Coimbatore", "Madurai", "Trichy", "Salem"].map((city) => (
              <button
                key={city}
                onClick={() => {
                  const newQuery = `${serviceName} in ${city}`;
                  setQuery(newQuery);
                  searchWorkersWithQuery(newQuery);
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 border border-gray-200 transition-all font-medium text-gray-600 shadow-sm"
              >
                {city}
              </button>
            ))}
          </div>

          {/* Recent searches */}
          <div className="flex gap-2 flex-wrap mt-4">
            {recentSearches.map((item, i) => (
              <button
                key={i}
                onClick={() => setQuery(item)}
                className="text-xs bg-white border px-3 py-2 rounded-full hover:bg-emerald-50"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* VIEW TOGGLE */}
        <div className="px-6 pt-4 flex justify-end gap-2">
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-lg ${
              viewMode === "table" ? "bg-emerald-100" : "bg-gray-100"
            }`}
          >
            <FaList />
          </button>

          <button
            onClick={() => setViewMode("card")}
            className={`p-2 rounded-lg ${
              viewMode === "card" ? "bg-emerald-100" : "bg-gray-100"
            }`}
          >
            <FaThLarge />
          </button>
        </div>

        {/* RESULTS */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-20">
              <FaSpinner className="animate-spin text-4xl text-emerald-500 mx-auto mb-3" />
              <p className="text-gray-500">Searching workers...</p>
            </div>
          ) : searched && results.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No workers found in this city. Try a nearby bigger city.</p>
            </div>
          ) : viewMode === "table" ? (
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b text-left text-gray-500 text-sm">
                    <th className="py-3 px-2">Worker</th>
                    <th className="px-2">Service</th>
                    <th className="px-2">Location</th>
                    <th className="px-2">Rating</th>
                    <th className="px-2">Contact</th>
                    <th className="px-2">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {results.map((worker) => (
                    <tr key={worker._id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 shrink-0">
                            {worker.name?.charAt(0)}
                          </div>

                          <div>
                            <p className="font-semibold flex items-center gap-1">
                              {worker.name}
                              {worker.verified && (
                                <MdOutlineVerified className="text-emerald-500" />
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-2">{worker.service}</td>

                      <td className="px-2">
                        <div className="flex items-center gap-1">
                          <FaMapMarkerAlt className="text-emerald-500 shrink-0" />
                          <span className="truncate max-w-[150px]">{worker.location}</span>
                        </div>
                      </td>

                      <td className="px-2">
                        <div className="flex items-center gap-1">
                          <FaStar className="text-yellow-500 shrink-0" />
                          {worker.rating}
                        </div>
                      </td>

                      <td className="px-2">
                        <div className="flex items-center gap-2">
                          <FaPhone className="text-emerald-500 shrink-0" />
                          <span className="whitespace-nowrap">{worker.phone}</span>
                          <button
                            onClick={() => handleWhatsApp(worker)}
                            className="bg-green-100 p-1.5 rounded-full text-green-600 hover:bg-green-200 transition shrink-0"
                            title="WhatsApp Message"
                          >
                            <FaWhatsapp size={14} />
                          </button>
                        </div>
                      </td>

                      <td className="px-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              onBookWorker
                                ? onBookWorker(worker)
                                : alert(`Book ${worker.name}`)
                            }
                            className="bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-xl text-emerald-700 flex items-center gap-1.5 text-xs whitespace-nowrap"
                          >
                            <FaBookmark />
                            Book
                          </button>
                          
                          <button
                            onClick={() => {
                              if (onQueryWorker) {
                                onQueryWorker(worker);
                              } else {
                                // fallback fallback
                                localStorage.setItem("selectedWorker", JSON.stringify(worker));
                                navigate("/contact", { state: { openQuery: true } });
                              }
                            }}
                            className="bg-blue-50 hover:bg-blue-500 border border-blue-200 hover:border-blue-500 text-blue-700 hover:text-white px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 text-xs whitespace-nowrap"
                          >
                            <FaQuestionCircle /> Query
                          </button>
                          
                          <button
                            onClick={() => {
                              if (onReviewWorker) {
                                onReviewWorker(worker);
                              } else {
                                localStorage.setItem("selectedWorker", JSON.stringify(worker));
                                navigate("/contact");
                              }
                            }}
                            className="bg-amber-50 hover:bg-amber-500 border border-amber-200 hover:border-amber-500 text-amber-700 hover:text-white px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 text-xs whitespace-nowrap"
                          >
                            ⭐ Review
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((worker) => (
                <div
                  key={worker._id}
                  className="border rounded-2xl p-4 hover:shadow-lg transition"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700">
                      {worker.name?.charAt(0)}
                    </div>

                    <div>
                      <h3 className="font-semibold">{worker.name}</h3>
                      <p className="text-sm text-gray-500">{worker.service}</p>
                    </div>
                  </div>

                  <p className="text-sm flex items-center gap-2 mb-2">
                    <FaMapMarkerAlt className="text-emerald-500" />
                    {worker.location}
                  </p>

                  <div className="flex items-center gap-2 mb-2 text-sm">
                    <FaPhone className="text-emerald-500" />
                    {worker.phone}
                    <button 
                      onClick={() => handleWhatsApp(worker)} 
                      className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs flex items-center gap-1 hover:bg-green-200 transition"
                    >
                      <FaWhatsapp /> Message
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <button
                      onClick={() =>
                        onBookWorker
                          ? onBookWorker(worker)
                          : alert(`Book ${worker.name}`)
                      }
                      className="w-full bg-emerald-600 text-white py-2 rounded-xl text-xs font-semibold"
                    >
                      Book
                    </button>
                    <button
                      onClick={() => {
                        if (onQueryWorker) {
                          onQueryWorker(worker);
                        } else {
                          localStorage.setItem("selectedWorker", JSON.stringify(worker));
                          navigate("/contact", { state: { openQuery: true } });
                        }
                      }}
                      className="w-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-500 hover:text-white py-2 rounded-xl text-xs font-semibold transition"
                    >
                      Query
                    </button>
                    <button
                      onClick={() => {
                        if (onReviewWorker) {
                          onReviewWorker(worker);
                        } else {
                          localStorage.setItem("selectedWorker", JSON.stringify(worker));
                          navigate("/contact");
                        }
                      }}
                      className="w-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-500 hover:text-white py-2 rounded-xl text-xs font-semibold transition"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}