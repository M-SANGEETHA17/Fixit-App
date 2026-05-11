import express from "express";
import User from "../models/UserModels.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, phone, email, password, address } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const newUser = new User({
      name,
      phone,
      email,
      password,
      address
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: newUser
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // check empty fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found"
      });
    }

    if ((user.status || "").trim().toLowerCase() === "inactive") {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated by admin"
      });
    }

    if ((user.password || "").trim() !== password.trim()) {
      return res.status(400).json({
        success: false,
        message: "Wrong password"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login success",
      user
    });

  } catch (error) {
    console.log("User Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

router.put("/status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;