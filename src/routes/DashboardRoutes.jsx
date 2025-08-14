import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Home from "../pages/Dashboard/Home";
import About from "../pages/Dashboard/About";
import Contact from "../pages/Dashboard/Contact";
import Account from "../pages/Dashboard/Account";
import Audiolsit from "../pages/Dashboard/Audiolist";
import UserList from "../pages/Dashboard/UserList";
import UserRole from "../pages/Dashboard/UserRole";

const DashboardRoutes = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check for the token in localStorage
    const token = localStorage.getItem("token");
    
    // If there is no token, redirect to the login page
    if (!token) {
      navigate("/login"); // Redirect to login if no token is found
    }
  }, [navigate]);
  

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/account" element={<Account />} />
        <Route path="/audio" element={<Audiolsit />} />
        <Route path="/user" element={<UserList />} />
        <Route path="/role" element={<UserRole />} />
      </Routes>
    </DashboardLayout>
  );
};

export default DashboardRoutes;







