import { useState } from "react";
import {
  GoogleMap,
  LoadScript,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { api } from "../../services/api";
import Button from "../../components/Button";

export default function RideSearch({ onResults, toast }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [seats, setSeats] = useState(1);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [loading, setLoading] = useState(false);
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

  const hyderabadCenter = { lat: 17.385, lng: 78.4867 };

  const submit = async (e) => {
    e.preventDefault();

    const finalFrom = from === "custom" ? customFrom.trim() : from;
    const finalTo = to === "custom" ? customTo.trim() : to;

    if (!finalFrom || !finalTo) return toast("Enter both locations", "error");

    setLoading(true);
    try {
      const { data } = await api.get("/rides/search", {
        params: { from: finalFrom, to: finalTo, date, seats },
      });
      onResults(data || []);
      if (!data?.length) toast("No rides found for this route/date", "warn");
    } catch {
      toast("Failed to search rides", "error");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <form onSubmit={submit} className="card p-4 space-y-3">
      <h3 className="text-lg font-semibold">Find Rides (Hyderabad only)</h3>

      {/* FROM */}
      <select
        className="w-full border p-3 rounded"
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
          className="w-full border p-3 rounded"
          placeholder="Enter custom starting point"
          value={customFrom}
          onChange={(e) => setCustomFrom(e.target.value)}
        />
      )}

      {/* TO */}
      <select
        className="w-full border p-3 rounded"
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
          className="w-full border p-3 rounded"
          placeholder="Enter custom destination"
          value={customTo}
          onChange={(e) => setCustomTo(e.target.value)}
        />
      )}

      {/* MAP PREVIEW + DISTANCE INFO */}
      {from &&
        to &&
        from !== to &&
        from !== "custom" &&
        to !== "custom" && (
          <div className="rounded-lg overflow-hidden border mt-2">
            <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={{ height: "250px", width: "100%" }}
                center={hyderabadCenter}
                zoom={12}
              >
                <DirectionsService
                  options={{
                    origin: from + ", Hyderabad",
                    destination: to + ", Hyderabad",
                    travelMode: "DRIVING",
                  }}
                  callback={handleDirectionsResponse}
                />
                {directions && (
                  <DirectionsRenderer
                    options={{
                      directions: directions,
                      polylineOptions: {
                        strokeColor: "#2563eb",
                        strokeWeight: 5,
                      },
                    }}
                  />
                )}
              </GoogleMap>
            </LoadScript>

            {/* Distance and Duration */}
            {distance && duration && (
              <div className="p-2 bg-gray-100 text-center text-sm text-gray-700">
                🛣 {distance} • ⏱ {duration}
              </div>
            )}
          </div>
        )}

      {/* DATE + SEATS */}
      <div className="grid grid-cols-2 gap-3">
        <input
          className="border p-3 rounded"
          type="date"
          value={date}
          min={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          className="border p-3 rounded"
          type="number"
          min={1}
          max={6}
          value={seats}
          onChange={(e) => setSeats(parseInt(e.target.value || "1"))}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Searching…" : "Search"}
      </Button>
    </form>
  );
}
