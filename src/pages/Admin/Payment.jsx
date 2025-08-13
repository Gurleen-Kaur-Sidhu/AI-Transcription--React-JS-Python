import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import axiosInstance from "../../axiosInstance";

const Payment = () => {
  const [payments, setPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  const columns = [
    { name: "Name", field: "Name", info: "Name associated with the payment" },
    { name: "Date", field: "Date", info: "Date of the payment" },
    {
      name: "Description",
      field: "Description",
      info: "Description of the payment",
    },
    { name: "Currency", field: "Currency", info: "Currency of the payment" },
    { name: "Amount", field: "Amount", info: "Amount of the payment" },
    { name: "Status", field: "Status", info: "Current status of the payment" },
  ];

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axiosInstance.get("/payment/list");
        console.log("API Response:", response.data.users);
        setPayments(response.data.users || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching payments data:", err);
        setError("Error fetching payment data");
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const filteredPayments = payments.filter((payment) =>
    payment.Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPagePayments = filteredPayments.slice(
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

  const headerColumns = columns.map((column) => (
    <th key={column.field}>
      {column.name}
      <span className="info-icon" title={column.info}>
        <i className="fas fa-info-circle"></i>
      </span>
    </th>
  ));

  const dataRows = currentPagePayments.map((payment, index) => (
    <tr className="payment-list" key={index}>
      {columns.map((column) => (
        <td key={column.field}>
          {column.field === "Status" ? (
            payment.Status ? (
              payment.Status
            ) : (
              "N/A"
            )
          ) : payment[column.field] ? (
            payment[column.field]
          ) : (
            "N/A"
          )}
        </td>
      ))}
    </tr>
  ));

  const getPaginationRange = () => {
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

  return (
    <Container fluid className="mt-3 mb-4 payment-section">
      <div className="col-lg-12">
        <div className="row">
          <div className="col-md-12 p-0">
            <div
              className="user-dashboard-info-box table-responsive mb-0 table p-4 shadow"
              id="admin-table"
            >
              <div className="d-flex justify-content-between align-items-center">
                <div className="search-bar mb-3 w-25">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by Name"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>

              <table className="table manage-candidates-top mb-0">
                <thead>
                  <tr>{headerColumns}</tr>
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
                      className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePaginationClick(currentPage - 1)}
                      >
                        Prev
                      </button>
                    </li>

                    {getPaginationRange().map((page) => (
                      <li
                        key={page}
                        className={`page-item ${currentPage === page ? "active" : ""}`}
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
                      className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
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
    </Container>
  );
};

export default Payment;

