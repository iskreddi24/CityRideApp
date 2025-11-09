// import { useEffect, useState } from "react";
// import {
//   GoogleMap,
//   LoadScript,
//   Marker,
//   DirectionsService,
//   DirectionsRenderer,
// } from "@react-google-maps/api";
// import { api } from "../../services/api";
// import Button from "../../components/Button";

// const mapContainerStyle = {
//   height: "300px",
//   width: "100%",
//   borderRadius: "10px",
// };

// const hyderabadCenter = { lat: 17.385, lng: 78.4867 };

// export default function OwnerDashboard({ toast }) {
//   const [tab, setTab] = useState("vehicles");
//   const [vehicles, setVehicles] = useState([]);
//   const [rides, setRides] = useState([]);
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [totalEarnings, setTotalEarnings] = useState(0);
//   const [editVehicleId, setEditVehicleId] = useState(null);
//   const [editRideId, setEditRideId] = useState(null);

//   const [vehicleForm, setVehicleForm] = useState({
//     model: "",
//     plate: "",
//     type: "Car",
//     rcDoc: null,
//     insuranceDoc: null,
//   });

//   const [rideForm, setRideForm] = useState({
//     startPoint: "",
//     endPoint: "",
//     pickupAddress: "",
//     dropAddress: "",
//     date: "",
//     time: "",
//     pricePerRide: "",
//     availableSeats: "",
//     vehicleId: "",
//   });

//   const [pickupLocation, setPickupLocation] = useState(hyderabadCenter);
//   const [dropLocation, setDropLocation] = useState(hyderabadCenter);

//   // 🌍 Auto detect current location
//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (pos) => {
//           setPickupLocation({
//             lat: pos.coords.latitude,
//             lng: pos.coords.longitude,
//           });
//         },
//         () => toast("Location permission denied. Using Hyderabad default.", "error"),
//         { enableHighAccuracy: true, timeout: 5000 }
//       );
//     }
//   }, []);

//   // 📥 Fetch vehicles & rides
//   const loadData = async () => {
//     try {
//       const [vehiclesRes, ridesRes] = await Promise.all([
//         api.get("/vehicles/my"),
//         api.get("/rides/my"),
//       ]);
//       setVehicles(vehiclesRes.data || []);
//       setRides(ridesRes.data || []);
//     } catch {
//       toast("Failed to load owner data", "error");
//     }
//   };

//   // 👥 Load bookings
//   const loadBookings = async () => {
//     setLoading(true);
//     try {
//       const { data } = await api.get("/bookings/owner");
//       setBookings(data || []);
//       const total = data.reduce((sum, b) => sum + (b.amount || 0), 0);
//       setTotalEarnings(total);
//     } catch {
//       toast("Failed to load bookings", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (tab === "bookings") loadBookings();
//     else loadData();
//   }, [tab]);

//   // 🚗 Vehicle form submit
//   const submitVehicle = async (e) => {
//     e.preventDefault();
//     if (!vehicleForm.model || !vehicleForm.plate)
//       return toast("Fill all fields", "error");

//     const formData = new FormData();
//     formData.append("model", vehicleForm.model);
//     formData.append("plate", vehicleForm.plate);
//     formData.append("type", vehicleForm.type);
//     if (vehicleForm.rcDoc) formData.append("rcDoc", vehicleForm.rcDoc);
//     if (vehicleForm.insuranceDoc)
//       formData.append("insuranceDoc", vehicleForm.insuranceDoc);

//     setLoading(true);
//     try {
//       if (editVehicleId) {
//         await api.put(`/vehicles/${editVehicleId}`, formData, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//         toast("Vehicle updated successfully", "success");
//       } else {
//         await api.post("/vehicles", formData, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//         toast("Vehicle registered successfully", "success");
//       }
//       setVehicleForm({
//         model: "",
//         plate: "",
//         type: "Car",
//         rcDoc: null,
//         insuranceDoc: null,
//       });
//       setEditVehicleId(null);
//       loadData();
//     } catch {
//       toast("Failed to save vehicle", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🚘 Ride form submit
//   const submitRide = async (e) => {
//     e.preventDefault();
//     if (!rideForm.startPoint || !rideForm.endPoint || !rideForm.vehicleId)
//       return toast("Please fill all required fields", "error");

