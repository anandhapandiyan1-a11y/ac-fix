import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Discover from "./pages/Discover";
import MyBookings from "./pages/MyBookings";
import MechanicDashboard from "./pages/MechanicDashboard";
import { ToastProvider } from "./context/ToastContext";
import { useAuth } from "./context/AuthContext";

function Protected({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === "mechanic" ? "/dashboard" : "/discover"} replace />;
  return children;
}

export default function App() {
  return (
    <ToastProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/discover" element={<Protected role="customer"><Discover /></Protected>} />
        <Route path="/bookings" element={<Protected role="customer"><MyBookings /></Protected>} />
        <Route path="/dashboard" element={<Protected role="mechanic"><MechanicDashboard /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}
