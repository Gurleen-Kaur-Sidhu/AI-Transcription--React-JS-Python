import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Modal, Button, Form, Alert } from "react-bootstrap";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
const ManageRole = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // const [roleData, setRoleData] = useState({});

  const [roleData, setRoleData] = useState({
    selectedRole: "",
    selectedPermissions: [],
  });

  const rolePermissions = {
    Admin: ["View", "Edit", "Delete"],
    User: ["View"],
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("user-role", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
          "Content-Type": "*/*",
        },
      });

      console.log(response.data);
      if (response.status === 200) {
        setUsers(response.data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowViewModal = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleShowUpdateModal = (user) => {
    setSelectedUser(user);
    setShowUpdateModal(true);
  };

  const handleShowDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleShowAddRoleModal = () => {
    setShowAddRoleModal(true);
  };

  const handleCloseViewModal = () => setShowViewModal(false);
  const handleCloseUpdateModal = () => setShowUpdateModal(false);
  const handleCloseDeleteModal = () => setShowDeleteModal(false);
  const handleCloseAddRoleModal = () => setShowAddRoleModal(false);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const filteredUsers = users.filter((user) =>
    user.Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPageUsers = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePaginationClick = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const paginationRange = () => {
    const visiblePages = 3;
    let start = Math.max(currentPage - Math.floor(visiblePages / 2), 1);
    let end = Math.min(start + visiblePages - 1, totalPages);
    if (end - start + 1 < visiblePages) {
      start = Math.max(end - visiblePages + 1, 1);
    }
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const headerColumns = [
    { name: "Name", field: "Name", info: "Full name of the user" },
    { name: "Email", field: "Email", info: "Email of the user" },
    { name: "Role", field: "Role", info: "Current role of the user" },
    { name: "Status", field: "Status", info: "Current role of the user" },
  ];

  const dataRows = currentPageUsers.map((user) => (
    <tr className="candidates-list" key={`${user.Name}-${user.Email}`}>
      {headerColumns.map((column) => (
        <td key={column.field}>{user[column.field]}</td>
      ))}
      <td className="text-right">
        <div className="action-td">
          <button
            className="btn btn-sm btn-success mx-1"
            onClick={() => handleShowViewModal(user)}
          >
            View
          </button>
          <button
            className="btn btn-sm btn-primary mx-1"
            onClick={() => handleShowUpdateModal(user)}
          >
            Update
          </button>
          <button
            className="btn btn-sm btn-danger mx-1"
            onClick={() => handleDeleteUser(user.Email)}
            // disabled={user.Role === "User"}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  ));

  // const handleUpdate = async () => {
  //   if (!selectedUser) return;

  //   try {
  //     const response = await axiosInstance.put(
  //       "edit-user",
  //       {
  //         Email: selectedUser.Email,
  //         Name: selectedUser.Name,
  //         Role: selectedUser.Role,
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("token")}`,
  //           Accept: "application/json",
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     if (response.status === 200) {
  //       alert(response.data.message);

  //       if (selectedUser.Email === localStorage.getItem("Email")) {
  //         localStorage.setItem("Name", selectedUser.Name);
  //         localStorage.setItem("Email", selectedUser.Email);
  //         localStorage.setItem("Role", selectedUser.Role);
  //       }

  //       fetchUsers();
  //       handleCloseUpdateModal();
  //     } else {
  //       alert(response.data.error || "Failed to update user.");
  //     }
  //   } catch (error) {
  //     console.error("Error updating user:", error);
  //     alert("An error occurred while updating the user.");
  //   }
  // };


  const handleUpdate = async () => {
    if (!selectedUser) return;
  
    if (selectedUser.Role === "User") {
      Swal.fire({
        title: "Error",
        text: "You cannot change details for users with the 'User' role.",
        icon: "error",
        confirmButtonText: "OK"
      });
      return;
    }
  
    try {
      const response = await axiosInstance.put(
        "edit-user",
        {
          Email: selectedUser.Email,
          Name: selectedUser.Name,
          Role: selectedUser.Role,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.status === 200) {
        alert(response.data.message);
  
        if (selectedUser.Email === localStorage.getItem("Email")) {
          localStorage.setItem("Name", selectedUser.Name);
          localStorage.setItem("Email", selectedUser.Email);
          localStorage.setItem("Role", selectedUser.Role);
        }
  
        fetchUsers();
        handleCloseUpdateModal();
      } else {
        alert(response.data.error || "Failed to update user.");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("An error occurred while updating the user.");
    }
  };
  


  const handleDeleteUser = async (email) => {
    const token = localStorage.getItem("token");
    const loggedInEmail = localStorage.getItem("Email");

    if (!token) {
      Swal.fire("Error", "Authentication token is missing.", "error");
      navigate("/login");
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete the user with email: ${email}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axiosInstance.delete("delete-user", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            data: { email },
          });

          if (response.status === 200) {
            Swal.fire(
              "Deleted!",
              `User with email ${email} has been deleted.`,
              "success"
            );
            if (email === loggedInEmail) {
              localStorage.removeItem("Name");
              localStorage.removeItem("Email");
              localStorage.removeItem("Role");
              localStorage.removeItem("token");
              navigate("/admin/login");
            } else {
              fetchUsers();
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
      }
    });
  };

  const handleRoleChange = (event) => {
    setSelectedUser({
      ...selectedUser,
      Role: event.target.value,
    });
  };

  const handleStatusChange = (event) => {
    setSelectedUser({
      ...selectedUser,
      Role: event.target.value,
    });
  };

  const handleRoleChangeForAddRole = (event) => {
    const updatedRole = event.target.value;
    setRoleData({
      ...roleData,
      selectedRole: updatedRole,
      selectedPermissions: rolePermissions[updatedRole] || [],
    });
  };

  const handlePermissionChange = (e, permission) => {
    const isChecked = e.target.checked;
    setRoleData({
      ...roleData,
      selectedPermissions: isChecked
        ? [...(roleData.selectedPermissions || []), permission]
        : roleData.selectedPermissions.filter((p) => p !== permission),
    });
  };

  return (
    <Container fluid className="mt-3">
      <div className="col-lg-12">
        <div className="row">
          <div className="col-md-12 p-0">
            <div
              className="user-dashboard-info-box table-responsive mb-0 p-4 shadow table"
              id="admin-table"
            >
              <div className="d-flex justify-content-between align-items-center search-addbutton">
                <div className="search-bar mb-3 w-25">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by Name"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
                <div>
                  <button
                    className="btn btn-sm mx-1 btn-light"
                    onClick={handleShowAddRoleModal}
                  >
                    Add Role
                  </button>
                </div>
              </div>

              <table className="table manage-candidates-top mb-0">
                <thead>
                  <tr>
                    {headerColumns.map((column) => (
                      <th key={column.field}>
                        {column.name}
                        <span className="info-icon" title={column.info}>
                          <i className="fas fa-info-circle"></i>
                        </span>
                      </th>
                    ))}
                    <th className="action text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center">
                        <Alert variant="info">Loading...</Alert>
                      </td>
                    </tr>
                  ) : (
                    dataRows
                  )}
                </tbody>
              </table>

              <div className="d-flex justify-content-center align-items-center row-pagination-col mt-5 mt-sm-3">
                <div className="d-flex align-items-center gap-4 pagination-rows">
                  <div className="rows-per-page d-flex align-items-center">
                    <label htmlFor="rowsPerPage" className="me-2">
                      Rows:
                    </label>
                    <select
                      id="rowsPerPage"
                      className="form-control"
                      value={itemsPerPage}
                      onChange={handleRowsPerPageChange}
                    >
                      <option value={3}>3</option>
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                    </select>
                  </div>

                  <ul className="pagination mb-0">
                    <li
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePaginationClick(currentPage - 1)}
                      >
                        Prev
                      </button>
                    </li>
                    {paginationRange().map((page) => (
                      <li
                        key={page}
                        className={`page-item ${
                          currentPage === page ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePaginationClick(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}
                    <li
                      className={`page-item ${
                        currentPage === totalPages ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePaginationClick(currentPage + 1)}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal show={showViewModal} onHide={handleCloseViewModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>View User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div>
              <Form.Group>
                <Form.Label className="mt-3">Name :</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={selectedUser.Name}
                  readOnly
                />
                <Form.Label className="mt-3">Email :</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={selectedUser.Email}
                  readOnly
                />
                <Form.Label className="mt-3">Role :</Form.Label>
                <Form.Control
                  type="text"
                  name="role"
                  value={selectedUser.Role}
                  readOnly
                />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light text-dark" onClick={handleCloseViewModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showUpdateModal} onHide={handleCloseUpdateModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <Form>
              <Form.Group>
                <Form.Label className="mt-3">Name :</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={selectedUser.Name}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, Name: e.target.value })
                  }
                  // disabled={selectedUser.Role === "User"}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label className="mt-3">Email :</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={selectedUser.Email}
                  readOnly
                />
              </Form.Group>
              <Form.Group>
                <Form.Label className="mt-3">Role:</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedUser.Role}
                  onChange={handleRoleChange}
                >
                  <option>Admin</option>
                  <option>User</option>
                </Form.Control>
              </Form.Group>

              <Form.Group>
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
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light text-dark" onClick={handleCloseUpdateModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>

      {/* <Modal show={showAddRoleModal} onHide={handleCloseAddRoleModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Select Role:</Form.Label>
              <Form.Control
                as="select"
                value={roleData.selectedRole}
                onChange={handleRoleChange}
              >
                <option value="">Select a role</option>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </Form.Control>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Permissions:</Form.Label>
              <div>
                <Form.Check type="checkbox" label="View" name="view" />
                <Form.Check type="checkbox" label="Edit" name="edit" />
                <Form.Check type="checkbox" label="Delete" name="delete" />
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light text-dark" onClick={handleCloseAddRoleModal}>
            Close
          </Button>
          <Button variant="primary">Add Role</Button>
        </Modal.Footer>
      </Modal> */}

      <Modal show={showAddRoleModal} onHide={handleCloseAddRoleModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Select Role:</Form.Label>
              <Form.Control
                as="select"
                value={roleData.selectedRole}
                onChange={handleRoleChangeForAddRole}
              >
                <option value="">Select a role</option>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </Form.Control>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Permissions:</Form.Label>
              <div>
                {roleData.selectedRole &&
                  rolePermissions[roleData.selectedRole].map((permission) => (
                    <Form.Check
                      key={permission}
                      type="checkbox"
                      label={permission}
                      name={permission.toLowerCase()}
                      checked={roleData.selectedPermissions?.includes(
                        permission
                      )}
                      onChange={(e) => handlePermissionChange(e, permission)}
                    />
                  ))}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light text-dark" onClick={handleCloseAddRoleModal}>
            Close
          </Button>
          {/* <Button variant="primary">Add Role</Button> */}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageRole;
