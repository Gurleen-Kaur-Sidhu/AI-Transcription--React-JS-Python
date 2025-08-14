import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import "./dashboardlayout.css";
import { Card, Container, Row, Col } from "react-bootstrap";

const DashboardLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Sidebar toggle function
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="dashboard-container">
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* <button className="sidebar-toggle close" onClick={toggleSidebar}>
        x
        </button> */}
        {/* <Sidebar /> */}
        <Sidebar toggleSidebar={toggleSidebar} isOpen={isOpen} />
      </div>

      <div className="dashboard-content">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
