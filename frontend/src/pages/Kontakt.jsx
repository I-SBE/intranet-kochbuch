import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";

import "../styles/FormLayout.css";
import { FiArrowRightCircle } from "react-icons/fi";


//--------------------------------------------------------------------------

function Kontakt() {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const [submitted, setSubmitted] = useState(false);

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", message: "" });
      } else {
        alert("Fehler beim Senden.");
      }
    } catch (err) {
      console.error("Fehler:", err);
      alert("Serverfehler.");
    }
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  return (
    <div className="kontakt-container">
      <div className="kontakt-card">
        <h1>Kontakt</h1>

        {submitted && (
          <Alert variant="success">Vielen Dank für Ihre Nachricht!</Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ihr Name"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>E-Mail</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ihre E-Mail-Adresse"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formMessage">
            <Form.Label>Nachricht</Form.Label>
            <Form.Control
              as="textarea"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              placeholder="Ihre Nachricht..."
              required
            />
          </Form.Group>

          <div className="text-center mt-4">
            <Button variant="warning" type="submit" className="custom-nav-link align-items-center">
              Abschicken
              <FiArrowRightCircle className="ms-2" />
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default Kontakt;
