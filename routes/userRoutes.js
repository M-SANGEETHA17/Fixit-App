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

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    const userPassword = user.password || "";
    if (userPassword.trim() !== password.trim()) {
      return res.status(400).json({
        message: "Wrong password"
      });
    }

    res.json({
      message: "Login success",
      user
    });

  } catch (error) {
    console.log("User Login Error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
});

export default router;