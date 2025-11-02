import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../App.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // Highlight active route (adds class "active" in CSS)
  const isActive = (path) => location.pathname === path ? "active-link" : "";

  return (
    <nav className="navbar">
      <div className="nav-left" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <h1>🍬 Sweet Shop Management</h1>
      </div>

      <div className="nav-right">
        {token ? (
          <>
            <Link className={isActive("/")} to="/">Dashboard</Link>

            {role === "admin" && (
              <Link className={isActive("/admin")} to="/admin">
                🛠️ Admin Panel
              </Link>
            )}

            {role === "billing" && (
              <Link className={isActive("/billing")} to="/billing">
                💵 Billing Panel
              </Link>
            )}

            <button onClick={handleLogout} className="logout-btn">
              🔒 Logout
            </button>
          </>
        ) : (
          <Link className={isActive("/login")} to="/login">
            🔑 Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
