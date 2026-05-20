import dotenv from "dotenv";
dotenv.config();  // ← MUST be first — loads .env before any route module reads process.env

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import bookingRoutes from "./routes/bookingRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import workerRoutes from "./routes/workerRoutes.js";
import adminRoute from "./routes/adminRoute.js";
import diagnosisRoutes from "./routes/diagnosisRoute.js";
import jobRoutes from "./routes/jobRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
// import overpassRoutes from "./routes/overpassRoutes.js";
import fetchRoutes from './routes/fetchRoutes.js';
import queryRoutes from "./routes/queryRoutes.js";
import ViewProfile from "./routes/viewprofileRoutes.js";
import Worker from "./models/Worker.js";

import sosRoutes from "./routes/sosRoute.js";


const app = express();

app.use(cors({
  origin: "*"
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    
    setInterval(async () => {
      try {
        const thresholdDate = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000); // 21 days ago
        const result = await Worker.updateMany(
          { lastActive: { $lt: thresholdDate }, isOnline: true },
          { $set: { isOnline: false } }
        );
        if (result.modifiedCount > 0) {
          console.log(`[Worker Status] Auto-marked ${result.modifiedCount} inactive workers as offline.`);
        }
      } catch (err) {
        console.error("Error updating worker status automatically:", err);
      }
    }, 60 * 60 * 1000); 
  })
  .catch((err) => console.log(err));



app.use("/api", diagnosisRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/admin", adminRoute);
app.use("/api", jobRoutes);
app.use("/api/feedback", feedbackRoutes);
// app.use("/api", overpassRoutes);
app.use('/api/fetch', fetchRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/profile",ViewProfile)


app.use("/api/sos", sosRoutes);
app.get("/api/queries-test", (req, res) => res.send("Query Route Active!"));

app.get("/api/settings", (req, res) => {
  res.json({
    companyName: "Life Changers Ind",
    mainBranch: "5/106A, JJ Nagar, Reddiarpatti, Tirunelveli, Tamil Nadu 627007",
    subBranch: "Makkah Mukarramah Street, Safath, Jubail - 35514",
    phones: [
      "+91 94860 42369",
      "+91 99430 42369",
      "+91 81480 42369"
    ],
    email: "lifechangersind@gmail.com"
  });
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});


// Force Nodemon server refresh: 2026-05-19T15:59:19+05:30
app.listen(5005, () => {
  console.log("Server running on port 5005");
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
      console.error(" Windows is silently running an OLD, STALE version of your server!");

  } else {
      console.error(" Server start failed:", err.message);
  }
});
