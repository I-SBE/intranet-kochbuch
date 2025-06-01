import { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import { validatePassword, validateMatchingPasswords } from "../utils/validation";
import { registerUser } from "../api-services/auth";
import "../styles/FormLayout.css";

//--------------------------------------------------------------------------

function Register() {

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    image: null,
  });

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword(formData.password)) {
      setMessage("Das Passwort ist zu schwach. Mind. 8 Zeichen, ein Großbuchstabe, eine Zahl und ein Sonderzeichen.");
      return;
    }

    if (!validateMatchingPasswords(formData.password, formData.confirmPassword)) {
      setMessage("Die Passwörter stimmen nicht überein.");
      return;
    }

    try {
      const { ok, data } = await registerUser(formData);
      if (ok) {
        setMessage("Registrierung erfolgreich!");
        setFormData({ 
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          image: null 
        });
        setPreview(null);

        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage(data.message || "Registrierung fehlgeschlagen.");
      }
    } catch (error) {
      console.error("Fehler:", error);
      setMessage("Serverfehler!");
    }
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  return (
    <div className="kontakt-container">
      <div className="kontakt-card">
        <h2 className="mb-4">Benutzer registrieren</h2>

        {message && (
          <Alert variant={message.includes("erfolgreich") ? "success" : "danger"}>
            {message}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>

          <div className="text-center mb-3">
            <label htmlFor="image-upload">
              <div
                className="image-preview"
                style={{ backgroundImage: `url(${preview || "/default-profile.png"})` }}
              />
            </label>
            
            <Form.Control
              id="image-upload"
              type="file"
              name="image"
              onChange={handleChange}
              style={{ display: "none" }}
            />
          </div>


          <Form.Group className="mb-3" controlId="firstName">
            <Form.Label>Vorname</Form.Label>
            <Form.Control
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="lastName">
            <Form.Label>Nachname</Form.Label>
            <Form.Control
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </Form.Group>

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

          <Form.Group className="mb-3" controlId="confirmPassword">
            <Form.Label>Passwort bestätigen</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            Registrieren
          </Button>
        </Form>
      </div>
    </div>
  );
}

//--------------------------------------------------------------------------

export default Register;