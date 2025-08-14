import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Spinner,
  ListGroup,
} from "react-bootstrap";
import "./style/Account.css";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance";

const AccountPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState({
    Name: "",
    Email: "",
  });

  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const storedName = localStorage.getItem("Name");
    const storedEmail = localStorage.getItem("Email");

    if (storedName && storedEmail) {
      setBio({
        Name: storedName,
        Email: storedEmail,
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBio((prevBio) => ({
      ...prevBio,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prevPasswords) => ({
      ...prevPasswords,
      [name]: value,
    }));
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not logged in!");
        return;
      }

      const updateData = {
        Name: bio.Name,
        Email: bio.Email,
      };

      const response = await axiosInstance.put("edit-user", updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        alert("User updated successfully!");
        setIsEditing(false);
        localStorage.setItem("Name", bio.Name);
        localStorage.setItem("Email", bio.Email);
      } else {
        alert("Failed to update user");
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      setError(error.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordEditClick = () => {
    setIsPasswordEditing(true);
  };

  const handleSavePasswordChanges = async () => {
    setLoading(true);
    setError(null); 

    try {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("Email");

      if (!token || !email) {
        alert("You are not logged in or missing email!");
        return;
      }

      if (passwords.newPassword !== passwords.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      const data = {
        Email: email,
        NewPassword: passwords.newPassword,
        ConfirmPassword: passwords.confirmPassword,
      };

      const response = await axiosInstance.post(
        "/account/change/password",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        alert("Password changed successfully!");
        setIsPasswordEditing(false);
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        alert("Failed to change password.");
      }
    } catch (error) {
      console.error("Error saving password changes:", error);
      setError(error.response?.data?.error || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (confirmation) {
      setLoading(true);

      try {
        const token = localStorage.getItem("token");
        const email = localStorage.getItem("Email");

        if (!token || !email) {
          alert("You are not logged in or missing email!");
          return;
        }

        const response = await axiosInstance.delete("delete-user", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: { email },
        });

        if (response.status === 200) {
          alert("Account deleted successfully!");
          localStorage.clear();
          window.location.href = "/login";
        } else {
          alert("Failed to delete account.");
        }
      } catch (error) {
        console.error("Error deleting account:", error);
        setError(error.response?.data?.error || "Failed to delete account.");
      } finally {
        setLoading(false);
      }
    }
  };



  return (
    <Container fluid className="account-section mt-3">
      <Row className="row-gap-3">
        {/* Profile and Settings */}
        <Col xs={12} sm={12} md={12} lg={3} className="px-1">
          <Card className="rounded-0 h-100 p-2">
            <Card.Body>
              <div className="user-heading text-center">
                <img
                  src="/src/assets/profile1.png"
                  alt="avatar"
                  className="rounded-circle account-image"
                />
                <h4 className="mt-4">{bio.Name}</h4>
                <p>{bio.Email}</p>
              </div>

              
            </Card.Body>
          </Card>
        </Col>

        {/* Profile Edit */}
        <Col xs={12} sm={12} md={12} lg={5} className="px-1">
          <Card className="p-2 rounded-0 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>Account</h4>
                  <p>Update your Profile</p>
                </div>
                <div>
                  {isEditing ? (
                    <div className="text-end">
                      <Button
                        variant="primary"
                        className="btn btn-sm btn-primary mt-3 text-white"
                        onClick={handleSaveChanges}
                      >
                        {loading ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-end">
                      <Button
                        variant="primary"
                        className="btn btn-sm btn-primary mt-3 text-white"
                        onClick={handleEditClick}
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <Form>
                <Row className="my-3">
                  <Col xs={12} sm={12} md={12}>
                    <Form.Group controlId="name">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="Name"
                        value={bio.Name}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="my-3">
                  <Col xs={12} sm={12} md={12}>
                    <Form.Group controlId="email">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="Email"
                        value={bio.Email}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Password Edit */}
        <Col xs={12} sm={12} md={12} lg={4} className="px-1">
          <Card className="p-1 rounded-0 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">Password</h4>
                
                <div>
                  {isPasswordEditing ? (
                    <div className="text-end">
                      <Button
                        variant="primary"
                        className="btn btn-sm mt-3 btn-primary text-light"
                        onClick={handleSavePasswordChanges}
                      >
                        {loading ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-end">
                      <Button
                        variant="primary"
                        className="btn btn-sm btn btn-primary mt-3 text-light"
                        onClick={handlePasswordEditClick}
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <Form>
                <Row className="my-2">
                  <Col xs={12} sm={12} md={12} className="my-3">
                    <Form.Group>
                      <Form.Control
                        type="password"
                        name="newPassword"
                        placeholder="New password"
                        value={passwords.newPassword}
                        onChange={handlePasswordChange}
                        disabled={!isPasswordEditing}
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12} sm={12} md={12} className="my-2">
                    <Form.Group>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm password"
                        value={passwords.confirmPassword}
                        onChange={handlePasswordChange}
                        disabled={!isPasswordEditing}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
              {error && <div className="text-danger mt-2">{error}</div>}
            </Card.Body>
          </Card>
        </Col>

        {/* Delete Account */}
        <Col xs={12} sm={12} md={12} className="px-1">
          <Card className="transactions-card rounded-0">
            <Card.Body>
              <div>
                <h4 className="mb-1">Delete Account</h4>
                <h6 className="my-2">
                  Once you delete your account, there is no going back. Please
                  be certain.
                </h6>
              </div>
              <Button
                variant="danger"
                className="mt-2 action-btn"
                onClick={handleDeleteAccount} // Attach delete handler
              >
                Delete
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AccountPage;
