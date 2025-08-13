import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { SidebarContext } from "./sidebarContext";
import { navigationLinks } from "../layout/data";
import "./Sidebar.css";
import axiosInstance from "../../../axiosInstance";

const Sidebar = () => {
  const [activeLinkIdx, setActiveLinkIdx] = useState(1);
  const [sidebarClass, setSidebarClass] = useState("");
  const { isSidebarOpen, setSelectedLinkTitle } = useContext(SidebarContext);
  const navigate = useNavigate();
  useEffect(() => {
    if (isSidebarOpen) {
      setSidebarClass("sidebar-change");
    } else {
      setSidebarClass("");
    }
  }, [isSidebarOpen]);

  const handleNavItemClick = () => {
    if (isSidebarOpen) {
      toggleSidebar();
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axiosInstance.post("/logout");

      if (response.status === 200) {
        localStorage.clear();
        navigate("/admin/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className={`sidebar ${sidebarClass}`} id="admin_sidebar">
      <div className="user-info">
        <Link to="/admin">
          <span className="info-name text-center text-white text-decoration-none">
            AI Transcription
          </span>
        </Link>
      </div>

      <nav className="navigation">
        <ul className="nav-list">
          {navigationLinks.map((navigationLink) => (
            <li className="nav-item" key={navigationLink.id}>
              <Link
                to={`/admin/${navigationLink.title.toLowerCase()}`}
                className={`nav-link ${
                  navigationLink.id === activeLinkIdx ? "active" : ""
                }`}
                onClick={() => {
                  setActiveLinkIdx(navigationLink.id);
                  setSelectedLinkTitle(navigationLink.title);
                  handleNavItemClick();
                }}
              >
                <div className="sidebar-icons">
                  <img
                    src={navigationLink.image}
                    className="nav-link-icon"
                    alt={navigationLink.title}
                  />
                </div>
                <span className="nav-link-text">{navigationLink.title}</span>
              </Link>
            </li>
          ))}

          <div className="admin-footer-item" onClick={handleLogout}>
            <i
              className="fas fa-sign-out-alt"
              style={{ width: "16px", height: "16px" }}
            ></i>
            <span>Logout</span>
          </div>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
