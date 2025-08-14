import "./ContentTop.css";
import { useContext, useState, useEffect } from "react";
import { SidebarContext } from "../layout/sidebarContext";
import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";

const ContentTop = () => {
  const { toggleSidebar, selectedLinkTitle } = useContext(SidebarContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);


  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSidebarToggle = () => {
    setIsMenuOpen(!isMenuOpen);
    toggleSidebar();
  };



  return (
    <div className="py-3 contenttop-section">
      <Container fluid>
        <div className="main-content-top">
          <div className="content-top-left">
            <button
              type="button"
              className="sidebar-toggler"
              onClick={handleSidebarToggle}
            >
              {screenWidth <= 768 ? (
                isMenuOpen ? (
                  <a className="close-btn-admin bg-primary text-white py-0 text-decoration-none">
                    x
                  </a>
                ) : (
                  <img src="../../../adminimages/menu.svg" alt="Menu" />
                )
              ) : (
                <img src="../../../adminimages/menu.svg" alt="Menu" />
              )}
            </button>
            <h3 className="content-top-title">{selectedLinkTitle}</h3>
          </div>
          <div className="content-top-btns">
            <button type="button" className="search-btn content-top-btn">
              <img src="../../../adminimages/search.svg" alt="Search" />
            </button>
            <button className="notification-btn content-top-btn">
              <img src="../../../adminimages/bell.svg" alt="Notifications" />
              <span className="notification-btn-dot"></span>
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ContentTop;
