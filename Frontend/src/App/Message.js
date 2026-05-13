import axios from "axios";

export const handleBookingAndNotify = async ({
  name,
  phone,
  serviceType,
  location,
  selected,   // selected worker object (optional)
}) => {
  try {
    const payload = {
      name,
      phone,
      serviceType,
      location,
    };
    if (selected && selected._id) {
      payload.workerId = selected._id;   // manual worker selection
    }

    const res = await axios.post(
      "https://fixit-app-w0dp.onrender.com/api/bookings/create",
      payload
    );
    return res.data.success;
  } catch (error) {
    console.log("Booking error:", error.response?.data || error.message);
    return false;
  }
};