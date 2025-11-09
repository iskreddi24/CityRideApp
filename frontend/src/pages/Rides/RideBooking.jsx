import { useState } from "react";
import { api } from "../../services/api";
import Button from "../../components/Button";

export default function RideBooking({ ride, onDone, toast }) {
  const [loading, setLoading] = useState(false);

  const payAndBook = async () => {
    try {
      setLoading(true);
      const paise = (ride.price || 0) * 100;
      const { data } = await api.post("/payments/create-order", { amountPaise: paise });

      if (!window.Razorpay) {
        await new Promise((res, rej) => {
          const s = document.createElement("script");
          s.src = "https://checkout.razorpay.com/v1/checkout.js";
          s.onload = res; s.onerror = rej; document.body.appendChild(s);
        });
      }

      const razor = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "CityRide Connect",
        description: `${ride.from} → ${ride.to}`,
        order_id: data.orderId,
        handler: async (resp) => {
          await api.post("/bookings/confirm", {
            rideId: ride._id,
            paymentId: resp.razorpay_payment_id,
            orderId: resp.razorpay_order_id,
            signature: resp.razorpay_signature
          });
          toast("Booking confirmed!", "success");
          onDone && onDone();
        },
        theme: { color: "#4f46e5" }
      });
      razor.open();
    } catch (e) {
      console.error(e);
      toast("Payment/booking failed", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!ride) return null;
  return (
    <div className="card p-4 space-y-2">
      <h3 className="text-lg font-semibold">Confirm Ride</h3>
      <div>{ride.from} → {ride.to}</div>
      <div>Date: {ride.date}</div>
      <div>Fare: <b>₹{ride.price}</b></div>
      <Button onClick={payAndBook} disabled={loading}>{loading ? "Processing…" : "Pay & Book"}</Button>
    </div>
  );
}
