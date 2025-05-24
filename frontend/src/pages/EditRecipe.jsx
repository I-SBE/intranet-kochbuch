import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Spinner, Alert, Button, Modal, Image } from "react-bootstrap";

import RecipeForm from "../components/RecipeForm";

//--------------------------------------------------------------------------

function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://backend-api.com:3001/api/recipes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Fehler beim Abrufen der Rezeptdaten.");
        }

        const data = await response.json();
        setRecipe(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const handleUpdate = async (updatedRecipe) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://backend-api.com:3001/api/recipes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedRecipe)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Fehler beim Aktualisieren.");
      }

      navigate("/profile");
    } catch (err) {
      alert(err.message);
    }
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://backend-api.com:3001/api/recipes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Fehler beim Löschen.");
      }

      navigate("/profile");
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  return (
    <Container style={{ maxWidth: "800px", marginTop: "100px" }}>
      <h2 className="mb-4">Rezept bearbeiten</h2>

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {recipe && (
        <>
          <RecipeForm
            mode="edit"
            initialData={recipe}
            onSubmit={handleUpdate}
          />
          
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
          >
            Rezept löschen
          </Button>

          {/* Modal zur Bestätigung */}
          <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Rezept löschen</Modal.Title>
            </Modal.Header>
            <Modal.Body>Möchtest du dieses Rezept wirklich löschen?</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Abbrechen
              </Button>
              <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Löschen..." : "Ja, löschen"}
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </Container>
  );
}

//--------------------------------------------------------------------------

export default EditRecipe;