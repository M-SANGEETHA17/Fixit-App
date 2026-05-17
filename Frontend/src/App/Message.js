import axios from "axios";
import { API_BASE_URL } from "../config";

export const handleBookingAndNotify = async ({
  name,
  phone,
  serviceType,
  location,
  bookingDate,
  bookingTime,
  geoLocation, // Add optional high-precision { lat, lng } coordinates
  selected,   // selected worker object (optional)
}) => {
  try {
    const payload = {
      name,
      phone,
      serviceType,
      location,
      bookingDate,
      bookingTime,
      geoLocation: geoLocation || undefined,
    };
    if (selected && selected._id) {
      payload.workerId = selected._id;   // manual worker selection
    }

    console.group("📤 [API Client] Outgoing Booking Payload");
    console.log("Payload Details:", payload);
    console.groupEnd();

    const res = await axios.post(
      `${API_BASE_URL}/api/bookings/create`,
      payload
    );
    return res.data.success;
  } catch (error) {
    console.log("Booking error:", error.response?.data || error.message);
    return false;
  }
};