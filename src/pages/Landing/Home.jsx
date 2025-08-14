import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  InputGroup,
  Image,
  Card,
} from "react-bootstrap";
import { Link } from "react-router-dom";

import "./styles/home.css";
import Pricing from "./Pricing";
import Testimonial from "./Testimonial";
import AudioUpload from "./AudioUpload";
import CallAction from "./CallAction";
import FAQ from "./FAQ";
import axios from "axios";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  return (
    <>
      <section className="audio-section  ">
        <AudioUpload />
      </section>

      <section className="feature">
        <Container>
          <Col md={8} className="mb-4 mx-auto text-center">
            <div className="pb-2">
              <h2 className="mb-4">How AI Transcription Works</h2>
              <p>
                Sign up for a free account. Upload your audio/video files
                straight onto our web-based transcription platform.
              </p>
            </div>
          </Col>
          <Row className="text-center">
            {/* Upload Section */}
            <Col md={4} className="mb-4">
              <div className="p-4 border border-primary h-100">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 16V22M12 16L14 18M12 16L10 18"
                    stroke="#88c"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 13.3529C22 15.6958 20.5562 17.7055 18.5 18.5604M14.381 8.02721C14.9767 7.81911 15.6178 7.70588 16.2857 7.70588C16.9404 7.70588 17.5693 7.81468 18.1551 8.01498M7.11616 10.6089C6.8475 10.5567 6.56983 10.5294 6.28571 10.5294C3.91878 10.5294 2 12.4256 2 14.7647C2 16.6611 3.26124 18.2664 5 18.8061M7.11616 10.6089C6.88706 9.9978 6.7619 9.33687 6.7619 8.64706C6.7619 5.52827 9.32028 3 12.4762 3C15.4159 3 17.8371 5.19371 18.1551 8.01498M7.11616 10.6089C7.68059 10.7184 8.20528 10.9374 8.66667 11.2426M18.1551 8.01498C19.0446 8.31916 19.8345 8.83436 20.4633 9.5"
                    stroke="#88c"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <h4 className="mt-4 mb-4">Upload</h4>
                <p>
                  Sign up for a free account. Upload your audio/video files
                  straight onto our web-based transcription platform.
                </p>
              </div>
            </Col>
            {/* Transcribe Section */}
            <Col md={4} className="mb-4">
              <div className="p-4 border border-primary h-100">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ color: "#88c" }}
                >
                  <defs>
                    <style>
                      {`.a {
                      fill: none;
                      stroke: #88c;
                      strokeLinecap: round;
                      strokeLinejoin: round;
                    }`}
                    </style>
                  </defs>
                  <path
                    className="a"
                    d="M32.7554,34.8415H8.1671A2.7945,2.7945,0,0,1,5.3727,32.047V8.2944A2.7944,2.7944,0,0,1,8.1671,5.5H22.531Z"
                  />
                  <path
                    className="a"
                    d="M25.2,13.1585H39.8329a2.7945,2.7945,0,0,1,2.7944,2.7945V39.7056A2.7944,2.7944,0,0,1,39.8329,42.5H25.469L22.8,34.8414"
                  />
                  <line
                    className="a"
                    x1="32.7554"
                    y1="34.8415"
                    x2="25.469"
                    y2="42.5"
                  />
                  <path
                    className="a"
                    d="M16.0441,11.0706h0a3.96,3.96,0,0,1,3.96,3.96v4.8958a3.96,3.96,0,0,1-3.96,3.96h0a3.96,3.96,0,0,1-3.96-3.96h0V15.0307a3.96,3.96,0,0,1,3.96-3.96Z"
                  />
                  <path
                    className="a"
                    d="M9.4018,21.1048a6.7645,6.7645,0,0,0,13.2847,0"
                  />
                  <line
                    className="a"
                    x1="16.0441"
                    y1="26.5891"
                    x2="16.0441"
                    y2="29.9251"
                  />
                  <line
                    className="a"
                    x1="27.9687"
                    y1="21.1048"
                    x2="39.2192"
                    y2="21.1048"
                  />
                  <line
                    className="a"
                    x1="31.3835"
                    y1="30.9044"
                    x2="39.2192"
                    y2="30.9044"
                  />
                  <line
                    className="a"
                    x1="29.7307"
                    y1="26.0046"
                    x2="39.2192"
                    y2="26.0046"
                  />
                </svg>
                <h4 className="mt-4 mb-4">Transcribe</h4>
                <p>
                  We use industry-leading artificial intelligence to transcribe
                  your file. We can transcribe an hour-long file in less than 15
                  minutes.
                </p>
              </div>
            </Col>
            {/* Review and Export Section */}
            <Col md={4} className="mb-4 review-export">
              <div className="p-4 border border-primary h-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: "#88c" }}
                  enableBackground="new 0 0 24 24"
                >
                  <g id="user-expert">
                    <path
                      d="M2,19c0-3.9,3.1-7,7-7c2.5,0,4.8,1.3,6.1,3.5l1.7-1c-1-1.7-2.5-3-4.2-3.7C14.1,9.7,15,7.9,15,6c0-3.3-2.7-6-6-6S3,2.7,3,6
		c0,1.9,0.9,3.7,2.4,4.8C2.2,12.2,0,15.3,0,19v5h12v-2H2V19z M5,6c0-2.2,1.8-4,4-4s4,1.8,4,4s-1.8,4-4,4S5,8.2,5,6z"
                    />
                    <path d="M24.1,15.8l-7.6,7.6l-4.7-4.7l1.4-1.4l3.3,3.3l6.2-6.2L24.1,15.8z" />
                  </g>
                </svg>
                <h4 className="mt-4 mb-4">Review and Export</h4>
                <p>
                  Make adjustments to the transcription where needed. Review and
                  edit your transcripts. Export and share your content in a
                  range of formats.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="intro-section">
        <Container>
          <Row className="justify-content-center">
            <Col
              lg={6}
              md={6}
              sm={12}
              className="mt-0 d-flex align-items-center justify-content-center"
            >
              <img src="/landingimages/into-sec.png"></img>
            </Col>

            <Col lg={6} md={6} sm={12} className="mt-5">
              <div>
                <h5>AI-Based Audio-to-Text Processing</h5>
                <h2 className="my-3">Advanced AI Analysis</h2>
                <p>
                  This allows you to convert audio from any source into text,
                  making transcription effortless. Whether the audio comes from
                  mobile apps, desktops, file uploads, URLs, or meetings,
                  VoiceHub captures it all. This ensures that no crucial detail
                  or quote is ever missed, providing accurate and reliable text
                  every time.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <Pricing />
      <section className="security-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={8} className="security-content">
              <h2>Security. Trust Us On This.</h2>
              <p className="my-4">
                Your audio is securely processed with advanced encryption,
                ensuring your privacy is always protected. Our platform also
                follows strict industry-standard privacy practices to safeguard
                your content, giving you complete peace of mind throughout the
                entire process.
              </p>

              <Button as="span" variant="primary" className="px-4 py-2">
                Learn More
              </Button>
            </Col>

            <Col lg={4} sm={12} className="text-center">
              <img src="/landingimages/securityy.png"></img>
            </Col>
          </Row>
        </Container>
      </section>
      <section className="testimonial-section bgcolor">
        <Testimonial />
      </section>
      <section className="call-action">
        <CallAction />
      </section>

      <section className="home-form">
        <Container className="">
          <Row className="align-items-center">
            {/* Left Section */}
            <Col md={6} className="text-light">
              <h1 className="mb-4">Create Your Account</h1>
              <p>
                Sign up to explore a world of opportunities tailored just for
                you.
              </p>
            </Col>
            {/* Right Section */}
            <Col md={6}>
              <div className="form-block">
                <Form>
                  <Row className="mb-3">
                    <Col>
                      <Form.Group controlId="formFirstName">
                        <Form.Label className="text-light">
                          First name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder=""
                          className="form-input"
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group controlId="formLastName">
                        <Form.Label className="text-light">
                          Last name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder=""
                          className="form-input"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group controlId="formPhone" className="mb-3">
                    <Form.Label className="text-light">Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder=""
                      className="form-input"
                    />
                  </Form.Group>
                  <Form.Group controlId="formPhone" className="mb-3">
                    <Form.Label className="text-light">Phone</Form.Label>
                    <Form.Control
                      type="tel"
                      placeholder=""
                      className="form-input"
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="w-100">
                    Request Demo
                  </Button>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <FAQ />
    </>
  );
}
