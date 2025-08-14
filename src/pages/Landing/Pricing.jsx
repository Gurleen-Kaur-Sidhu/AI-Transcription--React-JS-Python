import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import "./styles/pricing.css";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance";

const Pricing = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axiosInstance.get("/admin/plans");

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

  const makePayment = async (plan) => {
    try {
      const stripe = await loadStripe(
        "pk_live_xxxxx"
      );

      const email = localStorage.getItem("Email");
      const name = localStorage.getItem("Name");

      if (!email || !name) {
        navigate("/login");
        console.error("User email or name not found in local storage.");
        return;
      }

      const response = await axiosInstance.post(
        "/create/session",
        {
          product_name: plan.product_name,
          product_id: plan.id,
          UserEmail: email,
          UserName: name,
        }
      );
       console.log("resoonseeeee" ,response.data)
       
      const session = response.data;

      if (response.status === 200) {
        const result = await stripe.redirectToCheckout({
          sessionId: session.id,
        });

        if (result.error) {
          console.error(result.error);
        }
      } else {
        console.error(
          "Failed to create session:",
          session.Error || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error during payment:", error);
    }
  };

  return (
    <section className="pricing-section bgcolor">
      <Container>
        <Row className="justify-content-center">
          <Col lg={12} md={12} sm={12} className="mb-4 text-center">
            <h2>Pick the Plan That Best Suits You</h2>
          </Col>

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
                    <Button
                      onClick={() => makePayment(plan)}
                      variant="primary"
                      className="w-100 fw-bold"
                      size="lg"
                    >
                      Get Started
                    </Button>
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

export default Pricing;
