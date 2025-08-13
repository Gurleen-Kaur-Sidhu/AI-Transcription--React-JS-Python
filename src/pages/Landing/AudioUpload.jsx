import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  InputGroup,
  Image,
  Modal,
  Card,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import "./styles/audioupload.css";

const AudioUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    // const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  return (
    <>
      <Container>
        {/* section */}
        <Row className="align-items-center justify-content-center col-lg-11 mx-auto ">
          {/* Left Section */}
          <Col lg={7} className="mb-4 upload-audio">
            <Row className="text-center mb-4">
              <Col>
                <h2 className="fw-bold">Audio to Text Converter</h2>
                <p>Upload an audio file and convert it to text in seconds.</p>
              </Col>
            </Row>
            <Form>
              <div className="upload-container text-center mb-3">
                <p className="mb-3">Drag & Drop, or</p>
                <Form.Group controlId="fileUpload" className="mb-3">
                  <Form.Control
                    type="file"
                    onChange={handleFileChange}
                    className="d-none"
                    accept=".wav, .mp3, .flac, .ogg, acc"
                  />
                  <label htmlFor="fileUpload">
                    <Button
                      as="span"
                      variant="primary"
                      className="upload-button"
                    >
                      Choose File
                    </Button>
                  </label>
                </Form.Group>
                {fileName && <p className="file-name mt-2">{fileName}</p>}
              </div>
              <p className="supported-files">
                Supported Formats: WAV, MP3, M4A, CAF, AIFF, AVI, RMVB, FLV,
                MP4, MOV, WMV, 10MB size limit only during trial.
              </p>
            </Form>
          </Col>

          {/* Right Section */}
          <Col
            lg={5}
            className="d-flex justify-content-center align-items-center"
          >
            <div className="position-relative image-section">
              <img
                src="https://cdn.maestra.ai/images/2024/03/01152103/video-to-text-w-player.webp"
                alt="Preview"
                className="img-fluid rounded"
              />
            </div>
          </Col>
        </Row>
      </Container>

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        className="audioupload-modal"
        centered
      >
        <Col
          lg={12}
          md={12}
          className="card form-col mx-auto shadow rounded form-div"
        >
          <div className="form-left h-100 p-lg-5">
            <h3 className="mb-3">Login</h3>
            <Form className="row g-4">
            
              <Col xs={12}>
                <Form.Label>
                  Email<span className="text-danger">*</span>
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text className="input-svg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                    >
                      <path
                        fill="#04070e"
                        d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z"
                      />
                    </svg>
                  </InputGroup.Text>
                  <Form.Control type="email" placeholder="Enter your email" />
                </InputGroup>
              </Col>

        
              <Col xs={12}>
                <Form.Label>
                  Password<span className="text-danger">*</span>
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text className="input-svg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                    >
                      <path
                        fill="#04070e"
                        d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z"
                      />
                    </svg>
                  </InputGroup.Text>
                  <Form.Control type="password" placeholder="Enter Password" />
                </InputGroup>
              </Col>

              <Col sm={6}>
                <Form.Check type="checkbox" label="Remember me" />
              </Col>
              <Col sm={6}>
                <Link to="/forget" className="float-end text-primary">
                  Forgot Password?
                </Link>
              </Col>

           
              <Col xs={12}>
                <Button type="submit" className="btn px-4 mb-2">
                  Login
                </Button>
              </Col>
            </Form>
            <p>
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </div>
        </Col>
      </Modal>
    </>
  );
};

export default AudioUpload;
