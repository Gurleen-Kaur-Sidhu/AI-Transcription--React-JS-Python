import React, { useState, useRef, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Card,
  Modal,
  Spinner,
} from "react-bootstrap";
import Swal from "sweetalert2";
import Audiolist from "./Audiolist";
import "./css/home.css";
import axiosInstance from "./../../../src/axiosInstance";

const Home = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [fileDuration, setFileDuration] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filesList, setFilesList] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [refreshList, setRefreshList] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const fileInputRef = useRef();

  useEffect(() => {
    const storedFiles = localStorage.getItem("audioFiles");
    if (storedFiles) {
      setFilesList(JSON.parse(storedFiles));
    }
  }, [refreshList]);

  // const handleFileChange = async (event) => {
  //   const selectedFile = event.target.files[0];
  //   console.log("File selected:", selectedFile);
  //   if (selectedFile) {
  //     // const maxFileSize = 16 * 1024 * 1024; // 16MB in bytes
  //     // if (selectedFile.size > maxFileSize) {
  //     //   Swal.fire("Error", "File size cannot exceed 16MB.", "error");
  //     //   return;
  //     // }

  //     const supportedFileTypes = ["audio/mpeg", "audio/wav", "audio/mp3", "audio/m4a", "audio/aac"];

  //     if (!supportedFileTypes.includes(selectedFile.type)) {
  //       Swal.fire("Error", "Unsupported file type. Please upload a valid audio file (MP3, WAV, M4A, etc.).", "error");
  //       return;
  //     }

  //     setFile(selectedFile);
  //     setFileName(selectedFile.name);
  //     setFileType(selectedFile.type.split("/")[1]);

  //     const audioURL = URL.createObjectURL(selectedFile);
  //     const audio = new Audio(audioURL);
  //     audio.onloadedmetadata = () => {
  //       const formattedDuration = formatDuration(audio.duration);
  //       setFileDuration(formattedDuration);

  //       Swal.fire({
  //         title: "Do you want to change the file name?",
  //         showDenyButton: true,
  //         confirmButtonText: "Yes",
  //         denyButtonText: "No",
  //       }).then((result) => {
  //         if (result.isConfirmed) {
  //           setShowModal(true);
  //         } else if (result.isDenied) {
  //           handleFileUpload(selectedFile, formattedDuration, audioURL);
  //         }
  //       });
  //     };
  //   }
  // };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    console.log("File selected:", selectedFile);

    if (selectedFile) {
      console.log("File size:", selectedFile.size);
      console.log("File type:", selectedFile.type);

      const isDuplicate = filesList.some(
        (file) => file.Audio_Name === selectedFile.name
      );
      if (isDuplicate) {
        Swal.fire("Error", "This file has already been uploaded.", "error");
        setFileName("");
        return;
      }

      const minFileSize = 1000;
      if (selectedFile.size < minFileSize) {
        Swal.fire(
          "Error",
          "File is too small to be a valid audio file.",
          "error"
        );
        setFileName("");
        return;
      }

      // const supportedFileTypes = ["audio/mpeg", "audio/wav", "audio/mp3", "audio/m4a", "audio/aac"];
      // if (!supportedFileTypes.includes(selectedFile.type)) {
      //   Swal.fire("Error", "Unsupported file type. Please upload a valid audio file (MP3, WAV, M4A, etc.).", "error");
      //   setFileName("");
      //   return;
      // }

      setFile(selectedFile);
      setFileName(selectedFile.name);
      setFileType(selectedFile.type.split("/")[1]);

      console.log("File name set to:", selectedFile.name);

      const audioURL = URL.createObjectURL(selectedFile);
      const audio = new Audio(audioURL);
      audio.onloadedmetadata = () => {
        const formattedDuration = formatDuration(audio.duration);
        setFileDuration(formattedDuration);
        console.log("Audio duration:", formattedDuration);

        Swal.fire({
          title: "Do you want to change the file name?",
          showDenyButton: true,
          confirmButtonText: "Yes",
          denyButtonText: "No",
        }).then((result) => {
          if (result.isConfirmed) {
            setShowModal(true);
          } else if (result.isDenied) {
            handleFileUpload(selectedFile, formattedDuration, audioURL);
          }
        });
      };
    }
  };

  const handleFileUpload = async (
    fileToUpload,
    formattedDuration,
    audioURL
  ) => {
    console.log("Uploading file:", fileToUpload);

    if (!fileToUpload) {
      Swal.fire("Error", "No file selected.", "error");
      return;
    }

    const durationToSend = fileDuration || formattedDuration;
    if (!durationToSend) {
      Swal.fire("Error", "File duration is missing.", "error");
      return;
    }

    const fileNameToUse = fileName || fileToUpload.name;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("transcribed_text", "");
      console.log("Form Data:", formData);
      const name = localStorage.getItem("Name");
      const email = localStorage.getItem("Email");

      if (!name || !email) {
        Swal.fire("Error", "Name or email not found in localStorage.", "error");
        return;
      }

      const response = await axiosInstance.post("upload_audio", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          fileName: `${fileNameToUse}.${fileType}`,
          fileType: fileToUpload.type,
          duration: durationToSend,
          userName: name,
          userEmail: email,
        },
      });
      console.log("response ", response);
      console.log("rename......", fileNameToUse);

      console.log("Upload success:", response.data);

      const newFile = {
        Audio_Name: fileNameToUse,
        Duration: durationToSend,
        File_Type: fileToUpload.type,
        Transcription_Text: "",
      };

      console.log("rename", fileNameToUse);

      const updatedFilesList = [...filesList, newFile];
      setFilesList(updatedFilesList);
      localStorage.setItem("audioFiles", JSON.stringify(updatedFilesList));

      Swal.fire(
        "Success",
        `File "${fileNameToUse}" uploaded successfully!`,
        "success"
      );

      setFileName("");
      setFile(null);
      setFileDuration(null);
      setIsUploading(false);
      setShowModal(false);
      setUploadCount(uploadCount + 1);
    } catch (error) {
      setIsUploading(false);
      console.error("Upload failed", error);
      Swal.fire("Error", "File upload failed.", "error");
    }
  };

  const handleButtonClick = () => {
    console.log("Button clicked!");
    fileInputRef.current && fileInputRef.current.click();
  };

  const handleFileNameChange = (event) => {
    setFileName(event.target.value);
  };

  const handlePreview = (fileURL) => {
    setPreviewFile(fileURL);
    setShowPreviewModal(true);
  };

  const formatDuration = (duration) => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);

    const formattedMinutes =
      hours > 0 ? String(minutes).padStart(2, "0") : minutes;
    const formattedSeconds = String(seconds).padStart(2, "0");

    return hours > 0
      ? `${String(hours).padStart(
          2,
          "0"
        )}:${formattedMinutes}:${formattedSeconds}`
      : `${formattedMinutes}:${formattedSeconds}`;
  };

  return (
    <>
      <Container fluid>
        <Card className="custom-card shadow-sm">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={6} className="d-flex align-items-center">
                <Card.Title className="fw-bold mb-0">Transcriptions</Card.Title>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        <Card className="upload-card shadow-sm  my-4">
          <Card.Body className="p-4">
            <Col md={6} className="mx-auto">
              <Row className="g-2">
                <Col>
                  <Form>
                    <div className="upload-container text-center mb-3">
                      <p className="mb-3 text-white">Drag & Drop, or</p>
                      <Form.Group controlId="fileUpload" className="mb-3">
                        <Form.Control
                          type="file"
                          style={{ display: "none" }}
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="audio/*"
                        />
                        <label htmlFor="fileUpload">
                          <Button
                            variant="primary"
                            onClick={handleButtonClick}
                            className="new-transcription-btn"
                            disabled={isUploading}
                          >
                            {isUploading ? (
                              <>
                                <Spinner animation="border" size="sm" />{" "}
                                Uploading...
                              </>
                            ) : (
                              "+ Upload Audio File"
                            )}
                          </Button>
                        </label>
                      </Form.Group>
                      {fileName && <p className="file-name mt-2">{fileName}</p>}
                    </div>
                    <p className="supported-files text-center mb-0">
                      Supported Formats: WAV, MP3, M4A, CAF, AIFF, AVI, RMVB,
                      FLV, MP4, MOV, WMV.
                    </p>
                  </Form>
                </Col>
              </Row>
            </Col>
          </Card.Body>
        </Card>

        {/* Rename File Modal */}
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          centered
          aria-hidden={!showModal}
        >
          <Modal.Header closeButton>
            <Modal.Title>Rename File</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>File Name:</Form.Label>
              <Form.Control
                type="text"
                value={fileName || ""}
                onChange={handleFileNameChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              onClick={() => handleFileUpload(file)}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Spinner animation="border" size="sm" /> Uploading...
                </>
              ) : (
                "Upload Audio"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>

      <Audiolist refreshAudioListKey={uploadCount} />
    </>
  );
};

export default Home;
