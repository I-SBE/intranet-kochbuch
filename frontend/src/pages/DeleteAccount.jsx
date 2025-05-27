import { useState } from "react";
import { Container, Button, Alert, Modal, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

//--------------------------------------------------------------------------

function DeleteAccount() {

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const handleDelete = async () => {

    setLoading(true);
    const token = localStorage.getItem("token");
    localStorage.removeItem("token");
    navigate("/");

    try {
        const res = await fetch("http://backend-api.com:3001/api/users/delete-account", {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        console.log("Konto erfolgreich gelöscht.");
    } catch (err) {
        console.error("Fehler beim Löschen:", err.message);
    } finally {
        setLoading(false);
        setShowModal(false);
    }
  };


  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  return (
    <Container style={{ maxWidth: "500px", marginTop: "100px" }}>
      <h2 className="mb-4 text-danger">Konto löschen</h2>

      {message && (
        <Alert variant={message.includes("erfolgreich") ? "success" : "danger"}>{message}</Alert>
      )}

      <p>Bist du sicher, dass du dein Konto <strong>dauerhaft</strong> löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.</p>

      <Button variant="danger" onClick={() => setShowModal(true)} disabled={loading}>
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
    </Container>
  );
}

//--------------------------------------------------------------------------

export default DeleteAccount;