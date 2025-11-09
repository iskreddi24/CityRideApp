import { useState } from "react";
import { api } from "../services/api";
import Button from "./Button";

export default function FeedbackForm({ rideId, ownerId, onSubmitted, toast }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/reviews", { rideId, ownerId, rating, comment });
      toast("Thanks for your feedback!", "success");
      onSubmitted && onSubmitted();
    } catch {
      toast("Failed to submit review", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="card p-4 space-y-3">
      <h3 className="text-lg font-semibold">Rate your ride</h3>
      <input type="number" className="border p-3 rounded" min={1} max={5} value={rating}
             onChange={(e)=>setRating(parseInt(e.target.value||"5"))} />
      <textarea className="border p-3 rounded" placeholder="Write a short review"
                value={comment} onChange={(e)=>setComment(e.target.value)} />
      <Button type="submit" disabled={loading}>{loading ? "Submitting…" : "Submit"}</Button>
    </form>
  );
}
