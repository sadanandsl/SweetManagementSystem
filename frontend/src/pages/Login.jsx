import React, { useState, useEffect } from "react";
import API from "../api/axiosConfig";
import { useNavigate, Link } from "react-router-dom";
import "./../App.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // ✅ If already logged in, redirect immediately
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/"); // redirect to dashboard
    }
  }, [navigate]);

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await API.post("/api/auth/login", { email, password });
    localStorage.setItem("token", res.data.access_token);
    localStorage.setItem("role", res.data.role); // ✅ Save role in localStorage

    alert(`Welcome ${res.data.role.toUpperCase()}!`);

    // Redirect based on role
    if (res.data.role === "admin") navigate("/admin");
    else if (res.data.role === "billing") navigate("/billing");
    else navigate("/"); // fallback
  } catch (err) {
    alert("Invalid credentials");
    console.error(err);
  }
};


  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p className="link">
        Don’t have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;
