import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const CallAction = () => {
  return (
    <>
      <Container>
        <Row className="align-items-center">
          <Col lg={8} className="text-center mx-auto">
            <h2>Ready to Transform Your Workflow?</h2>

            <p className="my-4">
              Streamline Your Processes and Boost Productivity in Just Minutes!
            </p>

            <Button as="span" variant="primary" className="px-4 py-2">
              Start Now
            </Button>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default CallAction;
