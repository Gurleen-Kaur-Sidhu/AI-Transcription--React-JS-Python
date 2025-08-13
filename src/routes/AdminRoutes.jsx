import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { SidebarProvider } from "../pages/Admin/layout/sidebarContext";
import AdminLayout from "../layouts/AdminLayout";
import Payment from "../pages/Admin/Payment";
import MonthlyReport from "../pages/Admin/MonthlyReport";
import ManageUser from "../pages/Admin/ManageUser";
import AccountPage from "../pages/Admin/AccountPage";
import ManageRole from "../pages/Admin/ManageRole";
import AudioFiles from "../pages/Admin/AudioFiles";
import Permission from "../pages/Admin/Permission";
import Dashboard from "../pages/Admin/Dashboard";
import Membership from "../pages/Admin/Membership";

const AdminRoutes = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check for the token in localStorage
    const token = localStorage.getItem("token");
    
    // If there is no token, redirect to the login page
    if (!token) {
      navigate("/admin/login"); // Redirect to login if no token is found
    }
  }, [navigate]);

  return (
    <SidebarProvider>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/payments" element={<Payment />} />
          <Route path="/plans" element={<Membership />} />
          <Route path="/reports" element={<MonthlyReport />} />
          <Route path="/users" element={<ManageUser />} />
          <Route path="/profile" element={<AccountPage />} />
          <Route path="/roles" element={<ManageRole />} />
          <Route path="/audio" element={<AudioFiles />} />
          <Route path="/permission" element={<Permission />} />
        </Route>
      </Routes>
    </SidebarProvider>
  );
};

export default AdminRoutes;
