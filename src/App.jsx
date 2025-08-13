import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingRoutes from "./routes/LandingRoutes";
import DashboardRoutes from "./routes/DashboardRoutes";
import ProtectedRoute from "./components/context/ProtectedRoute";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import AdminRoutes from "./routes/AdminRoutes";
import LoginForm from "./pages/Admin/LoginForm";
import ForgetPassword from "./pages/Admin/ForgetPassword";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/*" element={<LandingRoutes />} />
        <Route path="/admin/login" element={<LoginForm />}></Route>
        <Route path="/admin/forget" element={<ForgetPassword />}></Route>

        {/* Protected Route */}
        <Route
          path="/dashboard/*" // Match all nested routes under /admin
          element={
            <ProtectedRoute>
              <DashboardRoutes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/*" // Match all nested routes under /admin
          element={
            <ProtectedRoute>
              <AdminRoutes />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
