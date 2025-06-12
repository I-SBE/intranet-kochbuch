import { useState } from "react";
import { Button, Alert, Modal, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

//--------------------------------------------------------------------------

function DeleteAccount() {

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const handleDelete = async () => {

    setLoading(true);
    const token = localStorage.getItem("token");
    navigate("/");

    try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/delete-account`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        setMessage("Konto erfolgreich gelöscht.");
        localStorage.removeItem("token");
        if (typeof logout === "function") logout();

    } catch (err) {
        console.error("Fehler beim Löschen:", err.message);
    } finally {
        setLoading(false);
        setShowModal(false);
    }
  };


  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  return (
    <div className="kontakt-container">
      <div className="kontakt-card">
        <h1 className="text-danger">Konto löschen</h1>

        {message && (
          <Alert variant={message.includes("erfolgreich") ? "success" : "danger"}>
            {message}
          </Alert>
        )}

        <p>
          Bist du sicher, dass du dein Konto <strong>dauerhaft</strong> löschen möchtest?
          Diese Aktion kann <strong>nicht rückgängig</strong> gemacht werden.
        </p>

        <Button 
          variant="danger"
          className="custom-nav-link"
          onClick={() => setShowModal(true)}
          disabled={loading}>
          Konto löschen
        </Button>

        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Bestätigung</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Möchtest du dein Konto wirklich löschen? Diese Aktion ist <strong>unumkehrbar</strong>.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Abbrechen
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : "Ja, löschen"}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

//--------------------------------------------------------------------------

export default DeleteAccount;