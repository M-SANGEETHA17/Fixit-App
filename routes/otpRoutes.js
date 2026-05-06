import express from "express";
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,   
  process.env.TWILIO_AUTH_TOKEN     
);

const formatPhone = (phone) => {
  if (!phone) return null;
  return phone.startsWith("+91") ? phone : "+91" + phone;
};

// In-memory store to track OTPs
const otpStore = new Map();

router.post("/send-otp", async (req, res) => {
  const { phone } = req.body;

  try {
    const formattedPhone = formatPhone(phone);
    if (!formattedPhone || formattedPhone.length < 13) {
      return res.json({ success: false, message: "Invalid phone number" });
    }

    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    if (!serviceSid) {
      console.error("Missing TWILIO_VERIFY_SERVICE_SID in .env");
      return res.json({ success: false, message: "Server configuration error" });
    }

    console.log("➡️ SENDING TWILIO VERIFY OTP TO:", formattedPhone);

    const verification = await client.verify.v2
      .services(serviceSid)
      .verifications.create({
        to: formattedPhone,
        channel: "sms",
      });

    console.log("✅ TWILIO STATUS:", verification.status);

    return res.json({ success: true, message: "OTP Sent Successfully" });

  } catch (err) {
    console.error("❌ Twilio Send Error:", err.message);
    return res.json({ success: false, message: err.message });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const formattedPhone = formatPhone(phone);
    if (!formattedPhone || !otp) {
      return res.json({ success: false, message: "Phone or OTP missing" });
    }

    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    
    console.log("➡️ VERIFYING OTP FOR:", formattedPhone);

    const check = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({
        to: formattedPhone,
        code: otp.trim(),
      });

    console.log("✅ VERIFICATION STATUS:", check.status);

    if (check.status === "approved") {
      return res.json({ success: true, message: "OTP Verified Successfully" });
    }
    
    return res.json({ success: false, message: "Invalid OTP" });

  } catch (err) {
    console.error("❌ Twilio Verify Error:", err.message);
    return res.json({ success: false, message: err.message });
  }
});

export default router;