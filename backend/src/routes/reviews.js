import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import Review from "../models/Review.js";

const r = Router();

r.post("/", authRequired, async (req, res) => {
  try {
    const { rideId, ownerId, rating, comment } = req.body;
    if (!rideId || !ownerId || !rating)
      return res.status(400).json({ error: "Missing fields" });

    const review = await Review.create({
      rideId,
      ownerId,
      userId: req.user.id,
      rating,
      comment,
    });
    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

r.get("/owner/:ownerId", async (req, res) => {
  try {
    const reviews = await Review.find({ ownerId: req.params.ownerId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

export default r;
