import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Spinner, Alert, Button, Modal } from "react-bootstrap";

import RecipeForm from "../components/RecipeForm";

//--------------------------------------------------------------------------

function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState({
    title: "",
    ingredients: "",
    steps: "",
    images: []
  });
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

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

  useEffect(() => {
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

  const handleImageReplace = async (oldImageName, newFile) => {
    if (!newFile) return;

    const formData = new FormData();
    formData.append("newImage", newFile);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://backend-api.com:3001/api/recipes/${id}/images/${oldImageName}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Fehler beim Ersetzen.");
      }

      const newImageName = data.newImageName;

      setRecipe(prev => ({
        ...prev,
        images: prev.images.map(img =>
          img === oldImageName ? newImageName : img
        )
      }));

    } catch (err) {
      alert(err.message);
    }
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const handleImageDelete = async (imageName) => {
    const confirm = window.confirm("Möchtest du dieses Bild wirklich löschen?");
    if (!confirm) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://backend-api.com:3001/api/recipes/${id}/images/${imageName}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Fehler beim Löschen.");
      }

      setRecipe(prev => ({
        ...prev,
        images: prev.images.filter(img => img !== imageName)
      }));
    } catch (err) {
      alert(err.message);
    }
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const handleNewImageUpload = async (files) => {
    if (!files.length) return;

    const formData = new FormData();
    for (let file of files) {
      formData.append("images", file);
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://backend-api.com:3001/api/recipes/${id}/images`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Fehler beim Hochladen der Bilder.");
      }

      setRecipe((prev) => ({
        ...prev,
        images: [...prev.images, ...data.newImages]
      }));
    } catch (err) {
      alert(err.message);
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
          <div className="mb-4">
            <h5>Bilder:</h5>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {recipe.images && recipe.images.length > 0 && recipe.images.map((img) => (
                <div
                  key={img}
                  style={{
                    position: "relative",
                    width: "140px",
                    height: "100px",
                    overflow: "hidden",
                    borderRadius: "8px",
                    border: "1px solid #ccc"
                  }}
                >
                  <img
                    src={`http://backend-api.com:3001/uploads/${img}`}
                    alt="Bild"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                  />

                  <Button
                    variant="light"
                    size="sm"
                    onClick={() => handleImageDelete(img)}
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      borderRadius: "50%",
                      width: "28px",
                      height: "28px",
                      padding: "0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 2
                    }}
                  >
                    ❌
                  </Button>

                  <Button
                    variant="light"
                    size="sm"
                    onClick={() => document.getElementById(`replace-${img}`).click()}
                    style={{
                      position: "absolute",
                      top: "5px",
                      left: "5px",
                      borderRadius: "50%",
                      width: "28px",
                      height: "28px",
                      padding: "0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 2
                    }}
                  >
                    🔄
                  </Button>

                  <input
                    id={`replace-${img}`}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => handleImageReplace(img, e.target.files[0])}
                  />
                </div>
              ))}

              <div
                style={{
                  width: "140px",
                  height: "100px",
                  borderRadius: "8px",
                  border: "1px dashed #aaa",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  backgroundColor: "#f9f9f9",
                  position: "relative"
                }}
                onClick={() => document.getElementById("new-image-upload").click()}
              >
                <img
                  src="/default-add-image.png"
                  alt="Neues Bild"
                  style={{
                    width: "60%",
                    height: "60%",
                    objectFit: "contain",
                    opacity: 0.6
                  }}
                />
                <input
                  id="new-image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => handleNewImageUpload(e.target.files)}
                />
              </div>
            </div>
          </div>

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