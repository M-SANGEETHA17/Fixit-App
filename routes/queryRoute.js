import express from "express";
import Query from "../models/Query.js";

const router = express.Router();


// ADD QUERY
router.post("/", async (req, res) => {
  try {
    const newQuery = new Query(req.body);
    await newQuery.save();

    res.json({
      success: true,
      message: "Query submitted successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});


// GET ALL QUERIES
router.get("/all", async (req, res) => {
  try {
    const queries = await Query.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      queries,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
    });
  }
});

export default router;