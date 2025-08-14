import React from "react";
import { Navbar, Nav, Container, Button, NavDropdown } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "./styles/header.css";

function Header() {
  return (
    <Navbar expand="lg" className="custom-navbar py-4">
      <Container>
        <div className="logo">
          <Navbar.Brand as={NavLink} to="/">
            AI Transcription
          </Navbar.Brand>
        </div>

        <Navbar.Toggle aria-controls="navbarNav" />

        <Navbar.Collapse id="navbarNav" className="justify-content-enter">
          <Nav className="justify-content-between">
            <Nav.Link as={NavLink} to="/">
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/pricing">
              Pricing
            </Nav.Link>

            <div className="d-flex align-items-center mt-3 action-btn-mobile">
              <Button as={NavLink} to="/login" variant="dark" className="me-2">
                Login
              </Button>
              <Button as={NavLink} to="/pricing" variant="outline-light">
                Pricing
              </Button>
            </div>
          </Nav>
        </Navbar.Collapse>
        <div className="d-flex  ms-auto  align-items-center ms-3 action-button">
          <Button as={NavLink} to="/login" variant="dark" className="me-2">
            Login
          </Button>
          <Button as={NavLink} to="/pricing" variant="outline-light">
            Pricing
          </Button>
        </div>
      </Container>
    </Navbar>
  );
}

export default Header;