//     setLoading(true);
//     try {
//       if (editRideId) {
//         await api.put(`/rides/${editRideId}`, {
//           ...rideForm,
//           pickupLocation,
//           dropLocation,
//         });
//         toast("Ride updated successfully!", "success");
//       } else {
//         await api.post("/rides", {
//           ...rideForm,
//           pickupLocation,
//           dropLocation,
//         });
//         toast("Ride posted successfully!", "success");
//       }
//       setRideForm({
//         startPoint: "",
//         endPoint: "",
//         pickupAddress: "",
//         dropAddress: "",
//         date: "",
//         time: "",
//         pricePerRide: "",
//         availableSeats: "",
//         vehicleId: "",
//       });
//       setEditRideId(null);
//       loadData();
//     } catch {
//       toast("Failed to save ride", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ❌ Delete operations
//   const deleteVehicle = async (id) => {
//     await api.delete(`/vehicles/${id}`);
//     toast("Vehicle deleted", "success");
//     loadData();
//   };
//   const deleteRide = async (id) => {
//     await api.delete(`/rides/${id}`);
//     toast("Ride deleted", "success");
//     loadData();
//   };

//   // 🧭 DirectionsMap Component
//   const DirectionsMap = ({ pickup, drop }) => {
//     const [directions, setDirections] = useState(null);
//     return (
//       <GoogleMap
//         mapContainerStyle={{ height: "200px", width: "100%" }}
//         center={pickup}
//         zoom={12}
//       >
//         {!directions && (
//           <DirectionsService
//             options={{
//               destination: drop,
//               origin: pickup,
//               travelMode: "DRIVING",
//             }}
//             callback={(response) =>
//               response?.status === "OK" && setDirections(response)
//             }
//           />
//         )}
//         {directions && (
//           <DirectionsRenderer
//             options={{
//               directions: directions,
//               polylineOptions: {
//                 strokeColor: "#2563eb",
//                 strokeWeight: 5,
//               },
//             }}
//           />
//         )}
//         <Marker position={pickup} label="P" />
//         <Marker position={drop} label="D" />
//       </GoogleMap>
//     );
//   };

//   return (
//     <div className="p-4 space-y-4">
//       {/* 🔘 Navigation Tabs */}
//       <div className="flex gap-3 mb-4">
//         <Button
//           onClick={() => setTab("vehicles")}
//           className={tab === "vehicles" ? "primary" : "secondary"}
//         >
//           My Vehicles
//         </Button>
//         <Button
//           onClick={() => setTab("rides")}
//           className={tab === "rides" ? "primary" : "secondary"}
//           disabled={!vehicles.some((v) => v.status === "Approved")}
//         >
//           Post Rides
//         </Button>
//         <Button
//           onClick={() => setTab("bookings")}
//           className={tab === "bookings" ? "primary" : "secondary"}
//         >
//           My Bookings
//         </Button>
//       </div>

//       {/* ---------------- 🚗 VEHICLES TAB ---------------- */}
//       {tab === "vehicles" && (
//         <div className="space-y-4">
//           <div className="card p-4">
//             <h2 className="text-lg font-semibold mb-2">
//               {editVehicleId ? "Edit Vehicle" : "Register Vehicle"}
//             </h2>
//             <form onSubmit={submitVehicle} className="grid gap-3 md:grid-cols-2">
//               <input
//                 className="border p-2 rounded"
//                 placeholder="Vehicle Model"
//                 value={vehicleForm.model}
//                 onChange={(e) =>
//                   setVehicleForm({ ...vehicleForm, model: e.target.value })
//                 }
//               />
//               <input
//                 className="border p-2 rounded"
//                 placeholder="Plate Number"
//                 value={vehicleForm.plate}
//                 onChange={(e) =>
//                   setVehicleForm({ ...vehicleForm, plate: e.target.value })
//                 }
//               />
//               <select
//                 className="border p-2 rounded"
//                 value={vehicleForm.type}
//                 onChange={(e) =>
//                   setVehicleForm({ ...vehicleForm, type: e.target.value })
//                 }
//               >
//                 <option value="Car">Car</option>
//                 <option value="Bike">Bike</option>
//                 <option value="Auto">Auto</option>
//               </select>

