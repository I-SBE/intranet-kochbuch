import { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

//--------------------------------------------------------------------------

function ChangePassword() {

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      return setMessage("Das neue Passwort muss mindestens 8 Zeichen lang sein.");
    }

    if (newPassword !== confirmPassword) {
      return setMessage("Die Passwörter stimmen nicht überein.");
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setMessage("Passwort erfolgreich geändert.");
      setTimeout(() => navigate("/profile"), 1000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  return (
    <div className="kontakt-container">
      <div className="kontakt-card">
        <h1>Passwort ändern</h1>

        {message && (
          <Alert variant={message.includes("erfolgreich") ? "success" : "danger"}>
            {message}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Aktuelles Passwort</Form.Label>
            <Form.Control
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Neues Passwort</Form.Label>
            <Form.Control
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Neues Passwort bestätigen</Form.Label>
            <Form.Control
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button 
            type="submit" 
            variant="warning" 
            className="custom-nav-link">
            Passwort speichern
          </Button>
        </Form>
      </div>
    </div>
  );
}

//--------------------------------------------------------------------------

export default ChangePassword;