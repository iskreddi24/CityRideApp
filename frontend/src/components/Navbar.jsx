import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/navbar.css";

export default function Navbar() {
  const { token, role, email, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/" className="logo-text">🚗 CityRide Connect</Link>
      </div>

      <div className="navbar-links">
        {!token ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        ) : (
          <>
            {role === "admin" && <Link to="/admin">Admin Dashboard</Link>}
            {role === "owner" && <Link to="/owner">Owner Dashboard</Link>}
            {role === "user" && <Link to="/user">User Dashboard</Link>}
            <span className="navbar-user">👤 {email}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
