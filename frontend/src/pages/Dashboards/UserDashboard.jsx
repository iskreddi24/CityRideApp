import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GoogleMap,
  LoadScript,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { api } from "../../services/api";
import Button from "../../components/Button";
import FeedbackForm from "../../components/FeedbackForm";
import "../../styles/user.css";

const mapContainerStyle = {
  height: "250px",
  width: "100%",
  borderRadius: "10px",
};

const hyderabadCenter = { lat: 17.385, lng: 78.4867 };

export default function UserDashboard({ toast }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [date, setDate] = useState("");
  const [seats, setSeats] = useState(1);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [tab, setTab] = useState("search");
  const [selectedRide, setSelectedRide] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Distance/time info
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");

  const defaultLocations = [
    "Madhapur",
    "Gachibowli",
    "Kondapur",
    "Hitec City",
    "Ameerpet",
    "Secunderabad",
    "LB Nagar",
    "Banjara Hills",
    "Jubilee Hills",
    "Kukatpally",
  ];

  // Fetch user's bookings
  useEffect(() => {
    if (tab === "bookings") {
      api
        .get("/bookings/my")
        .then(({ data }) => setMyBookings(data))
        .catch(() => toast("Failed to fetch bookings", "error"));
    }
  }, [tab]);

  // 🔍 Search rides
  const searchRides = async (e) => {
    e.preventDefault();
    const finalFrom = from === "custom" ? customFrom.trim() : from;
    const finalTo = to === "custom" ? customTo.trim() : to;

    if (!finalFrom || !finalTo) return toast("Please select both locations", "error");

    setLoading(true);
    try {
      const { data } = await api.get("/rides/search", {
        params: { from: finalFrom, to: finalTo, date, seats },
      });

      // attach distance/duration to each ride result
      setRides(
        data.map((r) => ({
          ...r,
          distance,
          duration,
        }))
      );
    } catch {
      toast("Failed to fetch rides", "error");
    } finally {
      setLoading(false);
    }
  };

  // 📍 Directions API callback
  const handleDirectionsResponse = (response) => {
    if (response?.status === "OK") {
      setDirections(response);
      const leg = response.routes[0].legs[0];
      setDistance(leg.distance.text);
      setDuration(leg.duration.text);
    } else {
      setDirections(null);
      setDistance("");
      setDuration("");
    }
  };

  // 💳 Confirm Booking inside modal
  const confirmBooking = async () => {
    try {
      const seatsBooked = parseInt(prompt("Enter number of seats:", "1"));
      if (!seatsBooked || seatsBooked < 1) return;

      toast("Processing payment...", "info");
      await new Promise((r) => setTimeout(r, 1200));

      await api.post("/bookings/confirm", {
        rideId: selectedRide._id,
        paymentId: `mock_payment_${Date.now()}`,
        seatsBooked,
      });

      toast("Booking confirmed ✅", "success");
      setShowModal(false);
      setTab("bookings");
    } catch {
      toast("Booking failed", "error");
    }
  };

  return (
    <div className="user-dashboard">
      {/* Navigation Tabs */}
      <div className="tab-buttons">
        <button
          onClick={() => setTab("search")}
          className={tab === "search" ? "active" : ""}
        >
          🔍 Find Rides
        </button>
        <button
          onClick={() => setTab("bookings")}
          className={tab === "bookings" ? "active" : ""}
        >
          📘 My Bookings
        </button>
      </div>

      {/* -------- SEARCH RIDES -------- */}
      {tab === "search" && (
        <div className="card p-4 space-y-4">
          <h2 className="text-lg font-semibold">Search Rides (Hyderabad Only)</h2>

          <form onSubmit={searchRides} className="grid gap-3 md:grid-cols-2">
            {/* FROM */}
            <select
              className="border p-3 rounded"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            >
              <option value="">Select Start Point</option>
              {defaultLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
              <option value="custom">Other (Enter manually)</option>
            </select>

            {from === "custom" && (
              <input
                className="border p-3 rounded md:col-span-2"
                placeholder="Enter custom start point"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
            )}

            {/* TO */}
            <select
              className="border p-3 rounded"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            >
              <option value="">Select Destination</option>
              {defaultLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
              <option value="custom">Other (Enter manually)</option>
            </select>

            {to === "custom" && (
              <input
                className="border p-3 rounded md:col-span-2"
                placeholder="Enter custom destination"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            )}

            {/* Date + Seats */}
            <input
              type="date"
              className="border p-3 rounded"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <select
              className="border p-3 rounded"
              value={seats}
              onChange={(e) => setSeats(e.target.value)}
            >
              <option value="1">1 Seat</option>
              <option value="2">2 Seats</option>
              <option value="3">3 Seats</option>
              <option value="4">4 Seats</option>
            </select>

            <Button type="submit" disabled={loading}>
              {loading ? "Searching…" : "Search"}
            </Button>
          </form>

          {/* Google Map Preview */}
          {from &&
            to &&
            from !== to &&
            from !== "custom" &&
            to !== "custom" && (
              <div className="mt-4 rounded border overflow-hidden">
                <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={hyderabadCenter}
                    zoom={12}
                  >
                    <DirectionsService
                      options={{
                        origin: `${from}, Hyderabad`,
                        destination: `${to}, Hyderabad`,
                        travelMode: "DRIVING",
                      }}
                      callback={handleDirectionsResponse}
                    />
                    {directions && (
                      <DirectionsRenderer
                        options={{
                          directions,
                          polylineOptions: {
                            strokeColor: "#2563eb",
                            strokeWeight: 5,
                          },
                        }}
                      />
                    )}
                  </GoogleMap>
                </LoadScript>

                {distance && duration && (
                  <div className="p-2 text-center bg-gray-100 text-gray-700">
                    🛣 {distance} • ⏱ {duration}
                  </div>
                )}
              </div>
            )}

          {/* Ride Results */}
          {rides.length > 0 ? (
            <ul className="space-y-3 mt-4">
              {rides.map((r) => (
                <li
                  key={r._id}
                  className="border rounded-lg p-3 shadow-sm flex justify-between items-center"
                >
                  <div>
                    <strong>{r.startPoint}</strong> →{" "}
                    <strong>{r.endPoint}</strong>
                    <div className="text-sm text-gray-500">
                      {r.date} {r.time ? `• ${r.time}` : ""}
                    </div>
                    <div className="text-sm text-gray-500">
                      ₹{r.pricePerRide} per seat • {r.availableSeats} seats left
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      📍 Pickup: {r.pickupAddress || "N/A"} <br />
                      📍 Drop: {r.dropAddress || "N/A"}
                    </div>
                  </div>

                  <Button onClick={() => { setSelectedRide(r); setShowModal(true); }}>
                    Book Ride
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            !loading && (
              <p className="text-center text-gray-500 mt-4">
                No rides found. Try adjusting your search.
              </p>
            )
          )}
        </div>
      )}

      {/* -------- BOOKINGS -------- */}
      {tab === "bookings" && (
        <div className="card p-4">
          <h2 className="text-lg font-semibold mb-2">My Bookings</h2>
          {myBookings.length > 0 ? (
            <ul className="space-y-3">
              {myBookings.map((b) => (
                <li key={b._id} className="booking-item card p-3">
                  <div>
                    <strong>{b.ride?.startPoint}</strong> →{" "}
                    <strong>{b.ride?.endPoint}</strong>
                    <div className="text-sm text-gray-500">
                      {b.ride?.date} • {b.ride?.time || "—"} <br />
                      Status: <b>{b.status}</b> | Paid ₹
                      {(b.paymentAmount / 100).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      📍 Pickup: {b.ride?.pickupAddress || "N/A"} <br />
                      📍 Drop: {b.ride?.dropAddress || "N/A"}
                    </div>
                  </div>

                  {b.status === "Completed" && (
                    <div className="mt-2">
                      <FeedbackForm
                        rideId={b.ride?._id}
                        ownerId={b.ride?.ownerId}
                        toast={toast}
                        onSubmitted={() =>
                          toast("Feedback submitted successfully!", "success")
                        }
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 mt-4">No bookings yet.</p>
          )}
        </div>
      )}

      {/* -------- Booking Modal -------- */}
      <AnimatePresence>
        {showModal && selectedRide && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="bg-white w-full md:w-[500px] p-5 rounded-t-2xl shadow-lg"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold mb-2 text-center">
                {selectedRide.startPoint} → {selectedRide.endPoint}
              </h2>

              <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={hyderabadCenter}
                  zoom={13}
                >
                  <DirectionsService
                    options={{
                      origin: `${selectedRide.startPoint}, Hyderabad`,
                      destination: `${selectedRide.endPoint}, Hyderabad`,
                      travelMode: "DRIVING",
                    }}
                    callback={handleDirectionsResponse}
                  />
                  {directions && <DirectionsRenderer options={{ directions }} />}
                </GoogleMap>
              </LoadScript>

              {distance && duration && (
                <p className="mt-2 text-center text-sm text-gray-700">
                  🛣 {distance} • ⏱ {duration}
                </p>
              )}

              <div className="mt-4 flex justify-between">
                <Button onClick={() => setShowModal(false)} className="bg-gray-300">
                  Cancel
                </Button>
                <Button onClick={confirmBooking} className="primary">
                  Confirm Booking
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