//               <input
//                 type="file"
//                 accept="image/*,.pdf"
//                 className="border p-2 rounded"
//                 onChange={(e) =>
//                   setVehicleForm({ ...vehicleForm, rcDoc: e.target.files[0] })
//                 }
//               />
//               <input
//                 type="file"
//                 accept="image/*,.pdf"
//                 className="border p-2 rounded"
//                 onChange={(e) =>
//                   setVehicleForm({
//                     ...vehicleForm,
//                     insuranceDoc: e.target.files[0],
//                   })
//                 }
//               />
//               <Button type="submit" disabled={loading}>
//                 {loading
//                   ? "Saving..."
//                   : editVehicleId
//                   ? "Update Vehicle"
//                   : "Register Vehicle"}
//               </Button>
//             </form>
//           </div>

//           <div className="card p-4">
//             <h2 className="text-lg font-semibold mb-2">My Vehicles</h2>
//             {vehicles.length ? (
//               vehicles.map((v) => (
//                 <div
//                   key={v._id}
//                   className="border rounded p-3 flex justify-between items-center"
//                 >
//                   <div>
//                     <b>{v.model}</b> ({v.plate}) —{" "}
//                     <span
//                       className={`font-semibold ${
//                         v.status === "Approved"
//                           ? "text-green-600"
//                           : "text-gray-600"
//                       }`}
//                     >
//                       {v.status}
//                     </span>
//                   </div>
//                   <div className="flex gap-2">
//                     <Button
//                       onClick={() => {
//                         setVehicleForm(v);
//                         setEditVehicleId(v._id);
//                       }}
//                     >
//                       Edit
//                     </Button>
//                     <Button onClick={() => deleteVehicle(v._id)}>Delete</Button>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <p className="text-gray-500">No vehicles registered yet.</p>
//             )}
//           </div>
//         </div>
//       )}

//       {/* ---------------- 🧭 RIDES TAB ---------------- */}
//       {tab === "rides" && (
//         <div className="space-y-4">
//           <div className="card p-4">
//             <h2 className="text-lg font-semibold mb-2">
//               {editRideId ? "Edit Ride" : "Post New Ride"}
//             </h2>
//             <form onSubmit={submitRide} className="grid gap-3 md:grid-cols-2">
//               <select
//                 className="border p-2 rounded"
//                 value={rideForm.startPoint}
//                 onChange={(e) =>
//                   setRideForm({ ...rideForm, startPoint: e.target.value })
//                 }
//               >
//                 <option value="">Select Start Point</option>
//                 <option value="Madhapur">Madhapur</option>
//                 <option value="Gachibowli">Gachibowli</option>
//                 <option value="Kondapur">Kondapur</option>
//                 <option value="Hitec City">Hitec City</option>
//                 <option value="Ameerpet">Ameerpet</option>
//                 <option value="Secunderabad">Secunderabad</option>
//               </select>

//               <select
//                 className="border p-2 rounded"
//                 value={rideForm.endPoint}
//                 onChange={(e) =>
//                   setRideForm({ ...rideForm, endPoint: e.target.value })
//                 }
//               >
//                 <option value="">Select Destination</option>
//                 <option value="Madhapur">Madhapur</option>
//                 <option value="Gachibowli">Gachibowli</option>
//                 <option value="Kondapur">Kondapur</option>
//                 <option value="Hitec City">Hitec City</option>
//                 <option value="Ameerpet">Ameerpet</option>
//                 <option value="Secunderabad">Secunderabad</option>
//               </select>

//               <textarea
//                 className="border p-2 rounded md:col-span-2"
//                 placeholder="Pickup Address"
//                 value={rideForm.pickupAddress}
//                 onChange={(e) =>
//                   setRideForm({ ...rideForm, pickupAddress: e.target.value })
//                 }
//               />
//               <textarea
//                 className="border p-2 rounded md:col-span-2"
//                 placeholder="Drop Address"
//                 value={rideForm.dropAddress}
//                 onChange={(e) =>
//                   setRideForm({ ...rideForm, dropAddress: e.target.value })
//                 }
//               />

//               {/* 🗺 Google Maps for pickup & drop */}
//               <div className="md:col-span-2 space-y-3">
//                 <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
//                   <h3 className="font-semibold">📍 Select Pickup Location</h3>
//                   <GoogleMap
//                     mapContainerStyle={mapContainerStyle}
//                     center={pickupLocation}
//                     zoom={14}
//                     onClick={(e) =>
//                       setPickupLocation({
//                         lat: e.latLng.lat(),
//                         lng: e.latLng.lng(),
//                       })
//                     }
//                   >
//                     <Marker position={pickupLocation} />
//                   </GoogleMap>

