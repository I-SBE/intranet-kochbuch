import { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";

import { loginUser } from "../api-services/auth";

import "../styles/FormLayout.css";

//--------------------------------------------------------------------------

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const location = useLocation();
  const locationMessage = location.state?.message;

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  //--------------------------------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { ok, data } = await loginUser(formData);

      if (ok && data.user && data.token) {
        onLogin(data.token, data.user);
        setMessage("Login erfolgreich!");
        setTimeout(() => navigate("/"), 1000);
      }else {
        setMessage(data.message || "Login fehlgeschlagen.");
      }
    } catch (error) {
      console.error("Fehler:", error);
      setMessage("Serverfehler!");
    }
  };

  //--------------------------------------------------------------------------

  return (
    <div className="kontakt-container">
      <div className="kontakt-card">
        <h2 className="mb-4">Login</h2>

        {locationMessage && (
          <Alert variant="warning">
            {locationMessage}
          </Alert>
        )}

        {message && (
          <Alert variant={message.includes("erfolgreich") ? "success" : "danger"}>
            {message}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>E-Mail</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Passwort</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            Einloggen
          </Button>
        </Form>
      </div>
    </div>

  );
}

//--------------------------------------------------------------------------

export default Login;