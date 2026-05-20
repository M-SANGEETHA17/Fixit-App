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
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";
import { API_BASE_URL } from "../config";

// Simple Levenshtein distance helper
const getLevenshteinDistance = (a, b) => {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

const knownCities = [
  "Chennai", "Sattur", "Coimbatore", "Madurai", "Trichy", "Salem", 
  "Tirunelveli", "Palayamkottai", "Kovilpatti", "Sivakasi", 
  "Virudhunagar", "Thoothukudi", "Tuticorin", "Palani", "Dindigul",
  "Nagercoil", "Kanyakumari", "Erode", "Vellore", "Thanjavur", 
  "Hosur", "Karur", "Rajapalayam", "Sankaranayinarkoil", "Tenkasi"
];

const resolveFuzzyCity = (cityInput) => {
  if (!cityInput) return "";
  const input = cityInput.trim().toLowerCase();
  if (input === "nearby" || input === "near by") return "Nearby";
  
  // Direct matches
  for (const city of knownCities) {
    if (city.toLowerCase() === input) return city;
  }
  
  // Clean punctuation and common suffixes
  let cleanInput = input.replace(/\s+district$/i, "").replace(/\s+town$/i, "").replace(/\s+village$/i, "").trim();
  
  // Check for common typo mappings
  const commonCityTypos = {
    "satur": "Sattur",
    "sathur": "Sattur",
    "madruai": "Madurai",
    "madura": "Madurai",
    "chenai": "Chennai",
    "coimbator": "Coimbatore",
    "kovilpati": "Kovilpatti",
    "kovilpatty": "Kovilpatti",
    "tirunelvely": "Tirunelveli",
    "trichy": "Trichy",
    "trichi": "Trichy",
    "tuticorin": "Thoothukudi",
    "thoothukudi": "Thoothukudi",
    "sivakasi": "Sivakasi",
    "sivakashi": "Sivakasi",
    "virudhunagar": "Virudhunagar",
    "virudunagar": "Virudhunagar",
    "palayamkotai": "Palayamkottai",
    "palayankottai": "Palayamkottai"
  };
  
  if (commonCityTypos[cleanInput]) {
    return commonCityTypos[cleanInput];
  }
  
  // Calculate Levenshtein distance for fuzzy matching
  let bestMatch = cityInput;
  let minDistance = 3; // allow up to 2 changes
  
  for (const city of knownCities) {
    const cLower = city.toLowerCase();
    const dist = getLevenshteinDistance(cleanInput, cLower);
    if (dist < minDistance) {
      minDistance = dist;
      bestMatch = city;
    }
  }
  
  return bestMatch;
};

const getHaversineDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const cityCoords = {
  madurai: { lat: 9.9252, lon: 78.1198 },
  tirunelveli: { lat: 8.7139, lon: 77.7567 },
  chennai: { lat: 13.0827, lon: 80.2707 },
  coimbatore: { lat: 11.0168, lon: 76.9558 },
  trichy: { lat: 10.7905, lon: 78.7047 },
  sattur: { lat: 9.3582, lon: 77.9202 },
  salem: { lat: 11.6643, lon: 78.1460 },
  palayamkottai: { lat: 8.7100, lon: 77.7300 },
  kovilpatti: { lat: 9.1700, lon: 77.8700 },
  sivakasi: { lat: 9.4500, lon: 77.8000 },
  virudhunagar: { lat: 9.5680, lon: 77.9624 },
  thoothukudi: { lat: 8.7642, lon: 78.1348 },
  tuticorin: { lat: 8.7642, lon: 78.1348 },
  palani: { lat: 10.4492, lon: 77.5213 },
  dindigul: { lat: 10.3673, lon: 77.9803 }
};

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
  const [viewMode, setViewMode] = useState(
    typeof window !== "undefined" && (window.innerWidth < 768 || (window.Capacitor && window.Capacitor.isNativePlatform?.()))
      ? "card"
      : "table"
  );
  const [locating, setLocating] = useState(false);
  const [searchingMap, setSearchingMap] = useState(false);
  const [coordinates, setCoordinates] = useState(null); // { lat, lon }

  const recentSearches = [
    `${serviceName} in madurai`,
    `${serviceName} in trichy`,
    `${serviceName} in chennai`,
  ];

  const getStandardServiceName = (service) => {
    if (!service) return "Worker";
    const clean = service.toLowerCase().trim();
    if (clean.includes("electr") || clean.includes("wire") || clean.includes("wiring") || clean.includes("current")) {
      return "Electrical Repair";
    }
    if (clean.includes("clean") || clean.includes("maid") || clean.includes("housekeep")) {
      return "Cleaning";
    }
    if (clean.includes("ac ") || clean === "ac" || clean.includes("air") || clean.includes("cool") || clean.includes("fridge")) {
      return "AC Service";
    }
    if (clean.includes("carp") || clean.includes("wood") || clean.includes("furnit")) {
      return "Carpentry";
    }
    if (clean.includes("plumb") || clean.includes("pipe") || clean.includes("water")) {
      return "Plumbing";
    }
    if (clean.includes("pest") || clean.includes("bug") || clean.includes("termite")) {
      return "Pest Control";
    }
    return service.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  const cleanQuery = (rawQuery) => {
    if (!rawQuery) return "";
    let q = rawQuery.trim();
    q = q.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ").replace(/\s+/g, " ");
    const typos = {
      "repari": "repair",
      "electical": "electrical",
      "electican": "electrician",
      "plumbin": "plumbing",
      "carpentri": "carpentry",
      "clen": "clean",
      "celan": "clean",
      "serivce": "service",
      "servise": "service",
      "electricals": "electrical",
      "plumbers": "plumber",
      "carpenters": "carpenter",
      "cleaners": "cleaner"
    };
    for (const [typo, replacement] of Object.entries(typos)) {
      q = q.replace(new RegExp(typo, "gi"), replacement);
    }
    return q;
  };

  const calculateRelevanceScore = (worker, cityQuery, lat = null, lon = null) => {
    let score = 0;

    // 1. Database registered worker boost
    if (worker.isDbWorker) {
      score += 5;
    }

    // 2. Online status boost
    if (worker.isOnline === true) {
      score += 4;
    }

    // 3. Exact city match in address/location
    const cLower = cityQuery.toLowerCase();
    const wLoc = (worker.location || "").toLowerCase();
    if (wLoc.includes(cLower)) {
      score += 5;
    }

    // 4. Proximity / Distance Boost
    // If worker has no coordinates, try to resolve from their city name
    let wLat = worker.lat;
    let wLon = worker.lon;
    if (!wLat || !wLon) {
      for (const [cityName, coords] of Object.entries(cityCoords)) {
        if (wLoc.includes(cityName)) {
          wLat = coords.lat;
          wLon = coords.lon;
          break;
        }
      }
    }

    if (lat && lon && wLat && wLon) {
      const distance = getHaversineDistance(lat, lon, wLat, wLon);
      worker.distance = distance; // save distance to render on UI
      worker.lat = wLat;
      worker.lon = wLon;
      
      if (distance <= 5) {
        score += 5;
      } else if (distance <= 15) {
        score += 3;
      } else if (distance <= 30) {
        score += 1.5;
      }
    }

    // 5. Star Rating weight
    const ratingVal = parseFloat(worker.rating) || 0;
    score += ratingVal / 10;

    return score;
  };

  const searchWorkersWithQuery = async (rawQuery, lat = null, lon = null) => {
    const cleanedQuery = cleanQuery(rawQuery); 
    if (!cleanedQuery.trim()) return;

    setLoading(true);
    setSearched(true);

    let service = serviceName || "workers";
    let city = "Nearby";

    // Split with case-insensitive 'in' or 'from'
    const parts = cleanedQuery.split(/\s+(?:in|from)\s+/i);
    if (parts.length === 2) {
      service = parts[0].trim();
      city = parts[1].trim();
    } else {
      const queryStr = cleanedQuery.trim().toLowerCase();
      
      // Fuzzy detect if the entire query is a city name
      const fuzzyCity = resolveFuzzyCity(queryStr);
      const isKnownCity = fuzzyCity !== queryStr && fuzzyCity !== "";
      const isDirectKnown = knownCities.some(c => queryStr.includes(c.toLowerCase()) || c.toLowerCase().includes(queryStr));
      
      const hasServiceKeywords = ["repair", "service", "plumb", "electr", "carp", "clean", "pest", "wire", "current"].some(k => queryStr.includes(k));
      
      if ((isKnownCity || isDirectKnown) && !hasServiceKeywords) {
        city = isKnownCity ? fuzzyCity : queryStr;
        service = serviceName || "workers";
      } else if (!(isKnownCity || isDirectKnown) && hasServiceKeywords) {
        service = cleanedQuery.trim();
        city = "Nearby";
      } else {
        if (serviceName && queryStr.includes(serviceName.toLowerCase())) {
          service = serviceName;
          city = cleanedQuery.trim().replace(new RegExp(serviceName, "gi"), "").trim();
          if (!city) city = "Nearby";
        } else {
          city = cleanedQuery.trim();
          service = serviceName || "workers";
        }
      }
    }

    // Fuzzy resolve city for search API calls
    const resolvedCity = resolveFuzzyCity(city);
    const formattedCity = resolvedCity || city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
    const standardService = getStandardServiceName(service);

    const baseUrl = API_BASE_URL;

    // Resolve search center coordinates if GPS coordinates aren't active
    let activeLat = lat || coordinates?.lat || null;
    let activeLon = lon || coordinates?.lon || null;
    
    if (!activeLat || !activeLon) {
      const lCity = formattedCity.toLowerCase();
      if (cityCoords[lCity]) {
        activeLat = cityCoords[lCity].lat;
        activeLon = cityCoords[lCity].lon;
      }
    }

    try {
      let dbWorkers = [];
      
      try {
        const dbRes = await axios.get(
          `${baseUrl}/api/workers/search?service=${encodeURIComponent(standardService)}&city=${encodeURIComponent(formattedCity)}`
        );
        if (dbRes.data.success && Array.isArray(dbRes.data.workers)) {
          dbWorkers = dbRes.data.workers.map(w => ({
            _id: w._id,
            name: w.name,
            email: w.email,
            phone: w.phone || "Not available",
            location: w.location || "Not specified",
            service: w.service || standardService,
            rating: w.rating || "5.0",
            verified: true,
            isDbWorker: true,
            isOnline: w.isOnline ?? false,
            lat: w.lat || null,
            lon: w.lon || null
          }));
        }
      } catch (dbErr) {
        console.error("DB Workers Search Error:", dbErr);
      }

      // Calculate initial relevance scores for DB workers
      dbWorkers.forEach(w => {
        w.score = calculateRelevanceScore(w, formattedCity, activeLat, activeLon);
      });
      dbWorkers.sort((a, b) => b.score - a.score);

      setResults(dbWorkers);
      setLoading(false);

      console.log(`📡 Initiating background query for dynamic Map shops using coordinates (${activeLat}, ${activeLon})...`);
      setSearchingMap(true);
      
      (async () => {
        try {
          let fetchUrl = `${baseUrl}/api/fetch?service=${encodeURIComponent(standardService)}&city=${encodeURIComponent(formattedCity)}`;
          if (activeLat && activeLon) {
            fetchUrl += `&lat=${activeLat}&lon=${activeLon}`;
          }
          console.log(`📡 Sending dynamic fetch API query: ${fetchUrl}`);

          const res = await axios.get(
            fetchUrl,
            { timeout: 30000 }
          );
          
          if (res.data.success && Array.isArray(res.data.data)) {
            const mapWorkers = res.data.data.map(business => ({
              _id: business.placeId || business.id || `map_${Math.random()}`,
              name: business.title || business.name || "Unknown Shop",
              phone: business.phone || "Not available",
              location: business.address || "Not specified",
              service: getStandardServiceName(standardService),
              rating: business.rating || "4.5",
              verified: true,
              isMapWorker: true,
              isOnline: false,
              lat: business.lat || null,
              lon: business.lon || null
            }));
            
            console.log(`✅ Background fetch resolved. Appending ${mapWorkers.length} external shops.`);
            setResults(prev => {
              const existingIds = new Set(prev.map(p => p._id));
              const uniqueMapWorkers = mapWorkers.filter(mw => !existingIds.has(mw._id));
              const combined = [...prev, ...uniqueMapWorkers];
              
              // Calculate relevance score and sort all combined results
              combined.forEach(w => {
                w.score = calculateRelevanceScore(w, formattedCity, activeLat, activeLon);
              });
              
              return combined.sort((a, b) => b.score - a.score);
            });
          }
        } catch (mapErr) {
          console.warn("⚠️ Background Map Fetch silently failed:", mapErr.message);
        } finally {
          setSearchingMap(false);
        }
      })();

    } catch (err) {
      console.error("Search Error:", err);
      setResults([]);
      setLoading(false);
    }
  };

  const searchWorkers = () => {
    searchWorkersWithQuery(query, coordinates?.lat, coordinates?.lon);
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
        searchWorkersWithQuery(newQuery, latitude, longitude);
      } else {
        const fallbackQuery = `${serviceName} in Nearby`;
        setQuery(fallbackQuery);
        searchWorkersWithQuery(fallbackQuery, latitude, longitude);
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
          searchWorkersWithQuery(newQuery, latitude, longitude);
        } else {
          const fallbackQuery = `${serviceName} in Nearby`;
          setQuery(fallbackQuery);
          searchWorkersWithQuery(fallbackQuery, latitude, longitude);
        }
      } catch (err2) {
        const fallbackQuery = `${serviceName} in Nearby`;
        setQuery(fallbackQuery);
        searchWorkersWithQuery(fallbackQuery, latitude, longitude);
      }
    } finally {
      setLocating(false);
    }
  };

  const handleLocationSearch = async () => {
    setLocating(true);
    let latitude, longitude;
    let permissionBlocked = false;

    try {
      const isNative = Capacitor.isNativePlatform();
      console.log("📡 [Search GPS] Running on native platform:", isNative);
      
      if (isNative) {
        try {
          let permStatus = await Geolocation.checkPermissions();
          console.log("📍 [Search GPS] Current native permission status:", permStatus);
          
          if (permStatus.location !== 'granted') {
            console.log("🔑 [Search GPS] Requesting native Android location permissions...");
            permStatus = await Geolocation.requestPermissions();
          }

          if (permStatus.location === 'granted') {
            console.log("📡 [Search GPS] Fetching native high-accuracy live location...");
            try {
              // Primary Attempt: High-Accuracy satellite GPS (7s timeout so it doesn't block indoors)
              const position = await Geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 7000,
                maximumAge: 0 // Prevent stale cached reading
              });
              if (position && position.coords) {
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
                console.log("🟢 [Search GPS] Native high-accuracy GPS Lock Resolved:", latitude, longitude);
              }
            } catch (errHigh) {
              console.warn("⚠️ [Search GPS] High-accuracy satellite lock failed or timed out. Falling back to coarse network position...", errHigh);
              try {
                // Secondary Attempt: Coarse/Network Location (wifi/cellular tower) - works instantly indoors!
                const position = await Geolocation.getCurrentPosition({
                  enableHighAccuracy: false,
                  timeout: 5000,
                  maximumAge: 30000 // Accept reasonably fresh coordinates
                });
                if (position && position.coords) {
                  latitude = position.coords.latitude;
                  longitude = position.coords.longitude;
                  console.log("🟢 [Search GPS] Coarse/Network Location Resolved:", latitude, longitude);
                }
              } catch (errCoarse) {
                console.error("❌ [Search GPS] Coarse/Network location attempt also failed:", errCoarse);
                throw errCoarse;
              }
            }
          } else {
            permissionBlocked = true;
            console.error("🛑 [Search GPS] Location permission denied by native user.");
            alert("Location permission is required to search for nearby workers. Please allow location access in your App settings.");
          }
        } catch (capErr) {
          console.error("❌ [Search GPS] Capacitor Native Geolocation error:", capErr);
          if (capErr.message && (capErr.message.includes("location") || capErr.message.includes("settings") || capErr.message.includes("timeout"))) {
            alert("Unable to fetch location. Please ensure your device GPS/Location services are turned ON and try again.");
          } else {
            alert("Error fetching GPS: " + (capErr.message || capErr));
          }
        }
      } else {
        // WEBSITE BROWSER GPS - Fallback if not native
        if (!navigator.geolocation) {
          console.error("❌ [Search GPS] Navigator.geolocation UNSUPPORTED on this browser.");
          alert("Your browser does not support Geolocation.");
        } else {
          const getWebPosition = (options) =>
            new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, options);
            });

          try {
            console.log("📡 [Search GPS] Web Geolocation: Requesting high-accuracy coordinates...");
            const position = await getWebPosition({
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            });
            if (position && position.coords) {
              latitude = position.coords.latitude;
              longitude = position.coords.longitude;
              console.log("🟢 [Search GPS] Web High-Accuracy coordinates loaded.");
            }
          } catch (err) {
            console.error("⚠️ [Search GPS] High-accuracy query failed. Code:", err.code);
            if (err.code === 1) {
              permissionBlocked = true;
              alert("Location permission was blocked. Please enable it in browser settings.");
            } else {
              try {
                console.log("📡 [Search GPS] Web Fallback: Requesting cached coordinates...");
                const position = await getWebPosition({
                  enableHighAccuracy: false,
                  timeout: 5000,
                  maximumAge: 60000
                });
                if (position && position.coords) {
                  latitude = position.coords.latitude;
                  longitude = position.coords.longitude;
                }
              } catch (err2) {
                console.warn("⚠️ Web cached fallback failed.");
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("🚨 [Search GPS] Critical Geolocation Flow crash:", err);
    }

    if (permissionBlocked) {
      setLocating(false);
      return;
    }

    if (latitude !== undefined && longitude !== undefined) {
      setCoordinates({ lat: latitude, lon: longitude });
      await fetchAddressAndSearch(latitude, longitude);
    } else {
      // Profile Fallback Strategy for Search
      let profileResolved = false;
      try {
        const storedUserStr = localStorage.getItem("user");
        if (storedUserStr) {
          const storedUser = JSON.parse(storedUserStr);
          if (storedUser && storedUser.address) {
            console.group("✅ [Search Fallback] Extracting City from Profile");
            const fullAddress = storedUser.address.toLowerCase();
            let parsedCity = "";
            
            // 1. Check for common Tamil Nadu service regions in user profile
            if (fullAddress.includes("tirunelveli")) parsedCity = "Tirunelveli";
            else if (fullAddress.includes("madurai")) parsedCity = "Madurai";
            else if (fullAddress.includes("coimbatore")) parsedCity = "Coimbatore";
            else if (fullAddress.includes("chennai")) parsedCity = "Chennai";
            else if (fullAddress.includes("trichy") || fullAddress.includes("tiruchirappalli")) parsedCity = "Trichy";
            else {
              // 2. Fallback: Split by comma and extract the city segment
              const parts = storedUser.address.split(",").map(p => p.trim()).filter(Boolean);
              if (parts.length >= 2) {
                const lastPart = parts[parts.length - 1];
                if (/^\d+$/.test(lastPart) || lastPart.toLowerCase().includes("tamil") || lastPart.toLowerCase().includes("india")) {
                  parsedCity = parts[parts.length - 2] || parts[0];
                } else {
                  parsedCity = lastPart;
                }
              } else if (parts.length === 1) {
                parsedCity = parts[0];
              }
            }
            
            console.log("Profile Address:", storedUser.address);
            console.log("Parsed Search City:", parsedCity);
            console.groupEnd();
            
            if (parsedCity) {
              const finalQuery = `${serviceName} in ${parsedCity}`;
              setQuery(finalQuery);
              console.log("🚀 Triggering profile-autosearch for:", finalQuery);
              searchWorkersWithQuery(finalQuery);
              profileResolved = true;
            }
          }
        }
      } catch (profErr) {
        console.warn("⚠️ Unable to extract search city from user profile.", profErr);
      }

      if (profileResolved) {
        setLocating(false);
        return;
      }

      console.warn("⚠️ [Search GPS] GPS unavailable and profile has no cached address. Trying IP geolocation...");
      await fetchLocationViaIP();
    }
  };

  const fetchLocationViaIP = async () => {
    try {
      setLocating(true);
      let data = null;

      // Tier 1: ipinfo.io
      try {
        console.log("🌐 [Search Engine] Querying ipinfo.io...");
        const res = await fetch("https://ipinfo.io/json");
        if (res.ok) {
          const ipData = await res.json();
          if (ipData && ipData.city && ipData.city !== "Not Found") {
            data = { city: ipData.city };
            console.log("✅ [Search Engine] ipinfo match:", data.city);
          }
        }
      } catch (err) {
        console.warn("⚠️ ipinfo failed, trying next...");
      }

      // Tier 2: ipapi.co
      if (!data || !data.city) {
        try {
          console.log("🌐 [Search Engine] Querying ipapi.co...");
          const res = await fetch("https://ipapi.co/json/");
          if (res.ok) {
            const ipData = await res.json();
            if (ipData && ipData.city) {
              data = { city: ipData.city };
              console.log("✅ [Search Engine] ipapi match:", data.city);
            }
          }
        } catch (err) {
          console.warn("⚠️ ipapi failed, trying next...");
        }
      }

      // Tier 3: freeipapi.com
      if (!data || !data.city) {
        try {
          console.log("🌐 [Search Engine] Querying freeipapi.com...");
          const res = await fetch("https://freeipapi.com/api/json");
          if (res.ok) {
            const ipData = await res.json();
            if (ipData && ipData.cityName) {
              data = { city: ipData.cityName };
              console.log("✅ [Search Engine] freeipapi match:", data.city);
            }
          }
        } catch (err) {
          console.warn("⚠️ freeipapi failed, trying next...");
        }
      }

      if (data && data.city) {
        let city = data.city;
        city = city.replace(/\s+District$/i, "").replace(/\s+County$/i, "").trim();
        
        // Detect broad broadband gateway hubs
        const lowerCity = city.toLowerCase();
        if (lowerCity.includes("chennai") || lowerCity.includes("bangalore") || lowerCity.includes("bengaluru")) {
          console.warn("⚠️ [Search Engine] Filtered broadband hub:", city);
          setQuery(`${serviceName} in `);
          return;
        }

        const newQuery = `${serviceName} in ${city}`;
        setQuery(newQuery);
        searchWorkersWithQuery(newQuery);
      } else {
        console.warn("⚠️ IP location matching failed.");
        setQuery(`${serviceName} in `);
      }
    } catch (err) {
      console.error("❌ Error during search location fetch:", err);
      setQuery(`${serviceName} in `);
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
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCoordinates(null);
                }}
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
                  setCoordinates(null);
                  const newQuery = `${serviceName} in ${city}`;
                  setQuery(newQuery);
                  searchWorkersWithQuery(newQuery, null, null);
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
                onClick={() => {
                  setCoordinates(null);
                  setQuery(item);
                  searchWorkersWithQuery(item, null, null);
                }}
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
          {searchingMap && (
            <div className="mb-4 bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 flex items-center justify-center gap-3 text-emerald-700 animate-pulse text-sm font-medium shadow-sm">
              <FaSpinner className="animate-spin text-emerald-600" />
              <span> Connecting to live Google/OpenStreetMap to search for all local shops...</span>
            </div>
          )}
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
                            <div className="flex items-center gap-2">
                              <p className="font-semibold flex items-center gap-1">
                                {worker.name}
                                {worker.verified && (
                                  <MdOutlineVerified className="text-emerald-500" />
                                )}
                              </p>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                                worker.isOnline === true 
                                  ? "bg-green-50 text-green-600 border-green-200" 
                                  : "bg-red-50 text-red-500 border-red-200"
                              }`}>
                                {worker.isOnline === true ? "🟢 Online" : "🔴 Offline"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-2">{worker.service}</td>

                      <td className="px-2">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <FaMapMarkerAlt className="text-emerald-500 shrink-0" />
                            <span className="truncate max-w-[150px] font-medium">{worker.location}</span>
                          </div>
                          {worker.distance && worker.distance !== Infinity && (
                            <span className="text-[10px] text-teal-600 font-semibold pl-4">
                              {worker.distance.toFixed(1)} km away
                            </span>
                          )}
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
                             Review
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
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sm text-gray-500">{worker.service}</p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                          worker.isOnline === true 
                            ? "bg-green-50 text-green-600 border-green-200" 
                            : "bg-red-50 text-red-500 border-red-200"
                        }`}>
                          {worker.isOnline === true ? "🟢 Online" : "🔴 Offline"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm flex flex-col mb-2 gap-0.5">
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-emerald-500 shrink-0" />
                      <span className="font-medium text-gray-700">{worker.location}</span>
                    </div>
                    {worker.distance && worker.distance !== Infinity && (
                      <span className="text-xs text-teal-600 font-bold pl-6">
                        {worker.distance.toFixed(1)} km away
                      </span>
                    )}
                  </div>

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