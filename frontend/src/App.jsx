import { LoadScriptNext } from "@react-google-maps/api";
import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// ✅ Styles
import "./styles/admin.css";
import "./styles/auth.css";
import "./styles/navbar.css";

// ✅ Components
import Navbar from "./components/Navbar";
import Toast from "./components/Toast";
import Footer from "./components/Footer";

// ✅ Auth Pages
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Forgot from "./pages/Auth/Forgot";
import Reset from "./pages/Auth/Reset";

// ✅ Dashboards
import AdminDashboard from "./pages/Dashboards/AdminDashboard";
import OwnerDashboard from "./pages/Dashboards/OwnerDashboard";
import UserDashboard from "./pages/Dashboards/UserDashboard";

// ✅ Services
import { api, setAuth } from "./services/api";
import { useAuth } from "./context/AuthContext";


// 🔒 Protected Route
function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

// 🎭 Role-based Access
function RoleRoute({ allow = [], children }) {
  const { role } = useAuth();
  if (!allow.includes(role)) {
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "owner") return <Navigate to="/owner" replace />;
    if (role === "user") return <Navigate to="/user" replace />;
    return <Navigate to="/login" replace />;
  }
  return children;
}


// 🚀 Main App Component
export default function App() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "info" });
  const location = useLocation();

  const { token, role } = useAuth();

  const showToast = (message, type = "success") =>
    setToast({ message, type });

  // 🧠 Load user info on mount
  useEffect(() => {
    const fetchUser = async () => {
      if (token) setAuth(token);
      try {
        const { data } = await api.get("/auth/me");
        setMe(data);
      } catch {
        setMe(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  // ⏳ Loading Screen
  if (loading) return <div className="loading-screen">Loading…</div>;

  // 🚫 Hide Navbar on auth routes
  const hideNavbarOn = ["/login", "/signup", "/forgot", "/reset"];
  const hideNavbar = hideNavbarOn.includes(location.pathname);

  return (
    <LoadScriptNext googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <div className="app-container">
        {/* 🧭 Navbar only when logged in */}
        {!hideNavbar && token && <Navbar />}

        {/* ⚙️ Main Content */}
        <main className="content-wrapper">
          <Routes>
            {/* Default redirect */}
            <Route
              path="/"
              element={
                role ? (
                  <Navigate to={`/${role}`} replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* 🔐 Auth routes */}
            <Route path="/login" element={<Login toast={showToast} />} />
            <Route
              path="/signup"
              element={
                <Signup
                  onSuccess={() => (window.location.href = "/login")}
                  toast={showToast}
                />
              }
            />
            <Route path="/forgot" element={<Forgot toast={showToast} />} />
            <Route path="/reset" element={<Reset toast={showToast} />} />

            {/* 🧱 Role-protected Dashboards */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <RoleRoute allow={["admin"]}>
                    <AdminDashboard toast={showToast} />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner"
              element={
                <ProtectedRoute>
                  <RoleRoute allow={["owner"]}>
                    <OwnerDashboard toast={showToast} />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/user"
              element={
                <ProtectedRoute>
                  <RoleRoute allow={["user"]}>
                    <UserDashboard toast={showToast} />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* 🚧 Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* 🔔 Toast + Footer */}
        <Toast message={toast.message} type={toast.type} />
        {!hideNavbar && <Footer />}
      </div>
    </LoadScriptNext>
  );
}
