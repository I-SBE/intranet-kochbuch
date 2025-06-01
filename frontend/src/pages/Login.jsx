import { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";

import { loginUser } from "../api-services/auth";

import { FiLogIn, FiUserPlus } from "react-icons/fi";
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
              placeholder="Ihre E-Mail-Adresse"
              value={formData.email}
              onChange={handleChange}
              required
              style={{margin:"1rem"}}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Passwort</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Ihr Passwort"
              value={formData.password}
              onChange={handleChange}
              required
              style={{margin:"1rem"}}
            />
          </Form.Group>

          <Button 
            variant="warning"
            type="submit"
            className="custom-nav-link align-items-center"
            style={{margin:"1rem"}}
          >
            Einloggen
            <FiLogIn className="me-1" />
          </Button>
        </Form>

        <div className="mt-3 text-center d-flex justify-content-center align-items-center gap-2 flex-wrap">
          <span>Noch kein Konto?</span>
          <Button 
            variant="outline-light"
            type="submit"
            className="custom-nav-link"
            style={{ fontSize: "0.8rem", padding: "5px 10px" }}
            onClick={() => navigate("/register")}
          >
            Registrieren
            <FiUserPlus className="me-1" />
          </Button>
        </div>

      </div>
    </div>

  );
}

//--------------------------------------------------------------------------

export default Login;