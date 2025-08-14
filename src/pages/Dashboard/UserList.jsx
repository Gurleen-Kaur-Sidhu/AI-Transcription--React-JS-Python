import React, { useState, useEffect } from "react";
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
import { useNavigate } from "react-router-dom";
import axiosInstance from "./../../../src/axiosInstance";

const UserList = () => {
  const [userLists, setUserLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalUsers, setTotalUsers] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire("Error", "Authentication token is missing.", "error");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get("user-list");

      if (response.status === 200) {
        setUserLists(response.data.users || []);
        setTotalUsers(response.data.users.length);
      } else {
        Swal.fire("Error", "Failed to fetch user list", "error");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        Swal.fire("Error", "Unauthorized", "error");
      } else {
        Swal.fire("Error", "Failed to fetch user list", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = () => {
    setShowInviteModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const submitInviteForm = () => {
    setShowInviteModal(false);
  };

  const submitEditForm = async () => {
    if (!selectedUser) return;

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Error", "Authentication token is missing.", "error");
      navigate("/login");
      return;
    }

    const userData = {
      Email: selectedUser.Email,
      Name: selectedUser.Name,
      Role: selectedUser.Role,
      Status: selectedUser.Status,
    };

    try {
      const response = await axiosInstance.put("edit-user", userData);

      if (response.status === 200) {
        Swal.fire("Success", "User updated successfully!", "success");
        setShowEditModal(false);
        fetchData();
      } else {
        Swal.fire("Error", "Failed to update user.", "error");
      }
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.error || "Something went wrong",
        "error"
      );
    }
  };

  const handleStatusChange = (e) => {
    setSelectedUser({
      ...selectedUser,
      Status: e.target.value,
    });
  };

  const handleRoleChange = (event) => {
    setSelectedUser({
      ...selectedUser,
      Role: event.target.value,
    });
  };

  const handleDeleteUser = async (email) => {
    const token = localStorage.getItem("token");
    const loggedInEmail = localStorage.getItem("Email");

    if (!token) {
      Swal.fire("Error", "Authentication token is missing.", "error");
      navigate("/login");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this user? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosInstance.delete("/delete-user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: { email },
        });

        if (response.status === 200) {
          Swal.fire(
            "Success",
            `User with email ${email} deleted successfully!`,
            "success"
          );
          if (email === loggedInEmail) {
            localStorage.removeItem("Name");
            localStorage.removeItem("Email");
            localStorage.removeItem("token");

            navigate("/login");
          } else {
            fetchData();
          }
        } else {
          Swal.fire(
            "Error",
            `Failed to delete user with email ${email}.`,
            "error"
          );
        }
      } catch (error) {
        Swal.fire("Error", "Failed to delete user", "error");
      }
    } else {
      console.log("User cancelled the deletion.");
    }
  };

  const totalPages = Math.ceil(totalUsers / rowsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const currentUsers = userLists.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <>
      <Container fluid>
        <Card className="audiolist-card shadow-sm">
          <Card.Body>
            <Row className="d-flex justify-content-between align-items-center">
              <Col className="d-flex align-items-center">
                <Card.Title className="fw-bold mb-0">Add User</Card.Title>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Modal
          show={showInviteModal}
          onHide={() => setShowInviteModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Invite People</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label className="mt-3">Name:</Form.Label>
              <Form.Control type="text" name="Name" />

              <Form.Label className="mt-3">Email:</Form.Label>
              <Form.Control type="email" name="Email" />

              <Form.Label className="mt-3">Role:</Form.Label>
              <Form.Control type="text" name="Role" />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={submitInviteForm}>
              Submit
            </Button>
          </Modal.Footer>
        </Modal>

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
                  name="Name"
                  value={selectedUser.Name}
                  readOnly
                />

                <Form.Label className="mt-3">Email:</Form.Label>
                <Form.Control
                  type="email"
                  name="Email"
                  value={selectedUser.Email}
                  readOnly
                />

                <Form.Label className="mt-3">Role:</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedUser.Role}
                  onChange={handleRoleChange}
                >
                  <option>Admin</option>
                  <option>User</option>
                </Form.Control>

                <Form.Label className="mt-3">Status:</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedUser.Status}
                  onChange={handleStatusChange}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </Form.Control>
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
        <Card className="shadow-sm">
          <Card.Header className="bg-light d-flex justify-content-between align-items-center py-4">
            <h5 className="mb-0 ps-3">All Users</h5>
          </Card.Header>
          <Card.Body>
            {loading ? (
              <div className="text-center">
                <Spinner animation="border" role="status" variant="success" />
              </div>
            ) : (
              <>
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
                    {currentUsers.length > 0 ? (
                      currentUsers.map((user, index) => (
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
                              onClick={() => handleDeleteUser(user.Email)}
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
              </>
            )}
          </Card.Body>
          <div className="d-flex justify-content-center column-gap-4 align-items-center pagination-block">
            <div className="d-flex align-items-center">
              <label htmlFor="rowsPerPage" className="me-2 text-light">
                Rows:
              </label>
              <Form.Control
                as="select"
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                style={{ width: "auto" }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </Form.Control>
            </div>
            <div className="pagination-buttons">
              <Button
                variant=""
                className="text-light page-button1"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                Prev
              </Button>
              <Button className="text-light page-button rounded-0">
                {currentPage}
              </Button>
              <Button
                variant=""
                className="text-light page-button2 rounded-left"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </Container>
    </>
  );
};

export default UserList;
