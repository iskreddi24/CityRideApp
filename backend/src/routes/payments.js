import { Router } from "express";
import { authRequired } from "../middleware/auth.js";

const r = Router();

// 💳 Mock payment route — no real Razorpay
r.post("/create-order", authRequired, async (req, res) => {
  const { amountPaise } = req.body || {};
  if (!amountPaise)
    return res.status(400).json({ error: "amountPaise required" });

  try {
    // Simulate a fake order ID
    const fakeOrderId = "mock_order_" + Date.now();

    // Return mock payment info
    res.json({
      orderId: fakeOrderId,
      amount: amountPaise,
      currency: "INR",
      keyId: "mock_key",
      mock: true,
    });
  } catch (err) {
    console.error("💥 Mock payment failed:", err);
    res.status(500).json({ error: "mock_payment_failed" });
  }
});

export default r;
