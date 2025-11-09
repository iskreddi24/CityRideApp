import { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function MyBookings({ toast }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/bookings/my")
      .then(({ data }) => setItems(data || []))
      .catch(() => toast("Failed to load bookings", "error"));
  }, []);

  if (!items.length) return <div className="card p-4">No bookings yet.</div>;

  return (
    <div className="card p-4 space-y-3">
      <h3 className="text-lg font-semibold">My Bookings</h3>
      {items.map((b) => (
        <div key={b._id} className="border rounded p-3">
          <div className="font-semibold">{b.ride?.from} → {b.ride?.to}</div>
          <div className="text-sm text-gray-600">Date: {b.ride?.date} • Status: {b.status}</div>
          <div className="text-sm">Paid: ₹{(b.amount || 0) / 100}</div>
        </div>
      ))}
    </div>
  );
}
