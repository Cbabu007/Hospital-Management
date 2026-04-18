import React, { useContext } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./Component/login/Login";
import Home from "./Component/Home/Home";
import User from "./Component/User/User";
import HumanResources from "./Component/Admin/Human Resources/Human Resources";
import LoginManagement from "./Component/Admin/LoginManagement/LoginManagement";
import InpatientBedManagement from "./Component/Admin/Inpatient Bed Management/Inpatient Bed Management";
import PatientFeedback from "./Component/Admin/Patient Feedback/Patient Feedback";
import Appointment from "./Component/Admin/Appointment/Appointment";

function AdminLanding() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.homePath || "/"} replace />;
}

export default function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLanding />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/human-resources"
            element={
              <ProtectedRoute permission="human-resources">
                <HumanResources />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/login-management"
            element={
              <ProtectedRoute permission="login-management">
                <LoginManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/inpatient-bed-management"
            element={
              <ProtectedRoute permission="inpatient-bed-management">
                <InpatientBedManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/patient-feedback"
            element={
              <ProtectedRoute permission="patient-feedback">
                <PatientFeedback />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/appointment"
            element={
              <ProtectedRoute permission="appointment">
                <Appointment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user"
            element={
              <ProtectedRoute role="user">
                <User />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}