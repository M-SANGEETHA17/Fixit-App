import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import bookingRoutes from "./routes/bookingRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import workerRoutes from "./routes/workerRoutes.js";
import adminRoute from "./routes/adminRoute.js";

import jobRoutes from "./routes/jobRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
// import overpassRoutes from "./routes/overpassRoutes.js";
import fetchRoutes from './routes/fetchRoutes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: "*"
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));


app.use("/api/otp", otpRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/admin", adminRoute);
app.use("/api", jobRoutes);
app.use("/api/feedback", feedbackRoutes);
// app.use("/api", overpassRoutes);
app.use('/api/fetch', fetchRoutes);

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


app.listen(5000, () => {
  console.log("Server running on port 5000 ");
});
