import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import axios from "axios";


const Membership = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/admin/plans`
        );

        if (
          response.data.status === "success" &&
          Array.isArray(response.data.plans)
        ) {
          setPlans(response.data.plans);
        } else {
          console.error(
            "Failed to fetch plans. Invalid response:",
            response.data
          );
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);


  return (
    <section className="pricing-section bgcolor">
      <Container>
        <Row className="justify-content-center">
          {loading ? (
            <Col className="text-center">
              <Spinner animation="border" variant="primary" />
            </Col>
          ) : plans.length === 0 ? (
            <p>No plans available at the moment.</p>
          ) : (
            plans.map((plan, index) => (
              <Col lg={4} md={6} sm={12} key={index} className="mb-2">
                <Card className="h-100 text-center shadow-lg price-card">
                  <Card.Body>
                    <Card.Title className="fw-bold">
                      <h5>{plan.product_name}</h5>
                    </Card.Title>
                    <Card.Subtitle className="my-2 text-muted">
                      {plan.interval === "month" ? "Monthly" : "Yearly"}{" "}
                      subscription
                    </Card.Subtitle>
                    <h2 className="fw-bold mb-4">
                      <span className="fs-3 text-primary">
                        {(plan.amount / 100).toFixed(2)}
                      </span>
                      <small className="fs-5 text-muted">/month</small>
                    </h2>
                    {/* <Button
                      
                      variant="primary"
                      className="w-100 fw-bold"
                      size="lg"
                    >
                      Get Started
                    </Button> */}
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </Container>
    </section>
  );
};

export default Membership;
