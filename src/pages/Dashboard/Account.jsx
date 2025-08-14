import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Form,
  Button,
  Modal,
  Spinner,
} from "react-bootstrap";
import "./css/account.css";

const Account = () => {
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    editing: false,
    avatar: "G",
    creditsLeft: 0,
    notificationsEnabled: true,
    apiKey: "",
    slackConnected: false,
    tikTokConnected: false,
    zapierConnected: false,
  });

  const [loading, setLoading] = useState({
    general: false,
    password: false,
    edit: false,
  });

  const [error, setError] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("Name");
    const email = localStorage.getItem("Email");
    const avatar = localStorage.getItem("userAvatar") || "G";
    const role = localStorage.getItem("Role") || "User";

    if (name && email) {
      setUserInfo({
        name,
        email,
        avatar,
        role,
        editing: false,
      });
    } else {
      setError("No user information found in localStorage.");
    }
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const toggleEditMode = () => {
    setUserInfo((prevState) => ({
      ...prevState,
      editing: !prevState.editing,
    }));
  };

  const handleSaveChanges = async () => {
    setLoading({ ...loading, edit: true });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Missing token");
        return;
      }

      if (userInfo.password !== userInfo.confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const updateData = {
        Name: userInfo.name,
        Email: userInfo.email,
        Role: userInfo.role,
      };

      const response = await fetch(
        `${import.meta.env.VITE_APP_API_URL}/edit-user`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      const result = await response.json();
      console.log(result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile.");
      }

      setUserInfo((prevState) => ({
        ...prevState,
        name: userInfo.name,
        email: userInfo.email,
        editing: false,
      }));

      localStorage.setItem("Name", userInfo.name);
      localStorage.setItem("Email", userInfo.email);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading({ ...loading, edit: false });
    }
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
  };

  const handlePasswordSubmit = async () => {
    setLoading({ ...loading, password: true });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Missing token.");
        return;
      }
  
      const email = localStorage.getItem("Email");
      if (!email) {
        setError("No email found in localStorage.");
        return;
      }
  
      if (userInfo.password !== userInfo.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
  
   
      const data = {
        Email: email, 
        NewPassword: userInfo.password, 
        ConfirmPassword: userInfo.confirmPassword, 
      };
  
      console.log("Sending request with data:", data);
  
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/account/change/password`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
  
      const result = await response.json();
      console.log("Backend response:", result);  
  
      if (response.ok) {
        alert(result.message);  
        setUserInfo({ ...userInfo, password: "", confirmPassword: "" });
        setShowPasswordModal(false);
      } else {
        console.error("Error:", result);
        setError(result.error || "Failed to change password.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading({ ...loading, password: false });
    }
  };
  

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleDeleteAccount = async () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDeleteAccount = async () => {
    setLoading({ ...loading, general: true });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Missing token");
        return;
      }

      const email = localStorage.getItem("Email");
      if (!email) {
        console.error("No email found in localStorage.");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_APP_API_URL}/delete-user`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert(result.message);

        localStorage.removeItem("Name");
        localStorage.removeItem("Email");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        throw new Error(result.error || "Failed to delete account.");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading({ ...loading, general: false });
      setShowDeleteModal(false);
    }
  };

  return (
    <Container fluid className="h-100 account-section">
      <Row className="col-lg-12 d-flex flex-column justify-content-center">
        <Col md={12} className="mx-auto">
          <Card className="shadow-sm form-card">
            <Card.Body className="d-flex justify-content-between align-items-center py-4">
              <h5 className="mb-2">{userInfo.name || "John Hambrew"}</h5>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="col-lg-12 mt-4 d-flex flex-column justify-content-center">
        <Col md={6} className="">
          <Card className="shadow-sm form-card">
            <Card.Header className="d-flex justify-content-between align-items-center py-4">
              <h5 className="mb-0">Personal Information</h5>
              <Button
                variant="primary"
                className="edit-accountinfo"
                onClick={userInfo.editing ? handleSaveChanges : toggleEditMode}
                disabled={loading.edit}
              >
                {loading.edit ? (
                  <Spinner animation="border" size="sm" />
                ) : userInfo.editing ? (
                  "Save Changes"
                ) : (
                  "Edit"
                )}
              </Button>
            </Card.Header>

            <Card.Body>
              <Form>
                <Row className="mb-3">
                  <Col
                    md={12}
                    className="d-flex align-items-center gap-2 info-column"
                  >
                    <Form.Label className="w-25">Name :</Form.Label>
                    <Form.Control
                      className="w-75"
                      type="text"
                      name="name"
                      value={userInfo.name}
                      onChange={handleInputChange}
                      disabled={!userInfo.editing}
                    />
                  </Col>
                  <Col
                    md={12}
                    className="d-flex align-items-center gap-2 info-column"
                  >
                    <Form.Label className="w-25">Email :</Form.Label>
                    <Form.Control
                      className="w-75"
                      type="email"
                      name="email"
                      value={userInfo.email}
                      onChange={handleInputChange}
                      disabled={!userInfo.editing}
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col
                    md={12}
                    className="d-flex align-items-center gap-2 info-column"
                  >
                    <Form.Label className="w-25">User Role :</Form.Label>
                    <Form.Control
                      className="w-75"
                      type="text"
                      name="userrole"
                      value={userInfo.role || "Admin"}
                      disabled
                    />
                  </Col>

                  <Button
                    variant="primary"
                    className="ms-2 mt-2 change-password-btn"
                    onClick={handleChangePassword}
                    disabled={!userInfo.editing}
                  >
                    Change Password
                  </Button>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Button
        variant="danger"
        className="mt-4 delete-account"
        onClick={handleDeleteAccount}
      >
        Delete Account
      </Button>

      <Modal
        show={showPasswordModal}
        onHide={handleClosePasswordModal}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Label>New Password:</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter new password"
                  name="password"
                  value={userInfo.password}
                  onChange={handleInputChange}
                />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Label>Confirm Password:</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Confirm new password"
                  name="confirmPassword"
                  value={userInfo.confirmPassword}
                  onChange={handleInputChange}
                />
              </Col>
            </Row>
            {error && <div className="text-danger">{error}</div>}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePasswordModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handlePasswordSubmit}
            disabled={loading.password}
          >
            {loading.password ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Change Password"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Account Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6>
            Are you sure you want to delete your account permanently? This
            action cannot be undone.
          </h6>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDeleteAccount}
            disabled={loading.general}
          >
            {loading.general ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Delete Account"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Account;
