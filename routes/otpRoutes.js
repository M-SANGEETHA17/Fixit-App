import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Initialize Nodemailer transporter with Brevo SMTP
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS, 
  },
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error(" SMTP Connection Error:", error.message);
  } else {
    console.log(" SMTP Server is ready to take our messages");
  }
});

// In-memory store to track OTPs
const otpStore = new Map();

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.json({ success: false, message: "Email is missing" });
    }

    if (!process.env.BREVO_USER || !process.env.BREVO_PASS) {
      console.error("Missing Brevo credentials in .env");
      return res.json({ success: false, message: "Server configuration error" });
    }

    console.log("➡️ ATTEMPTING TO SEND OTP TO:", email);
    console.log("ℹ️ Using SMTP User:", process.env.BREVO_USER);

    // Generate 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in map with 10 minute expiration
    otpStore.set(email, {
      otp: generatedOtp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 mins
    });

    // Send the email
    const mailOptions = {
      from: '"Fixit App" <sangeetha.m17107@gmail.com>',
      to: email,
      subject: "Your FixIt Verification Code",
      text: `Your OTP for FixIt verification is: ${generatedOtp}. It is valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">FixIt Verification Code</h2>
          <p>Please use the following OTP to verify your booking:</p>
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 8px;">
            ${generatedOtp}
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">This code is valid for 10 minutes. Do not share this code with anyone.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ EMAIL SENT:", info.messageId);

    return res.json({ success: true, message: "OTP Sent Successfully" });

  } catch (err) {
    console.error("❌ Email Send Error:", err.message || err);
    return res.json({ success: false, message: err.message || "Failed to send email" });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.json({ success: false, message: "Email or OTP missing" });
    }

    console.log("➡️ VERIFYING OTP FOR:", email);

    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.json({ success: false, message: "OTP expired or not requested" });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.json({ success: false, message: "OTP expired" });
    }

    if (storedData.otp === otp.trim()) {
      otpStore.delete(email); // Delete after successful verification
      console.log("✅ VERIFICATION STATUS: approved");
      return res.json({ success: true, message: "OTP Verified Successfully" });
    }
    
    console.log("❌ VERIFICATION STATUS: failed");
    return res.json({ success: false, message: "Invalid OTP" });

  } catch (err) {
    console.error("❌ Email Verify Error:", err.message);
    return res.json({ success: false, message: err.message });
  }
});

export default router;