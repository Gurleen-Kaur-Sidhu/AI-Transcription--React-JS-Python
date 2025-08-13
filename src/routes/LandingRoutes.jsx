import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingLayout from "../layouts/LandingLayout";
import Home from "../pages/Landing/Home";
import Pricing from "../pages/Landing/Pricing";
import LoginForm from "../pages/Landing/LoginForm";
import SignupForm from "../pages/Landing/SignupForm";
import ForgetPassword from "../pages/Landing/ForgetPassword";
import Success from "../pages/Landing/Success";

const LandingRoutes = () => {
  return (
    <Routes>
      <Route element={<LandingLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<SignupForm />} />
        <Route path="/forget" element={<ForgetPassword />} />
        <Route path="/success" element={<Success />} />

      </Route>
    </Routes>
  );
};

export default LandingRoutes;
