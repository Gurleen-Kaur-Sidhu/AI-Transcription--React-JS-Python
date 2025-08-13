import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Card,
  Modal,
  Spinner,
  Table,
} from "react-bootstrap";

const UserRole = () => {
  const [userLists, setUserLists] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [heightvalue, setHeightValue] = useState("50vh");

  useEffect(() => {
    if (userLists.length === 0) {
      fetchData();
    }
    if (userLists.length >= 5) {
      setHeightValue("100%");
    }
  }, [userLists]);

  const fetchData = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire("Error", "Authentication token is missing.", "error");
      navigate('/login')
      return;
    }

    setLoading(true);
    try {
      console.log("Sending token in headers:", `${token}`);

      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}/user-role`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "*/*",
          },
        }
      );

      if (response.status === 200) {
        setUserLists(response.data.users || []);
      } else {
        Swal.fire("Error", "Failed to fetch user list", "error");
      }
    } catch (error) {
      console.error("Error fetching data:", error);

      if (error.response && error.response.status === 401) {
        Swal.fire("Error", "Unauthorized", "error");
      } else {
        Swal.fire("Error", "Failed to fetch user list", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const submitEditForm = () => {
    console.log("Edit form submitted for user:", selectedUser);
    setShowEditModal(false);
  };

  const handleRoleChange = (event) => {
    setSelectedUser({
      ...selectedUser,
      role: event.target.value,
    });
  };

  const handleDelete = (userId) => {
    setUserLists(userLists.filter((user) => user.id !== userId));
    Swal.fire("Deleted!", "User has been deleted.", "success");
  };

  return (
    <>
      <Container fluid>
        <Card className="audiolist-card shadow-sm">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={6} className="d-flex align-items-center">
                <Card.Title className="fw-bold mb-0">User Role</Card.Title>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Edit User Modal */}
        <Modal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedUser && (
              <Form.Group>
                <Form.Label className="mt-3">Name:</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={selectedUser.name}
                  readOnly
                />

                <Form.Label className="mt-3">Email:</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={selectedUser.email}
                  readOnly
                />

                <Form.Label className="mt-3">Role:</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedUser.role}
                  onChange={handleRoleChange}
                >
                  <option>Admin</option>
                  <option>User</option>
                </Form.Control>

                <div className="d-flex align-items-center mt-3 column-gap-3">
                  <Form.Check
                    type="checkbox"
                    checked={selectedUser.status === "Active"}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        status: e.target.checked ? "Active" : "Inactive",
                      })
                    }
                  />
                  <Form.Label className="mb-0">Status</Form.Label>
                </div>
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={submitEditForm}>
              Submit
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>

      <Container fluid className="py-4">
        <Card className="shadow-sm" style={{ height: heightvalue }}>
          <Card.Header className="bg-light d-flex justify-content-between align-items-center py-4">
            <h5 className="mb-0">All Users</h5>
          </Card.Header>
          <Card.Body>
            {loading ? (
              <div className="text-center">
                <Spinner animation="border" role="status" variant="success" />
              </div>
            ) : (
              <Table responsive bordered className="mb-0">
                <thead>
                  <tr className="bg-light">
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userLists.length > 0 ? (
                    userLists.map((user, index) => (
                      <tr key={index}>
                        <td>{user.Name}</td>
                        <td>{user.Email}</td>
                        <td>{user.Role}</td>
                        <td>{user.Status}</td>
                        <td className="action-td">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            View/Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            className="ms-2"
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No users available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default UserRole;