//                   <h3 className="font-semibold mt-4">📍 Select Drop Location</h3>
//                   <GoogleMap
//                     mapContainerStyle={mapContainerStyle}
//                     center={dropLocation}
//                     zoom={14}
//                     onClick={(e) =>
//                       setDropLocation({
//                         lat: e.latLng.lat(),
//                         lng: e.latLng.lng(),
//                       })
//                     }
//                   >
//                     <Marker position={dropLocation} />
//                   </GoogleMap>
//                 </LoadScript>
//               </div>

//               <input
//                 type="date"
//                 className="border p-2 rounded"
//                 value={rideForm.date}
//                 onChange={(e) =>
//                   setRideForm({ ...rideForm, date: e.target.value })
//                 }
//               />
//               <input
//                 type="time"
//                 className="border p-2 rounded"
//                 value={rideForm.time}
//                 onChange={(e) =>
//                   setRideForm({ ...rideForm, time: e.target.value })
//                 }
//               />
//               <input
//                 type="number"
//                 placeholder="Price per ride (₹)"
//                 className="border p-2 rounded"
//                 value={rideForm.pricePerRide}
//                 onChange={(e) =>
//                   setRideForm({ ...rideForm, pricePerRide: e.target.value })
//                 }
//               />
//               <input
//                 type="number"
//                 placeholder="Available Seats"
//                 min="1"
//                 max="6"
//                 className="border p-2 rounded"
//                 value={rideForm.availableSeats}
//                 onChange={(e) =>
//                   setRideForm({ ...rideForm, availableSeats: e.target.value })
//                 }
//               />

//               <select
//                 className="border p-2 rounded"
//                 value={rideForm.vehicleId}
//                 onChange={(e) =>
//                   setRideForm({ ...rideForm, vehicleId: e.target.value })
//                 }
//               >
//                 <option value="">Select Approved Vehicle</option>
//                 {vehicles
//                   .filter((v) => v.status === "Approved")
//                   .map((v) => (
//                     <option key={v._id} value={v._id}>
//                       {v.model} ({v.plate})
//                     </option>
//                   ))}
//               </select>

//               <Button type="submit" disabled={loading}>
//                 {loading
//                   ? "Saving…"
//                   : editRideId
//                   ? "Update Ride"
//                   : "Post Ride"}
//               </Button>
//             </form>
//           </div>

//           <div className="card p-4">
//             <h2 className="text-lg font-semibold mb-2">My Rides</h2>
//             {rides.length ? (
//               rides.map((r) => (
//                 <div
//                   key={r._id}
//                   className="border rounded p-3 flex justify-between items-center"
//                 >
//                   <div>
//                     <b>{r.startPoint}</b> → <b>{r.endPoint}</b>
//                     <div className="text-sm text-gray-500">
//                       {r.date} {r.time} • ₹{r.pricePerRide} •{" "}
//                       {r.availableSeats} seats left
//                     </div>
//                     <div className="text-xs text-gray-500">
//                       📍 Pickup: {r.pickupAddress} <br /> 📍 Drop:{" "}
//                       {r.dropAddress}
//                     </div>
//                   </div>
//                   <div className="flex gap-2">
//                     <Button
//                       onClick={() => {
//                         setRideForm(r);
//                         setEditRideId(r._id);
//                       }}
//                     >
//                       Edit
//                     </Button>
//                     <Button onClick={() => deleteRide(r._id)}>Delete</Button>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <p className="text-gray-500">No rides yet.</p>
//             )}
//           </div>
//         </div>
//       )}

//       {/* ---------------- 💰 BOOKINGS TAB ---------------- */}
//       {tab === "bookings" && (
//         <div className="card p-4">
//           <h2 className="text-lg font-semibold mb-2">
//             My Ride Bookings — Total Earnings: ₹{totalEarnings.toFixed(2)}
//           </h2>
//           {loading ? (
//             <p>Loading bookings...</p>
//           ) : bookings.length ? (
//             bookings.map((b, i) => (
//               <div
//                 key={i}
//                 className="border rounded p-3 space-y-3 bg-gray-50 mb-3 shadow-sm"
//               >
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <b>
//                       {b.ride?.startPoint} → {b.ride?.endPoint}
//                     </b>
//                     <div className="text-sm text-gray-500">
//                       {b.ride?.date} {b.ride?.time}
//                     </div>
//                     <div className="text-sm mt-1">
//                       👤 {b.user?.name} ({b.user?.email})
//                     </div>
//                     <div className="text-sm text-gray-600">
//                       Seats: {b.seatsBooked} | ₹{b.amount}
//                     </div>
//                   </div>
//                   <span
//                     className={`px-2 py-1 rounded text-sm ${
//                       b.status === "Confirmed"
//                         ? "bg-green-100 text-green-600"
//                         : "bg-gray-100 text-gray-600"
//                     }`}
//                   >
//                     {b.status}
//                   </span>
//                 </div>

