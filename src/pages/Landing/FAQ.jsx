import React from "react";
import { Accordion, Container, Form, Row, Col, Button } from "react-bootstrap";

const FAQ = () => {
  return (
    <>
      {/* <section id="faq" className="py-5">
      <Container className="col-lg-8 mx-auto">
        <div className="text-center mb-4">
          <h2 className="fw-bold">Frequently Asked Questions</h2>
          <p className="text-muted">
            Find answers to commonly asked questions about our AI transcription
            service.
          </p>
        </div>
        <Accordion defaultActiveKey="0">
          <Accordion.Item eventKey="0" className="bg-dark border-light">
            <Accordion.Header className="text-light bg-dark">
              What is AI transcription?
            </Accordion.Header>
            <Accordion.Body>
              AI transcription is the process of converting speech or audio into
              text using advanced artificial intelligence algorithms, offering
              high accuracy and efficiency.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1" className="bg-dark border-light">
            <Accordion.Header className="text-light bg-dark">
              How accurate is your transcription service?
            </Accordion.Header>
            <Accordion.Body>
              Our AI transcription service offers up to 95% accuracy depending
              on audio quality, language clarity, and background noise.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="2" className="bg-dark border-light">
            <Accordion.Header className="text-light bg-dark">
              What file formats are supported?
            </Accordion.Header>
            <Accordion.Body>
              We support various file formats including MP3, WAV, MP4, and more.
              You can upload your file in any common audio or video format.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="3" className="bg-dark border-light">
            <Accordion.Header className="text-light bg-dark">
              Is my data secure?
            </Accordion.Header>
            <Accordion.Body>
              Absolutely. We use advanced encryption and secure servers to
              ensure your data's safety and confidentiality.
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Container>

      <Container>
        <div className="form-container py-5">
          <div className="form-heading text-center mb-4">
            <h2>Make An Inquiry</h2>
            <p className="fw-bold text-uppercase">
              We Would Love To Work With You
            </p>
          </div>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="fullName">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control type="text" placeholder="Enter your name" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="email">
                  <Form.Label>E-mail</Form.Label>
                  <Form.Control type="email" placeholder="Enter your email" />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3" controlId="business">
              <Form.Label>Business</Form.Label>
              <Form.Select>
                <option selected disabled>
                  Select an option
                </option>
                <option value="1">Option 1</option>
                <option value="2">Option 2</option>
                <option value="3">Option 3</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="message">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Write your message"
              />
            </Form.Group>
            <div className="d-grid">
              <Button type="submit" variant="primary" size="lg">
                Request an Appointment
              </Button>
            </div>
          </Form>
        </div>
      </Container>
    </section> */}
    </>
  );
};

export default FAQ;
