import React, { useState, useEffect } from "react";
import {
  Container,
  Modal,
  Form,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import axiosInstance from "../../axiosInstance";

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newUser, setNewUser] = useState({
    Name: "",
    Email: "",
    Role: "",
  });
  const [editUser, setEditUser] = useState({
    Name: "",
    Email: "",
    Role: "",
    Status: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const columns = [
    { name: "Name", field: "name", info: "Full name of the user" },
    { name: "Email", field: "id", info: "Unique identifier for the user" },
    { name: "Role", field: "position", info: "Job position of the user" },
    { name: "Status", field: "status", info: "Current status of the user" },
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Missing token");
          return;
        }

        const response = await axiosInstance.get("user-list", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("API Response:", response.data);

        const transformedData = response.data.users.map((user) => ({
          id: user.Email,
          name: user.Name,
          position: user.Role,
          status: user.Status,
        }));

        setUsers(transformedData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleEditUserChange = (e) => {
    const { name, value } = e.target;
    setEditUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddUser = async () => {
    setIsLoading(true);
    setErrorMessage("");
  
    if (!newUser.Name || !newUser.Email || !newUser.Role) {
      setErrorMessage("Name, Email, and Role are required.");
      setIsLoading(false);
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.Email)) {
      setErrorMessage("Please enter a valid email.");
      setIsLoading(false);
      return;
    }
  
    const existingUser = users.find(user => user.id === newUser.Email);
    if (existingUser) {
      setErrorMessage("Email already exists.");
      setIsLoading(false);
      return;
    }
  
    try {
      const response = await axiosInstance.post("add/user", newUser, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
  
      if (response.status === 200) {
        setUsers((prevUsers) => [
          ...prevUsers,
          {
            id: newUser.Email,
            name: newUser.Name,
            position: newUser.Role,
            status: "Active",
          },
        ]);
  
        setNewUser({ Name: "", Email: "", Role: "" });
        handleCloseAddModal();
  
        alert(response.data.message);
      } else {
        setErrorMessage("Failed to add user.");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      setErrorMessage("An error occurred while adding the user.");
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleEditUser = async () => {
    setIsEditing(true);
    setErrorMessage("");

    if (!editUser.Name || !editUser.Email) {
      setErrorMessage("Name and Email are required.");
      setIsEditing(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editUser.Email)) {
      setErrorMessage("Please enter a valid email.");
      setIsEditing(false);
      return;
    }

    try {
      const response = await axiosInstance.put("edit-user", editUser, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === editUser.Email
              ? {
                  ...user,
                  name: editUser.Name,
                  position: editUser.Role,
                  status: editUser.Status,
                }
              : user
          )
        );

        setEditUser({ Name: "", Email: "", Role: "", Status: "" });
        handleCloseEditModal();
        alert(response.data.message);
      } else {
        setErrorMessage("Failed to update user.");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setErrorMessage("An error occurred while updating the user.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleShowAddModal = () => setShowAddModal(true);

  const handleShowEditModal = (user) => {
    setEditUser({
      Name: user.name,
      Email: user.id,
      Role: user.position,
      Status: user.status,
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const headerColumns = columns.map((column) => (
    <th key={column.field}>
      {column.name}
      <span className="info-icon" title={column.info}>
        <i className="fas fa-info-circle"></i>
      </span>
    </th>
  ));

  const dataRows = currentPageUsers.map((user) => (
    <tr className="candidates-list" key={user.id}>
      {columns.map((column) => (
        <td key={column.field}>{user[column.field]}</td>
      ))}
      <td className="text-right">
        <button
          className="btn btn-sm btn-danger"
          onClick={() => handleShowEditModal(user)}
        >
          Action
        </button>
      </td>
    </tr>
  ));

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewUser({ Name: "", Email: "", Role: "" }); 
  };
  

  return (
    <Container fluid className="mt-3">
      <div className="col-lg-12">
        <div className="row">
          <div className="col-md-12 p-0">
            <div
              className="user-dashboard-info-box table-responsive mb-0 p-4 shadow-lg table"
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
                    onClick={handleShowAddModal}
                  >
                    Add User
                  </button>
                </div>
              </div>

              <table className="table manage-candidates-top mb-0 responsive">
                <thead>
                  <tr>
                    {headerColumns}
                    <th className="action text-right">Action</th>
                  </tr>
                </thead>
                <tbody>{dataRows}</tbody>
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

      {/* Add User Modal */}
      <Modal show={showAddModal} onHide={handleCloseAddModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          
          <Form>
            <Form.Group>
              <Form.Label className="mt-3">Name :</Form.Label>
              <Form.Control
                type="text"
                name="Name"
                value={newUser.Name}
                onChange={handleNewUserChange}
                placeholder="Enter user name"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className="mt-3">Email :</Form.Label>
              <Form.Control
                type="email"
                name="Email"
                value={newUser.Email}
                onChange={handleNewUserChange}
                placeholder="Enter user email"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className="mt-3">Role:</Form.Label>
              <Form.Control
                as="select"
                name="Role"
                value={newUser.Role}
                onChange={handleNewUserChange}
                placeholder="Select role"
              >
                <option value="">Select a Role</option>
                <option>Admin</option>
                <option>User</option>
                <option>Manager</option>
                <option>Supervisor</option>
                <option>HR</option>
              </Form.Control>
              {/* {!newUser.Role && errorMessage && (
      <div className="text-danger mt-2">Role is required.</div>
    )} */}
            </Form.Group>
            {errorMessage && <div variant="danger" className="text-danger mt-2">{errorMessage}</div>}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light text-dark" onClick={handleCloseAddModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddUser}
            disabled={isLoading}
          >
            {isLoading ? <Spinner animation="border" size="sm" /> : "Add User"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          
          <Form>
            <Form.Group>
              <Form.Label className="mt-3">Name :</Form.Label>
              <Form.Control
                type="text"
                name="Name"
                value={editUser.Name}
                onChange={handleEditUserChange}
                placeholder="Enter user name"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className="mt-3">Email :</Form.Label>
              <Form.Control
                type="email"
                name="Email"
                value={editUser.Email}
                onChange={handleEditUserChange}
                disabled
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className="mt-3">Role:</Form.Label>
              <Form.Control
                as="select"
                name="Role"
                value={editUser.Role}
                onChange={handleEditUserChange}
                placeholder="Select role"
              >
                <option value="">Select a Role</option>
                <option>Admin</option>
                <option>User</option>
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label className="mt-3">Status:</Form.Label>
              <Form.Control
                as="select"
                name="Status"
                value={editUser.Status}
                onChange={handleEditUserChange}
                placeholder="Select status"
              >
                <option>Active</option>
                <option>Inactive</option>
              </Form.Control>
            </Form.Group>
            {errorMessage && <div variant="danger" className="mt-2 text-danger">{errorMessage}</div>}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light text-dark" onClick={handleCloseEditModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleEditUser}
            disabled={isEditing}
          >
            {isEditing ? <Spinner animation="border" size="sm" /> : "Edit User"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageUser;




