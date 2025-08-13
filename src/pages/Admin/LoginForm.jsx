import React, { useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import axiosInstance from "./../../../src/axiosInstance";

export default function AdminLoginForm() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
    watch,
  } = useForm({
    mode: "onSubmit",
  });

  const rememberMe = watch("rememberMe");

  useEffect(() => {
    if (
      rememberMe &&
      localStorage.getItem("email") &&
      localStorage.getItem("password")
    ) {
      reset({
        email: localStorage.getItem("email"),
        password: localStorage.getItem("password"),
        rememberMe: true,
      });
    }
  }, [rememberMe, reset]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      return navigate("/admin/dashboard");
    } else {
      return navigate("/admin/login");
    }
  }, []);

  const onSubmit = async (data) => {
    const requestData = { ...data, rememberMe: watch("rememberMe") };

    // try {
    const response = await axiosInstance.post("admin/login", {
      email: data.email,
      password: data.password,
    });

    if (response.status === 200) {
      const token = response.data.token;
      const Name = response.data.Name;
      const Email = response.data.Email;
     
     

      const Role = response.data.Role || '';
      console.log("Role:", Role);
      if (Role.toLowerCase() !== "admin") {
        Swal.fire({
          icon: "error",
          title: "Unauthorized",
          text: "You do not have admin privileges.",
        });
        return;
      }
      

      console.log("Token received:", token);
      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome back!",
        timer: 2000,
        showConfirmButton: true,
      });

      localStorage.setItem("token", token);
      localStorage.setItem("Name", Name);
      localStorage.setItem("Email", Email);
      localStorage.setItem("Role", Role);
      console.log(localStorage.getItem("Role"));

      if (data.rememberMe) {
        localStorage.setItem("email", data.email);
        localStorage.setItem("password", data.password);
      } else {
        localStorage.removeItem("email");
        localStorage.removeItem("password");
      }

      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 2000);
    }
    // } catch (error) {
    //   if (error.response) {
    //     const errorMessage =
    //       error.response.data?.message ||
    //       error.response.data?.error ||
    //       "An unknown error occurred. Please try again.";

    //     Swal.fire({
    //       icon: "error",
    //       title: "Login Failed",
    //       text: errorMessage,
    //     });
    //   } else {
    //     Swal.fire({
    //       icon: "error",
    //       title: "Network Error",
    //       text: "Please check your internet connection.",
    //     });
    //   }

    //   reset({ ...data, rememberMe: watch("rememberMe") });
    // }
  };

  return (
    <section className="bgcolor login-page">
      <Container>
        <Row>
          <Col
            lg={6}
            md={12}
            className="card form-col mx-auto shadow rounded form-div"
          >
            <div className="form-left h-100 p-lg-5">
              <h3 className="mb-3">Admin Login</h3>
              <Form className="row g-4" onSubmit={handleSubmit(onSubmit)}>
                {/* Email Field */}
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
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      {...register("email", {
                        required: "Please enter your email",
                        pattern: {
                          value:
                            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i,
                          message: "Please enter a valid email address",
                        },
                      })}
                    />
                  </InputGroup>
                  {errors.email && (
                    <p className="text-danger mb-0">{errors.email.message}</p>
                  )}
                </Col>

                {/* Password Field */}
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
                    <Form.Control
                      type="password"
                      placeholder="Enter Password"
                      {...register("password", {
                        required: "Please enter your password",
                      })}
                    />
                  </InputGroup>
                  {errors.password && (
                    <p className="text-danger mb-0">
                      {errors.password.message}
                    </p>
                  )}
                </Col>

                {/* Remember Me & Forgot Password */}
                <Col sm={6}>
                  <Form.Check
                    type="checkbox"
                    label="Remember me"
                    {...register("rememberMe")}
                  />
                </Col>
                <Col sm={6}>
                  <Link to="/admin/forget" className="float-end text-primary">
                    Forgot Password?
                  </Link>
                </Col>

                {/* Submit Button */}
                <Col xs={12}>
                  <Button
                    type="submit"
                    className="btn px-4 mb-2"
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
                      </div>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </Col>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}
