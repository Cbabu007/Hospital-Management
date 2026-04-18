import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children, role, permission }) {
  const { user, authChecked } = useContext(AuthContext);

  if (!authChecked) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.homePath || "/"} replace />;
  }

  const permissions = Array.isArray(user.permissions) ? user.permissions : [];
  if (permission && !permissions.includes(permission)) {
    return <Navigate to={user.homePath || "/"} replace />;
  }

  return children;
}