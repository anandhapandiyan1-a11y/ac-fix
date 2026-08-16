import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./ui";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-logo">❄</span>
          <span>
            AC-Fix
            <small>LOCAL SERVICE FINDER</small>
          </span>
        </Link>

        <div className="nav-links">
          {user ? (
            <>
              {user.role === "customer" ? (
                <>
                  <NavLink to="/discover" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Find Mechanic</NavLink>
                  <NavLink to="/bookings" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>My Bookings</NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Job Dashboard</NavLink>
                </>
              )}
              <div className="nav-user">
                <Avatar name={user.name} />
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.2 }}>{user.name}</div>
                  <span className={`role-pill ${user.role}`}>{user.role}</span>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => { logout(); navigate("/"); }}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
