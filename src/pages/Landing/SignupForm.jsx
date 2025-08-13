import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import { useForm } from "react-hook-form";
import "./styles/signup.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axiosInstance from "../../../src/axiosInstance.js";

export default function SignUpForm() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    mode: "onSubmit",
  });

  const watchAllFields = watch();

  const onSubmit = async (data) => {
    console.log("Form Data:", data);
    const response = await axiosInstance.post("register", data);
    console.log("Signup Response:", response.data);
    setServerError("");
    Swal.fire({
      icon: "success",
      title: "Success!",
      text: "You have successfully signed up!",
      showConfirmButton: true,
    });

    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  return (
    <>
      <section className="bgcolor signup-section">
        <Container>
          <Row>
            <Col
              md={6}
              className="card form-col shadow rounded form-div mx-auto"
            >
              <div className="form-left h-100 p-lg-5">
                <h3>Sign Up</h3>
                <p>Create a free account</p>

                <Form onSubmit={handleSubmit(onSubmit)}>
                  {/* Name Field */}
                  <Form.Group as={Col} xs={12} className="mb-3">
                    <Form.Label>
                      Name<span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your name"
                      {...register("name", {
                        required: "Name is required",
                      })}
                    />
                    {errors.name && (
                      <p className="text-danger">{errors.name.message}</p>
                    )}
                  </Form.Group>

                  {/* Email Field */}
                  <Form.Group as={Col} xs={12} className="mb-3">
                    <Form.Label>
                      Email<span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value:
                            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                          message: "Please enter a valid email address",
                        },
                      })}
                    />
                    {errors.email && (
                      <p className="text-danger">{errors.email.message}</p>
                    )}
                  </Form.Group>

                  {/* Password Field */}
                  <Form.Group as={Col} xs={12} className="mb-3">
                    <Form.Label>
                      Password<span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter your password"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message:
                            "Password should be at least 6 characters long",
                        },
                      })}
                    />
                    {errors.password && (
                      <p className="text-danger">{errors.password.message}</p>
                    )}
                  </Form.Group>

                  {/* Confirm Password Field */}
                  <Form.Group as={Col} xs={12} className="mb-3">
                    <Form.Label>
                      Confirm Password
                      <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Confirm your password"
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value) =>
                          value === watchAllFields.password ||
                          "Passwords do not match",
                      })}
                    />
                    {errors.confirmPassword && (
                      <p className="text-danger">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </Form.Group>

                  {/* Submit Button */}
                  <Form.Group as={Col} xs={12} className="mb-3">
                    <Button
                      type="submit"
                      className="btn btn-primary px-4"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="d-flex justify-content-center align-items-center">
                          <Spinner
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                          />
                          {/* <span className="ms-2"></span> */}
                        </div>
                      ) : (
                        "Sign Up"
                      )}
                    </Button>
                  </Form.Group>

                  {/* Display server-side error */}
                  {serverError && <p className="text-danger">{serverError}</p>}
                </Form>
                <p>
                  Already have an account? <Link to="/login">Log in</Link>
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
}
