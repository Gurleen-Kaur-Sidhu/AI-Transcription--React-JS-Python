import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import sidebarData from "./sidebarData";
import "./styles/sidebar.css";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../axiosInstance";

function Sidebar({ toggleSidebar, isOpen }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    console.log("Logging out...");

    try {
      const response = await axiosInstance.post("/logout");

      if (response.status === 200) {
        localStorage.clear();
        navigate("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleNavItemClick = () => {
    if (isOpen) {
      toggleSidebar();
    }
  };

  return (
    <>
      <div className={`sidebarr ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <NavLink to="/dashboard" style={{ display: "flex" }}>
            <img
              src="public/vite.svg"
              className="mx-2"
              style={{ width: "40px" }}
            ></img>
            <h3>Maestra</h3>
          </NavLink>

          {isOpen && (
            <button className="sidebar-close" onClick={toggleSidebar}>
              x
            </button>
          )}
        </div>

        {sidebarData.map((section, sectionIndex) => (
          <div key={sectionIndex} className="sidebar-section">
            {section.section !== "Footer" && (
              <ul className="nav flex-column">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="nav-item">
                    <NavLink
                      to={item.path}
                      className="nav-link"
                      onClick={handleNavItemClick}
                    >
                      <i className={item.icon}></i>
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}

            {section.section === "Footer" && (
              <div className="footer-content">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="footer-item">
                    {item.label === "Logout" ? (
                      <div
                        className="nav-link"
                        onClick={handleLogout}
                        style={{ cursor: "pointer" }}
                      >
                        <i className={item.icon}></i>
                        {item.label}
                      </div>
                    ) : (
                      <NavLink to={item.path} className="nav-link">
                        <i className={item.icon}></i>
                        {item.label}
                      </NavLink>
                    )}
                  </div>
                ))}

                <div className="footer-item">
                  <div
                    className="nav-link logout"
                    onClick={handleLogout}
                    style={{ cursor: "pointer" }}
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default Sidebar;
