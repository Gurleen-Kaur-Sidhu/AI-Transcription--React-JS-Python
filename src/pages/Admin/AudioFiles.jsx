import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Table, Button, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import axiosInstance from "../../axiosInstance";

const AudioFiles = () => {
  const [audioFiles, setAudioFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  useEffect(() => {
    fetchAudioFiles();
  }, []);

  const fetchAudioFiles = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("audio-list");
      if (response.status === 200) {
        setAudioFiles(response.data.audio_files || []);
      } else {
        Swal.fire("Error", "Failed to fetch audio files", "error");
      }
    } catch (error) {
      Swal.fire(
        "Error",
        "An error occurred while fetching audio files",
        "error"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (audioName, transcriptionText) => {
    const previewText = transcriptionText || "No transcription available.";
    Swal.fire({
      title: "Audio Preview",
      html: `
        <p>${previewText}</p>
        <div>
          <button id="downloadTextBtn" class="swal2-confirm swal2-styled btn" style="margin-right: 10px;">Download Text</button>
          <button id="copyBtn" class="swal2-cancel swal2-styled btn">Copy</button>
        </div>
      `,
      showCloseButton: true,
      willOpen: () => {
        document
          .getElementById("downloadTextBtn")
          .addEventListener("click", () => handleDownload(audioName, "text"));

        document
          .getElementById("copyBtn")
          .addEventListener("click", () => handleCopy(previewText));
      },
    });
  };

  const handleDownload = async (audioName, type) => {
    const filename = audioName;

    if (!filename) {
      Swal.fire("Error", "Filename is required for download", "error");
      return;
    }

    let downloadUrl = "";
    let responseType = "";
    let headers = {
      filename: filename,
    };

    if (type === "audio") {
      downloadUrl = "download_audio_file";
      responseType = "blob";
    } else if (type === "text") {
      downloadUrl = "text/download";
      responseType = "text";
    }

    try {
      const response = await axiosInstance.get(downloadUrl, {
        headers: headers,
        responseType: responseType,
      });

      let blob;
      if (type === "audio") {
        blob = new Blob([response.data], { type: "audio/mpeg" });
      } else if (type === "text") {
        const textBlob = new Blob([response.data], { type: "text/plain" });
        blob = textBlob;
      }

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename + (type === "audio" ? ".mp3" : ".txt");
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      Swal.fire(
        "Error",
        `An error occurred while downloading the ${type} file`,
        "error"
      );
      console.error(error);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        Swal.fire(
          "Copied!",
          "The preview text has been copied to your clipboard.",
          "success"
        );
      })
      .catch((err) => {
        Swal.fire(
          "Failed to copy!",
          "There was an error copying the text.",
          "error"
        );
      });
  };

  // Search filter logic
  const filteredAudioFiles = audioFiles.filter((file) =>
    file.Audio_Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredAudioFiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPageAudioFiles = filteredAudioFiles.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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

  const handlePaginationClick = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <Container fluid className="mt-3">
      <div className="col-lg-12">
        <div className="row">
          <div className="col-md-12 p-0">
            <div className="user-dashboard-info-box table-responsive mb-0 table p-4 shadow">
              <div className="search-bar mb-3 w-25">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by Name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {loading ? (
                <div className="text-center">
                  <Spinner animation="border" variant="success" />
                </div>
              ) : (
                <Table responsive bordered className="mb-0">
                  <thead>
                    <tr>
                      <th>NAME</th>
                      <th>DURATION</th>
                      <th>Download Audio</th>
                      <th>Preview Text</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPageAudioFiles.length > 0 ? (
                      currentPageAudioFiles.map((file, index) => (
                        <tr key={index}>
                          <td>{file.Audio_Name}</td>
                          <td>{file.Duration}</td>
                          <td>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() =>
                                handleDownload(file.Audio_Name, "audio")
                              }
                            >
                              Download
                            </Button>
                          </td>
                          <td>
                            <Button
                              variant="info"
                              size="sm"
                              onClick={() =>
                                handlePreview(
                                  file.Audio_Name,
                                  file.Transcription_Text
                                )
                              }
                            >
                              Preview
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center">
                          No audio files available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}

              {/* Pagination */}
              <div className="d-flex justify-content-center align-items-center mt-5 mt-sm-3">
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
                    {getPaginationRange().map((page) => (
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
    </Container>
  );
};

export default AudioFiles;
