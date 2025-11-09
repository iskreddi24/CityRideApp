import { useEffect, useState } from "react";
import { api } from "../../services/api";
import Button from "../../components/Button";
import ComplaintsPanel from "../Admin/ComplaintsPanel";
import "../../styles/admin.css"; // ✅ Import your admin styles

export default function AdminDashboard({ toast }) {
  const [tab, setTab] = useState("vehicles");
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [commission, setCommission] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🚗 Fetch pending vehicles
  const loadVehicles = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/vehicles/pending");
      setVehicles(data || []);
    } catch {
      toast("Failed to load vehicles", "error");
    } finally {
      setLoading(false);
    }
  };

  // 📘 Fetch all bookings
  const loadBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/bookings");
      setBookings(data || []);
      const total = data.reduce((sum, b) => sum + (b.adminCommission || 0), 0);
      setCommission(total / 100);
    } catch {
      toast("Failed to load bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Load relevant data when tab changes
  useEffect(() => {
    if (tab === "vehicles") loadVehicles();
    if (tab === "bookings") loadBookings();
  }, [tab]);

  // ✅ Approve or reject a vehicle
  const approveVehicle = async (id, status) => {
    try {
      await api.post(`/admin/vehicles/review`, { vehicleId: id, status });
      toast(`Vehicle ${status}`, "success");
      loadVehicles();
    } catch {
      toast("Failed to update vehicle", "error");
    }
  };

  // 🧩 Content renderer
  const renderContent = () => {
    if (tab === "vehicles")
      return (
        <div className="card p-4">
          <h2 className="text-lg font-semibold mb-3">
            Pending Vehicle Approvals
          </h2>
          {loading ? (
            <p className="loading">Loading vehicles...</p>
          ) : vehicles.length ? (
            vehicles.map((v) => (
              <div
                key={v._id}
                className="vehicle-card flex justify-between items-center"
              >
                <div>
                  <b>{v.model}</b> ({v.plate}) —{" "}
                  <span className="text-sm text-gray-600">
                    {v.ownerId?.email}
                  </span>
                  <div className="text-sm mt-1">
                    {v.rcDocUrl && (
                      <a
                        href={v.rcDocUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline mr-2"
                      >
                        RC
                      </a>
                    )}
                    {v.insuranceDocUrl && (
                      <a
                        href={v.insuranceDocUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        Insurance
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => approveVehicle(v._id, "Approved")}>
                    Approve
                  </Button>
                  <Button
                    className="secondary"
                    onClick={() => approveVehicle(v._id, "Rejected")}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="empty-state">No pending vehicles</p>
          )}
        </div>
      );

    if (tab === "bookings")
      return (
        <div className="card p-4">
          <h2 className="text-lg font-semibold mb-3">
            All Bookings (Commission ₹{commission.toFixed(2)})
          </h2>
          {loading ? (
            <p className="loading">Loading bookings...</p>
          ) : bookings.length ? (
            bookings.map((b) => (
              <div key={b._id} className="border rounded p-3 mb-2">
                <div>
                  <b>{b.ride?.startPoint}</b> → <b>{b.ride?.endPoint}</b>
                </div>
                <div className="text-sm">
                  User: {b.user?.email} | Owner: {b.owner?.email}
                </div>
                <div className="text-sm">
                  Paid ₹{b.paymentAmount / 100} | Admin Commission ₹
                  {b.adminCommission / 100}
                </div>
              </div>
            ))
          ) : (
            <p className="empty-state">No bookings available</p>
          )}
        </div>
      );

    if (tab === "complaints") return <ComplaintsPanel toast={toast} />;

    return <p>Select a section from sidebar.</p>;
  };

  // 🧱 Layout
  return (
    <div className="admin-layout">
      {/* ===== Sidebar ===== */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div>
          <h2>Admin Panel</h2>
          <nav className="admin-nav">
            <button
              onClick={() => setTab("vehicles")}
              className={tab === "vehicles" ? "active" : ""}
            >
              🚗 Vehicle Approvals
            </button>
            <button
              onClick={() => setTab("bookings")}
              className={tab === "bookings" ? "active" : ""}
            >
              📘 Bookings
            </button>
            <button
              onClick={() => setTab("complaints")}
              className={tab === "complaints" ? "active" : ""}
            >
              ⚠️ Complaints
            </button>
          </nav>
        </div>

        <div style={{ textAlign: "center", padding: "1rem", fontSize: "0.9rem" }}>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            style={{
              background: "#ef4444",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              padding: "8px 12px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ===== Main Section ===== */}
      <main className="admin-content">
        {/* Topbar */}
        <div className="admin-topbar">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h1>
            {tab === "vehicles"
              ? "Pending Vehicle Approvals"
              : tab === "bookings"
              ? "All Bookings"
              : tab === "complaints"
              ? "Complaints Management"
              : "Dashboard"}
          </h1>
        </div>

        {renderContent()}
      </main>
    </div>
  );
}
