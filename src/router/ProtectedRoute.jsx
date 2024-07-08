import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, roleRequired }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/" />;
  }

  if (Array.isArray(roleRequired)) {
    if (!roleRequired.includes(user.role_id)) {
      return <Navigate to="/" />;
    }
  } else {
    if (roleRequired && roleRequired !== user.role_id) {
      return <Navigate to="/" />;
    }
  }

  return children;
};

export default ProtectedRoute;
