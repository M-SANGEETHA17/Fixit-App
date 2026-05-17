export const sendWhatsAppMessage = (phone, userName, service, date, time, location) => {
  console.log("Received phone:", phone);
  const safePhone = phone?.toString().replace(/\D/g, "");
  if (!safePhone) {
    alert("Worker phone number not available");
    return;
  }
  let cleanPhone = safePhone;
  if (cleanPhone.length === 10) cleanPhone = "91" + cleanPhone;
  if (cleanPhone.length !== 12) {
    alert("Invalid phone number format");
    return;
  }
  const message = `New Booking Alert!\n${userName} has requested your ${service} service.\nDate: ${date}\nTime: ${time}\nLocation: ${location || "Not specified"}\nPlease respond quickly!`;
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.location.href = url;
};