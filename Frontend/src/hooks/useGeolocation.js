import { useState, useEffect, useCallback, useRef } from "react";

/**
 * A robust, production-ready React hook for fetching and watching user GPS coordinates.
 * Implements best practices for high-accuracy geolocation, permission tracking, error handling,
 * and memory leak prevention.
 *
 * @param {Object} options Configuration options for geolocation query.
 * @returns {Object} Geolocation state and control functions.
 */
export function useGeolocation(options = {}) {
  const [state, setState] = useState({
    loading: false,
    coordinates: { latitude: null, longitude: null },
    accuracy: null,
    timestamp: null,
    error: null,
    permissionStatus: "prompt", // 'granted', 'denied', or 'prompt'
  });

  const watchIdRef = useRef(null);
  const isMountedRef = useRef(true);

  // Merge custom options with strict production-ready defaults
  const geoOptions = useRef({
    enableHighAccuracy: true,
    timeout: 15000, // 15 seconds wait time limit
    maximumAge: 0, // Force fresh location fetch, disable caching
    ...options,
  });

  // Helper to safely update component state if mounted
  const safeSetState = useCallback((newState) => {
    if (isMountedRef.current) {
      setState((prev) => ({ ...prev, ...newState }));
    }
  }, []);

  // Handle successful coordinate retrieval
  const handleSuccess = useCallback(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      console.group("📍 [Geolocation] GPS Update Success");
      console.log("Latitude:", latitude);
      console.log("Longitude:", longitude);
      console.log("Accuracy:", `${accuracy} meters`);
      console.log("Timestamp:", new Date(position.timestamp).toLocaleTimeString());
      console.groupEnd();

      safeSetState({
        loading: false,
        coordinates: { latitude, longitude },
        accuracy,
        timestamp: position.timestamp,
        error: null,
      });
    },
    [safeSetState]
  );

  // Handle location retrieval errors
  const handleError = useCallback(
    (error) => {
      let errorMessage = "An unknown geolocation error occurred.";
      let userGuidance = "";

      console.group("🚨 [Geolocation] Error Triggered");
      console.error("Code:", error.code);
      console.error("Message:", error.message);

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Location Access Denied.";
          userGuidance =
            "Please enable location permissions for this site in your browser settings (look for the lock icon in the address bar).";
          safeSetState({ permissionStatus: "denied" });
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Position Unavailable.";
          userGuidance =
            "Your device is unable to establish a GPS connection. Please ensure GPS/location services are turned on.";
          break;
        case error.TIMEOUT:
          errorMessage = "Location Request Timed Out.";
          userGuidance =
            "The request took too long to get your location. Please click Retry or ensure you are in a clear GPS area.";
          break;
        default:
          break;
      }
      console.groupEnd();

      safeSetState({
        loading: false,
        error: {
          code: error.code,
          message: errorMessage,
          guidance: userGuidance,
        },
      });
    },
    [safeSetState]
  );

  // Track permission API state dynamically in modern browsers
  const trackPermission = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.permissions && navigator.permissions.query) {
      try {
        const status = await navigator.permissions.query({ name: "geolocation" });
        console.log(`🔒 [Geolocation] Permission State Initialized: ${status.state}`);
        safeSetState({ permissionStatus: status.state });

        status.onchange = () => {
          console.log(`🔒 [Geolocation] Permission State Changed: ${status.state}`);
          safeSetState({ permissionStatus: status.state });
        };
      } catch (err) {
        console.warn("⚠️ [Geolocation] Permissions API query not supported on this browser environment.", err);
      }
    }
  }, [safeSetState]);

  // Stop watching position and cleanup listeners
  const clearWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      console.log("⏹️ [Geolocation] WatchPosition Stopped.");
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Method to perform a ONE-TIME precise location fetch
  const getOneTimeLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      safeSetState({
        error: {
          code: 0,
          message: "Unsupported Browser",
          guidance: "Geolocation is not supported by this browser version.",
        },
      });
      return;
    }

    console.log("🔄 [Geolocation] Requesting Fresh Coordinates...");
    safeSetState({ loading: true, error: null });

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      geoOptions.current
    );
  }, [handleSuccess, handleError, safeSetState]);

  // Method to start CONTINUOUS monitoring of position
  const startWatch = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      safeSetState({
        error: {
          code: 0,
          message: "Unsupported Browser",
          guidance: "Geolocation is not supported by this browser.",
        },
      });
      return;
    }

    // Clear any existing watcher before setting a new one
    clearWatch();

    console.log("📡 [Geolocation] Starting Continuous Watch mode...");
    safeSetState({ loading: true, error: null });

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      geoOptions.current
    );
  }, [handleSuccess, handleError, clearWatch, safeSetState]);

  // Effect to handle mount tracking, permissions initialization, and cleanup
  useEffect(() => {
    isMountedRef.current = true;
    trackPermission();

    // Optional: automatically fetch location once on mount
    // getOneTimeLocation();

    return () => {
      isMountedRef.current = false;
      clearWatch();
    };
  }, [trackPermission, clearWatch]);

  return {
    ...state,
    retry: getOneTimeLocation,
    getOneTimeLocation,
    startWatch,
    stopWatch: clearWatch,
    isWatching: watchIdRef.current !== null,
  };
}
