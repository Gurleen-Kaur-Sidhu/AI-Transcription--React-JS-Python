import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // const [isChecking, setIsChecking] = useState(true);
  // const [isAuthenticated, setIsAuthenticated] = useState(false);

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (token) {
  //     setIsAuthenticated(true);
  //   }
  //   setIsChecking(false);
  // }, []);

  // if (isChecking) {
  //   return <div>Loading...</div>;
  // }

  // if (!isAuthenticated) {
  //   return <Navigate to="/login" />;
  // }

  return children; // Render the protected content
};

export default ProtectedRoute;