//                 {/* 🗺 Map Preview with Route */}
//                 {b.ride?.pickupLocation && b.ride?.dropLocation && (
//                   <div className="h-[200px] mt-2 rounded overflow-hidden border relative">
//                     <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
//                       <DirectionsMap
//                         pickup={b.ride.pickupLocation}
//                         drop={b.ride.dropLocation}
//                       />
//                     </LoadScript>

//                     <div className="absolute bottom-2 right-2">
//                       <button
//                         className="bg-blue-600 text-white px-3 py-1 text-sm rounded shadow hover:bg-blue-700"
//                         onClick={() => {
//                           const pickup = `${b.ride.pickupLocation.lat},${b.ride.pickupLocation.lng}`;
//                           const drop = `${b.ride.dropLocation.lat},${b.ride.dropLocation.lng}`;
//                           window.open(
//                             `https://www.google.com/maps/dir/?api=1&origin=${pickup}&destination=${drop}&travelmode=driving`,
//                             "_blank"
//                           );
//                         }}
//                       >
//                         Open in Google Maps
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))
//           ) : (
//             <p className="text-gray-500">No one has booked your rides yet.</p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
import { useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { api } from "../../services/api";
import Button from "../../components/Button";

const mapContainerStyle = {
  height: "300px",
  width: "100%",
  borderRadius: "10px",
};

const hyderabadCenter = { lat: 17.385, lng: 78.4867 };

export default function OwnerDashboard({ toast }) {
  const [tab, setTab] = useState("vehicles");
  const [vehicles, setVehicles] = useState([]);
  const [rides, setRides] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [editVehicleId, setEditVehicleId] = useState(null);
  const [editRideId, setEditRideId] = useState(null);

  const [vehicleForm, setVehicleForm] = useState({
    model: "",
    plate: "",
    type: "Car",
    rcDoc: null,
    insuranceDoc: null,
  });

  const [rideForm, setRideForm] = useState({
    startPoint: "",
    endPoint: "",
    pickupAddress: "",
    dropAddress: "",
    date: "",
    time: "",
    pricePerRide: "",
    availableSeats: "",
    vehicleId: "",
  });

  const [pickupLocation, setPickupLocation] = useState(hyderabadCenter);
  const [dropLocation, setDropLocation] = useState(hyderabadCenter);

  // 🌍 Auto detect current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPickupLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => toast("Location permission denied. Using Hyderabad default.", "error"),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // 📥 Fetch vehicles & rides
  const loadData = async () => {
    try {
      const [vehiclesRes, ridesRes] = await Promise.all([
        api.get("/vehicles/my"),
        api.get("/rides/my"),
      ]);
      setVehicles(vehiclesRes.data || []);
      setRides(ridesRes.data || []);
    } catch {
      toast("Failed to load owner data", "error");
    }
  };

  // 👥 Load bookings
  const loadBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/bookings/owner");
      setBookings(data || []);
      const total = data.reduce((sum, b) => sum + (b.amount || 0), 0);
      setTotalEarnings(total);
    } catch {
      toast("Failed to load bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "bookings") loadBookings();
    else loadData();
  }, [tab]);

  // 🚗 Vehicle form submit
  const submitVehicle = async (e) => {
    e.preventDefault();
    if (!vehicleForm.model || !vehicleForm.plate)
      return toast("Fill all fields", "error");

    const formData = new FormData();
    formData.append("model", vehicleForm.model);
    formData.append("plate", vehicleForm.plate);
    formData.append("type", vehicleForm.type);
    if (vehicleForm.rcDoc) formData.append("rcDoc", vehicleForm.rcDoc);
    if (vehicleForm.insuranceDoc)
      formData.append("insuranceDoc", vehicleForm.insuranceDoc);

    setLoading(true);
    try {
      if (editVehicleId) {
        await api.put(`/vehicles/${editVehicleId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast("Vehicle updated successfully", "success");
      } else {
        await api.post("/vehicles", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast("Vehicle registered successfully", "success");
      }
      setVehicleForm({
        model: "",
        plate: "",
        type: "Car",
        rcDoc: null,
        insuranceDoc: null,
      });
      setEditVehicleId(null);
      loadData();
    } catch {
      toast("Failed to save vehicle", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🚘 Ride form submit
  const submitRide = async (e) => {
    e.preventDefault();
    if (
      !rideForm.startPoint ||
      !rideForm.endPoint ||
      !rideForm.vehicleId ||
      !rideForm.pickupAddress ||
      !rideForm.dropAddress
    ) {
      return toast("Please fill all required fields", "error");
    }

    setLoading(true);
    try {
      if (editRideId) {
        await api.put(`/rides/${editRideId}`, {
          ...rideForm,
          pickupLocation,
          dropLocation,
        });
        toast("Ride updated successfully!", "success");
      } else {
        await api.post("/rides", {
          ...rideForm,
          pickupLocation,
          dropLocation,
        });
        toast("Ride posted successfully!", "success");
      }
      setRideForm({
        startPoint: "",
        endPoint: "",
        pickupAddress: "",
        dropAddress: "",
        date: "",
        time: "",
        pricePerRide: "",
        availableSeats: "",
        vehicleId: "",
      });
      setEditRideId(null);
      loadData();
    } catch (err) {
      console.error("Failed to save ride:", err);
      toast("Failed to save ride", "error");
    } finally {
      setLoading(false);
    }
  };

  // ❌ Delete operations
  const deleteVehicle = async (id) => {
    await api.delete(`/vehicles/${id}`);
    toast("Vehicle deleted", "success");
    loadData();
  };

  const deleteRide = async (id) => {
    await api.delete(`/rides/${id}`);
    toast("Ride deleted", "success");
    loadData();
  };

  // 🧭 DirectionsMap Component
  const DirectionsMap = ({ pickup, drop }) => {
    const [directions, setDirections] = useState(null);
    return (
      <GoogleMap
        mapContainerStyle={{ height: "200px", width: "100%" }}
        center={pickup}
        zoom={12}
      >
        {!directions && (
          <DirectionsService
            options={{
              destination: drop,
              origin: pickup,
              travelMode: "DRIVING",
            }}
            callback={(response) =>
              response?.status === "OK" && setDirections(response)
            }
          />
        )}
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
        <Marker position={pickup} label="P" />
        <Marker position={drop} label="D" />
      </GoogleMap>
    );
  };

  return (
    <div className="p-4 space-y-4">
      {/* 🔘 Navigation Tabs */}
      <div className="flex gap-3 mb-4">
        <Button
          onClick={() => setTab("vehicles")}
          className={tab === "vehicles" ? "primary" : "secondary"}
        >
          My Vehicles
        </Button>
        <Button
          onClick={() => setTab("rides")}
          className={tab === "rides" ? "primary" : "secondary"}
          disabled={!vehicles.some((v) => v.status === "Approved")}
        >
          Post Rides
        </Button>
        <Button
          onClick={() => setTab("bookings")}
          className={tab === "bookings" ? "primary" : "secondary"}
        >
          My Bookings
        </Button>
      </div>

      {/* ---------------- 🚗 VEHICLES TAB ---------------- */}
      {tab === "vehicles" && (
        <div className="space-y-4">
          <div className="card p-4">
            <h2 className="text-lg font-semibold mb-2">
              {editVehicleId ? "Edit Vehicle" : "Register Vehicle"}
            </h2>
            <form onSubmit={submitVehicle} className="grid gap-3 md:grid-cols-2">
              <input
                className="border p-2 rounded"
                placeholder="Vehicle Model"
                value={vehicleForm.model}
                onChange={(e) =>
                  setVehicleForm({ ...vehicleForm, model: e.target.value })
                }
              />
              <input
                className="border p-2 rounded"
                placeholder="Plate Number"
                value={vehicleForm.plate}
                onChange={(e) =>
                  setVehicleForm({ ...vehicleForm, plate: e.target.value })
                }
              />
              <select
                className="border p-2 rounded"
                value={vehicleForm.type}
                onChange={(e) =>
                  setVehicleForm({ ...vehicleForm, type: e.target.value })
                }
              >
                <option value="Car">Car</option>
                <option value="Bike">Bike</option>
                <option value="Auto">Auto</option>
              </select>

              <input
                type="file"
                accept="image/*,.pdf"
                className="border p-2 rounded"
                onChange={(e) =>
                  setVehicleForm({ ...vehicleForm, rcDoc: e.target.files[0] })
                }
              />
              <input
                type="file"
                accept="image/*,.pdf"
                className="border p-2 rounded"
                onChange={(e) =>
                  setVehicleForm({
                    ...vehicleForm,
                    insuranceDoc: e.target.files[0],
                  })
                }
              />
              <Button type="submit" disabled={loading}>
                {loading
                  ? "Saving..."
                  : editVehicleId
                  ? "Update Vehicle"
                  : "Register Vehicle"}
              </Button>
            </form>
          </div>

          <div className="card p-4">
            <h2 className="text-lg font-semibold mb-2">My Vehicles</h2>
            {vehicles.length ? (
              vehicles.map((v) => (
                <div
                  key={v._id}
                  className="border rounded p-3 flex justify-between items-center"
                >
                  <div>
                    <b>{v.model}</b> ({v.plate}) —{" "}
                    <span
                      className={`font-semibold ${
                        v.status === "Approved"
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      {v.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setVehicleForm(v);
                        setEditVehicleId(v._id);
                      }}
                    >
                      Edit
                    </Button>
                    <Button onClick={() => deleteVehicle(v._id)}>Delete</Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No vehicles registered yet.</p>
            )}
          </div>
        </div>
      )}

      {/* ---------------- 🧭 RIDES TAB ---------------- */}
      {tab === "rides" && (
        <div className="space-y-4">
          <div className="card p-4">
            <h2 className="text-lg font-semibold mb-2">
              {editRideId ? "Edit Ride" : "Post New Ride"}
            </h2>
            <form onSubmit={submitRide} className="grid gap-3 md:grid-cols-2">
              {/* ✅ Ride Form Inputs */}
              <select
                className="border p-2 rounded"
                value={rideForm.startPoint}
                onChange={(e) =>
                  setRideForm({ ...rideForm, startPoint: e.target.value })
                }
              >
                <option value="">Select Start Point</option>
                <option value="Madhapur">Madhapur</option>
                <option value="Gachibowli">Gachibowli</option>
                <option value="Kondapur">Kondapur</option>
                <option value="Hitec City">Hitec City</option>
                <option value="Ameerpet">Ameerpet</option>
                <option value="Secunderabad">Secunderabad</option>
              </select>

              <select
                className="border p-2 rounded"
                value={rideForm.endPoint}
                onChange={(e) =>
                  setRideForm({ ...rideForm, endPoint: e.target.value })
                }
              >
                <option value="">Select Destination</option>
                <option value="Madhapur">Madhapur</option>
                <option value="Gachibowli">Gachibowli</option>
                <option value="Kondapur">Kondapur</option>
                <option value="Hitec City">Hitec City</option>
                <option value="Ameerpet">Ameerpet</option>
                <option value="Secunderabad">Secunderabad</option>
              </select>

              <textarea
                className="border p-2 rounded md:col-span-2"
                placeholder="Pickup Address"
                value={rideForm.pickupAddress}
                onChange={(e) =>
                  setRideForm({ ...rideForm, pickupAddress: e.target.value })
                }
              />
              <textarea
                className="border p-2 rounded md:col-span-2"
                placeholder="Drop Address"
                value={rideForm.dropAddress}
                onChange={(e) =>
                  setRideForm({ ...rideForm, dropAddress: e.target.value })
                }
              />

              {/* 🗺 Google Maps for pickup & drop */}
              <div className="md:col-span-2 space-y-3">
                <h3 className="font-semibold">📍 Select Pickup Location</h3>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={pickupLocation}
                  zoom={14}
                  onClick={(e) =>
                    setPickupLocation({
                      lat: e.latLng.lat(),
                      lng: e.latLng.lng(),
                    })
                  }
                >
                  <Marker position={pickupLocation} />
                </GoogleMap>

                <h3 className="font-semibold mt-4">📍 Select Drop Location</h3>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={dropLocation}
                  zoom={14}
                  onClick={(e) =>
                    setDropLocation({
                      lat: e.latLng.lat(),
                      lng: e.latLng.lng(),
                    })
                  }
                >
                  <Marker position={dropLocation} />
                </GoogleMap>
              </div>

              <input
                type="date"
                className="border p-2 rounded"
                value={rideForm.date}
                onChange={(e) =>
                  setRideForm({ ...rideForm, date: e.target.value })
                }
              />
              <input
                type="time"
                className="border p-2 rounded"
                value={rideForm.time}
                onChange={(e) =>
                  setRideForm({ ...rideForm, time: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Price per ride (₹)"
                className="border p-2 rounded"
                value={rideForm.pricePerRide}
                onChange={(e) =>
                  setRideForm({ ...rideForm, pricePerRide: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Available Seats"
                min="1"
                max="6"
                className="border p-2 rounded"
                value={rideForm.availableSeats}
                onChange={(e) =>
                  setRideForm({ ...rideForm, availableSeats: e.target.value })
                }
              />

              <select
                className="border p-2 rounded"
                value={rideForm.vehicleId}
                onChange={(e) =>
                  setRideForm({ ...rideForm, vehicleId: e.target.value })
                }
              >
                <option value="">Select Approved Vehicle</option>
                {vehicles
                  .filter((v) => v.status === "Approved")
                  .map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.model} ({v.plate})
                    </option>
                  ))}
              </select>

              <Button type="submit" disabled={loading}>
                {loading
                  ? "Saving…"
                  : editRideId
                  ? "Update Ride"
                  : "Post Ride"}
              </Button>
            </form>
          </div>

          {/* 🧾 My Rides */}
          <div className="card p-4">
            <h2 className="text-lg font-semibold mb-2">My Rides</h2>
            {rides.length ? (
              rides.map((r) => (
                <div
                  key={r._id}
                  className="border rounded p-3 flex justify-between items-center"
                >
                  <div>
                    <b>{r.startPoint}</b> → <b>{r.endPoint}</b>
                    <div className="text-sm text-gray-500">
                      {r.date} {r.time} • ₹{r.pricePerRide} •{" "}
                      {r.availableSeats} seats left
                    </div>
                    <div className="text-xs text-gray-500">
                      📍 Pickup: {r.pickupAddress} <br /> 📍 Drop: {r.dropAddress}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setRideForm(r);
                        setEditRideId(r._id);
                      }}
                    >
                      Edit
                    </Button>
                    <Button onClick={() => deleteRide(r._id)}>Delete</Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No rides yet.</p>
            )}
          </div>
        </div>
      )}

      {/* ---------------- 💰 BOOKINGS TAB ---------------- */}
      {tab === "bookings" && (
        <div className="card p-4">
          <h2 className="text-lg font-semibold mb-2">
            My Ride Bookings — Total Earnings: ₹{totalEarnings.toFixed(2)}
          </h2>
          {loading ? (
            <p>Loading bookings...</p>
          ) : bookings.length ? (
            bookings.map((b, i) => (
              <div
                key={i}
                className="border rounded p-3 space-y-3 bg-gray-50 mb-3 shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <b>
                      {b.ride?.startPoint} → {b.ride?.endPoint}
                    </b>
                    <div className="text-sm text-gray-500">
                      {b.ride?.date} {b.ride?.time}
                    </div>
                    <div className="text-sm mt-1">
                      👤 {b.user?.name} ({b.user?.email})
                    </div>
                    <div className="text-sm text-gray-600">
                      Seats: {b.seatsBooked} | ₹{b.amount}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      b.status === "Confirmed"
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                {/* 🗺 Map Preview */}
                {b.ride?.pickupLocation && b.ride?.dropLocation && (
                  <div className="h-[200px] mt-2 rounded overflow-hidden border relative">
                    <DirectionsMap
                      pickup={b.ride.pickupLocation}
                      drop={b.ride.dropLocation}
                    />
                    <div className="absolute bottom-2 right-2">
                      <button
                        className="bg-blue-600 text-white px-3 py-1 text-sm rounded shadow hover:bg-blue-700"
                        onClick={() => {
                          const pickup = `${b.ride.pickupLocation.lat},${b.ride.pickupLocation.lng}`;
                          const drop = `${b.ride.dropLocation.lat},${b.ride.dropLocation.lng}`;
                          window.open(
                            `https://www.google.com/maps/dir/?api=1&origin=${pickup}&destination=${drop}&travelmode=driving`,
                            "_blank"
                          );
                        }}
                      >
                        Open in Google Maps
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No one has booked your rides yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
