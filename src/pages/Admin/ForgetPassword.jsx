import React, { useState } from "react";
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

export default function ForgetPassword() {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    mode: "onSubmit",
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      if (step === 1) {
        const { email } = data;

        const response = await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/forgot-password`,
          { email }
        );

        if (response.data.message) {
          Swal.fire({
            icon: "success",
            title: "OTP Sent",
            text: response.data.message,
          });
          setEmail(email);
          setStep(2);
        }
      } else if (step === 2) {
        const { otp } = data;

        const response = await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/verify-otp`,
          {
            email,
            otp,
          }
        );

        if (response.data.message) {
          Swal.fire({
            icon: "success",
            title: "OTP Verified",
            text: response.data.message,
          });
          setOtp(otp);
          setStep(3);
        }
      } else if (step === 3) {
        const { password, confirmPassword } = data;

        console.log("New Password: ", password);

        if (password !== confirmPassword) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Passwords do not match",
          });
          setLoading(false);
          return;
        }

        const response = await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/reset-password`,
          {
            email,
            otp,
            new_password: password,
          }
        );

        if (response.data.message) {
          Swal.fire({
            icon: "success",
            title: "Password Reset Successful",
            text: response.data.message,
          });
          setStep(4);

          setTimeout(() => {
            navigate("/admin/login");
          }, 1500);
        }
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.error || "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bgcolor forget-page" id="admin-forgetpassword">
      <Container>
        <Row>
          <Col
            lg={6}
            md={8}
            className="form-col mx-auto card shadow rounded form-div"
          >
            <div className="form-left h-100 py-5 px-5 div-box">
              <h3 className="mb-3">
                {step === 1
                  ? "Admin Forgot Password"
                  : step === 2
                  ? "Verify OTP"
                  : step === 3
                  ? "Reset Password"
                  : "Password Reset Successful"}
              </h3>

              <Form className="row g-4" onSubmit={handleSubmit(onSubmit)}>
                {step === 1 && (
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
                              /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                            message: "Please enter a valid email address",
                          },
                        })}
                      />
                    </InputGroup>
                    <p className="mt-2 mb-1">
                      Provide the email address associated with your account to
                      recover your password.
                    </p>
                    {errors.email && (
                      <p className="text-danger mb-0">{errors.email.message}</p>
                    )}
                  </Col>
                )}

                {step === 2 && (
                  <Col xs={12}>
                    <Form.Label>
                      OTP<span className="text-danger">*</span>
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
                        type="text"
                        placeholder="Enter OTP"
                        {...register("otp", { required: "Please enter OTP" })}
                      />
                    </InputGroup>
                    <p className="mt-2 mb-1">
                      Enter the OTP sent to your email.
                    </p>
                    {errors.otp && (
                      <p className="text-danger">{errors.otp.message}</p>
                    )}
                  </Col>
                )}

                {step === 3 && (
                  <>
                    <Col xs={12}>
                      <Form.Label>
                        New Password<span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter new password"
                        {...register("password", {
                          required: "Please enter a new password",
                        })}
                      />
                    </Col>
                    <Col xs={12}>
                      <Form.Label>
                        Confirm Password<span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Confirm new password"
                        {...register("confirmPassword", {
                          required: "Please confirm your password",
                        })}
                      />
                    </Col>
                  </>
                )}

                <Col xs={12}>
                  <Button
                    type="submit"
                    className="btn px-4 mb-2"
                    disabled={isSubmitting || loading}
                  >
                    {step === 1
                      ? isSubmitting
                        ? "Sending OTP..."
                        : "Reset Password"
                      : step === 2
                      ? isSubmitting
                        ? "Verifying OTP..."
                        : "Verify OTP"
                      : "Reset Password"}
                  </Button>
                </Col>
              </Form>
              {step === 1 && (
                <p>
                  Back to <Link to="/admin/login">Login</Link>
                </p>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}
