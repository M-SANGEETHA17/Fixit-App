// import express from "express";
// import axios from "axios";

// const router = express.Router();

// router.get("/overpass-search", async (req, res) => {
//   try {
//     const { q } = req.query;

//     if (!q) {
//       return res.status(400).json({ success: false, message: "Query required" });
//     }

//     let city = "chennai"; 
//     let serviceStr = q;
//     const parts = q.toLowerCase().split(/ in | from /);
//     if (parts.length === 2) {
//       serviceStr = parts[0].trim();
//       city = parts[1].trim();
//     } else {
//       city = q.trim();
//     }

//     // Geocode city to lat/lon
//     const geocodeRes = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`, {
//       headers: { "User-Agent": "FixItApp/1.0" }
//     });
    
//     if (!geocodeRes.data || geocodeRes.data.length === 0) {
//       return res.json({ success: true, workers: [] });
//     }
    
//     const lat = geocodeRes.data[0].lat;
//     const lon = geocodeRes.data[0].lon;

//     const overpassQuery = `
// [out:json][timeout:25];
// (
//   nwr["shop"](around:15000,${lat},${lon});
//   nwr["amenity"](around:15000,${lat},${lon});
//   nwr["office"](around:15000,${lat},${lon});
//   nwr["craft"](around:15000,${lat},${lon});
// );
// out body;
// `;

//     const response = await axios.post(
//       "https://overpass-api.de/api/interpreter",
//       overpassQuery,
//       {
//         headers: {
//           "Content-Type": "text/plain",
//           "User-Agent": "FixItApp/1.0"
//         }
//       }
//     );

//     const normalize = (text) =>
//       (text || "")
//         .toLowerCase()
//         .replace(/[^a-z0-9 ]/g, " ");

//     const serviceKeywordsMap = {
//       ac: ["ac", "air", "cooling", "hvac", "refrigeration"],
//       plumbing: ["plumber", "plumbing", "water", "pipe", "sanitary"],
//       carpenter: ["carpenter", "wood", "furniture", "woodwork"],
//       electrical: ["electric", "wiring", "electrician"],
//       pest: ["pest", "fumigation", "termite", "bug"],
//       cleaning: ["clean", "cleaning", "maid", "housekeeping"]
//     };

//     const baseKeyword = serviceStr
//       .toLowerCase()
//       .split(" ")
//       .find((w) => w.length > 2) || "repair";
    
//     const keywords = serviceKeywordsMap[baseKeyword] || [baseKeyword];

//     let workers = (response.data.elements || [])
//       .filter((item) => {
//         const name = normalize(item.tags?.name);
//         if (!name) return false;

//         const unwanted = [
//           "school", "college", "hospital", "clinic", "bank", "atm", "temple", "church", "tasmac", "blood", "medical"
//         ];
//         if (unwanted.some((u) => name.includes(u))) return false;

//         return keywords.some((k) => name.includes(k));
//       })
//       .slice(0, 10)
//       .map((item, index) => ({
//         _id: item.id || index,
//         name: item.tags?.name || "Unknown Service",
//         service: q,
//         rating: (4 + Math.random()).toFixed(1),
//         verified: true,
//         phone: item.tags?.phone || "9876543210",
//         location: {
//           address:
//             item.tags?.["addr:street"] ||
//             item.tags?.["addr:city"] ||
//             city,
//         },
//       }));

//     // FALLBACK: If OpenStreetMap has no data for this specific service in this city,
//     // inject realistic mock data so the app always looks populated for testing/demo.
//     if (workers.length === 0) {
//       const mockNames = ["Expert", "Pro", "Master", "Reliable", "City"];
//       workers = Array.from({ length: 4 }).map((_, i) => ({
//         _id: `mock_${Date.now()}_${i}`,
//         name: `${mockNames[i]} ${serviceStr} Services`,
//         service: q,
//         rating: (4.2 + (Math.random() * 0.7)).toFixed(1),
//         verified: true,
//         phone: `987654321${i}`,
//         location: {
//           address: `${city} Main Road, ${city}`
//         }
//       }));
//     }

//     res.json({
//       success: true,
//       workers,
//     });
//   } catch (error) {
//     console.log("OVERPASS ERROR:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Overpass failed",
//     });
//   }
// });

// export default router;