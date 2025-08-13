import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Spinner,
  Form,
} from "react-bootstrap";
import Swal from "sweetalert2";
import "./css/audiolist.css";
import axiosInstance from "../../axiosInstance";

const Audiolist = ({ refreshAudioListKey }) => {
  const [audioFiles, setAudioFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalAudioFiles, setTotalAudioFiles] = useState(0);

  useEffect(() => {
    fetchAudioFiles();
  }, [refreshAudioListKey]);

  const fetchAudioFiles = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/audio-list");
      if (response.status === 200) {
        setAudioFiles(response.data.audio_files || []);
        setTotalAudioFiles(response.data.audio_files.length || 0);
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

  const totalPages = Math.ceil(totalAudioFiles / rowsPerPage);
  const currentFiles = audioFiles.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

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
      downloadUrl = "/text/download";
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

  return (
    <>
      <Container fluid>
        <Card className="audiolist-card shadow-sm">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={6} className="d-flex align-items-center">
                <Card.Title className="fw-bold mb-0">Audio Files</Card.Title>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
      <Container fluid className="py-4">
        <Card className="shadow-sm">
          <Card.Header className="bg-light d-flex justify-content-between align-items-center py-4">
            <h5 className="mb-0">My Audio Files</h5>
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
                    <th>NAME</th>
                    <th>DURATION</th>
                    <th>Download Audio</th>
                    <th>Preview Text</th>
                  </tr>
                </thead>
                <tbody>
                  {currentFiles.length > 0 ? (
                    currentFiles.map((file, index) => (
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

export default Audiolist;
