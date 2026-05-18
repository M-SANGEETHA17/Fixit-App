/**
 * Central API Configuration
 * Used to resolve the Backend API endpoint dynamically based on environment.
 *
 * For LOCAL development:
 *   Create a file: Frontend/.env.local
 *   Add this line:  REACT_APP_USE_LOCAL_BACKEND=true
 *   Then restart React dev server.
 *
 * For APK / Production:
 *   Never set REACT_APP_USE_LOCAL_BACKEND — always uses Render backend.
 */

const PRODUCTION_URL = "https://fixit-app-w0dp.onrender.com";
const LOCAL_URL      = "http://localhost:5005";

const getBaseUrl = () => {
  // 1. Native Android/iOS app (Capacitor) — localhost = phone itself, must use production
  const isCapacitor =
    typeof window !== "undefined" && window.Capacitor?.isNativePlatform?.();
  if (isCapacitor) {
    console.log("API Config: Native APK — Using Production Backend");
    return PRODUCTION_URL;
  }

  // 2. Web running on localhost (developer machine)
  const isLocalHost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  if (isLocalHost) {
    // Reads from Frontend/.env.local — set REACT_APP_USE_LOCAL_BACKEND=true for local dev
    const useLocal = process.env.REACT_APP_USE_LOCAL_BACKEND === "true";
    if (useLocal) {
      console.log("API Config: Web Localhost — Using Local Backend (Port 5005)");
      return LOCAL_URL;
    }
    console.log("API Config: Web Localhost — Using Production Backend");
    return PRODUCTION_URL;
  }

  // 3. Deployed web (Netlify / Vercel / any host)
  console.log("API Config: Production Web — Using Production Backend");
  return PRODUCTION_URL;
};

export const API_BASE_URL = getBaseUrl();
export default API_BASE_URL;

