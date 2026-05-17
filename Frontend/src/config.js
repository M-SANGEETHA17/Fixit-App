/**
 * Central API Configuration
 * Used to resolve the Backend API endpoint dynamically based on environment.
 */

const getBaseUrl = () => {
  // 1. Mobile App Environment Detection (Capacitor)
  // If running on an Android/iOS device, 'localhost' refers to the device itself.
  // We must ALWAYS use the production server here so data loads on phones.
  const isCapacitor = typeof window !== "undefined" && window.Capacitor?.isNativePlatform?.();
  if (isCapacitor) {
    console.log("API Config: Running in Native App - Using Production Backend");
    return "https://fixit-app-w0dp.onrender.com";
  }

  // 2. Web Browser Environment Detection
  const isLocalHost = typeof window !== "undefined" && 
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  if (isLocalHost) {
    // TIP FOR DEVELOPERS: 
    // If you have started your local Node.js backend (server.js) on port 5005,
    // you can change this to return "http://localhost:5005".
    //
    // To prevent the app from breaking when the local backend is offline, 
    // we default to the working Production database.
    const useLocalBackend = true; // Change to true if running server.js locally

    if (useLocalBackend) {
      console.log("API Config: Web Localhost - Using Local Backend (Port 5005)");
      return "http://localhost:5005";
    } else {
      console.log("API Config: Web Localhost - Using Production Fallback Backend");
      return "https://fixit-app-w0dp.onrender.com";
    }
  }

  // 3. Production Web Environment
  return "https://fixit-app-w0dp.onrender.com";
};

export const API_BASE_URL = getBaseUrl();
export default API_BASE_URL;
