import { useEffect, useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";

import ConfirmModal from "../ConfirmModal";

import "../../styles/RecipeForm.css";

//--------------------------------------------------------------------------

function RecipeForm({onCloseForm, onRecipeAdded, onSubmit, mode = "create", initialData = {} }) {

  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [newImages, setNewImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPublic, setIsPublic] = useState(true); 

  const token = localStorage.getItem("token");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedImageToDelete, setSelectedImageToDelete] = useState(null);
  const [previewIndexToDelete, setPreviewIndexToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [difficulty, setDifficulty] = useState("");

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setTitle(initialData.title || "");
      setIngredients(initialData.ingredients || "");
      setSteps(initialData.steps || "");
      setIsPublic(initialData.is_public === true || initialData.is_public === 1);
      setCategory(initialData.category || "");
      setDuration(initialData.duration || "");
      setDifficulty(initialData.difficulty || "");

      if (Array.isArray(initialData.images)) {
        setExistingImages(initialData.images);
      }
    }
  }, [mode, initialData]);

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title || !ingredients || !steps || !category || !duration || !difficulty) {
      setError("Bitte alle Felder ausfüllen.");
      return;
    }

    try {
      if (mode === "edit" && newImages.length > 0) {
        const formData = new FormData();
        newImages.forEach((img) => formData.append("images", img));

        const response = await fetch(`http://backend-api.com:3001/api/recipes/${initialData.id}/images`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Fehler beim Hochladen.");

        setExistingImages((prev) => [...prev, ...data.newImages]);
        setNewImages([]);
        setPreviewImages([]);
      }

      if (mode === "edit" && onSubmit) {
        const updatedData = { title, ingredients, steps, is_public: isPublic, category, duration, difficulty };
        await onSubmit(updatedData);
        setSuccess("Rezept erfolgreich aktualisiert!");
      } else {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("ingredients", ingredients);
        formData.append("steps", steps);
        formData.append("is_public", isPublic);
        formData.append("category", category);
        formData.append("duration", duration);
        formData.append("difficulty", difficulty);

        newImages.forEach((img) => formData.append("images", img));

        const response = await fetch("http://backend-api.com:3001/api/recipes", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Fehler beim Speichern.");

        setSuccess("Rezept erfolgreich gespeichert!");
        setTitle("");
        setIngredients("");
        setSteps("");
        setNewImages([]);
        setPreviewImages([]);
        if (onRecipeAdded) onRecipeAdded();
        if (onCloseForm) onCloseForm();
      }

    } catch (err) {
      setError(err.message || "Fehler beim Speichern.");
    }
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const handleImageReplace = async (oldImageName, newFile) => {
    if (!newFile) return;

    const formData = new FormData();
    formData.append("newImage", newFile);

    try {
      const response = await fetch(`http://backend-api.com:3001/api/recipes/${initialData.id}/images/${oldImageName}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Fehler beim Ersetzen.");

      const newImageName = data.newImageName;
      setExistingImages(prev => prev.map(img => (img === oldImageName ? newImageName : img)));
    } catch (err) {
      alert(err.message);
    }
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  
  const handleNewImageUpload = (files) => {
    const fileArray = Array.from(files);
    setNewImages(prev => [...prev, ...fileArray]);
    const newPreviews = fileArray.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviews]);
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  return (
    <Form onSubmit={handleSubmit} className="recipe-form">
      <ConfirmModal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setSelectedImageToDelete(null);
          setPreviewIndexToDelete(null);
        }}
        title="Bild löschen"
        body="Möchtest du dieses Bild wirklich löschen?"
        confirmText="Ja, löschen"
        loading={deleteLoading}
        onConfirm={async () => {
          setDeleteLoading(true);
          try {
            if (selectedImageToDelete) {
              const response = await fetch(`http://backend-api.com:3001/api/recipes/${initialData.id}/images/${selectedImageToDelete}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
              });

              if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Fehler beim Löschen.");
              }

              setExistingImages(prev => prev.filter(img => img !== selectedImageToDelete));
            } else if (previewIndexToDelete !== null) {
              setNewImages(prev => prev.filter((_, i) => i !== previewIndexToDelete));
              setPreviewImages(prev => prev.filter((_, i) => i !== previewIndexToDelete));
            }
          } catch (err) {
            alert(err.message);
          } finally {
            setDeleteLoading(false);
            setShowDeleteModal(false);
            setSelectedImageToDelete(null);
            setPreviewIndexToDelete(null);
          }
        }}
      />

      <h4 className="mb-3">{mode === "edit" ? "bearbeiten" : "Neues hinzufügen"}</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form.Group className="mb-3">
        <Form.Label style={{fontSize:"24px",padding:"20px"}}>Bilder</Form.Label>
        <div className="d-flex flex-wrap gap-3">
          {existingImages.map((img, idx) => (
            <div key={idx} style={{ position: "relative" }}>
              <img
                src={`http://backend-api.com:3001/uploads/${img}`}
                alt={`img-${idx}`}
                style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px", border: "1px solid #ccc" }}
              />
              <Button
                variant="light"
                size="sm"
                onClick={() => {
                  setSelectedImageToDelete(img);
                  setShowDeleteModal(true);
                }}
                style={{ position: "absolute", top: "5px", right: "5px", borderRadius: "50%", width: "28px", height: "28px", padding: 0 }}>
                ❌
              </Button>
              <Button
                variant="light"
                size="sm"
                onClick={() => document.getElementById(`replace-${img}`).click()}
                style={{ position: "absolute", top: "5px", left: "5px", borderRadius: "50%", width: "28px", height: "28px", padding: 0 }}>
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

          {previewImages.map((src, idx) => (
            <div key={`preview-${idx}`} style={{ position: "relative" }}>
              <img
                src={src}
                alt={`preview-${idx}`}
                style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px", border: "1px solid #ccc" }}
              />
              <Button
                variant="light"
                size="sm"
                onClick={() => {
                  setPreviewIndexToDelete(idx);
                  setShowDeleteModal(true);
                }}
                style={{ position: "absolute", top: "5px", right: "5px", borderRadius: "50%", width: "28px", height: "28px", padding: 0 }}>
                ❌
              </Button>
            </div>
          ))}

          <div
            className="image-upload"
            onClick={() => document.getElementById("new-image-upload").click()}
          >
            <img
              src="/default-add-image.png"
              alt="add-new"
              style={{ width: "60%", height: "60%", objectFit: "contain", opacity: 0.6 }}
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
      </Form.Group>

      <Form.Group controlId="is_public" className="mb-3">
        <div className="visibility-row">
          <Form.Label className="visibility-label">Sichtbarkeit:</Form.Label>
          <div className="toggle-switch">
            <label className="switch">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={() => setIsPublic(!isPublic)}
              />
              <span className="slider"></span>
            </label>
            <span className="label-text">{isPublic ? "Öffentlich" : "Privat"}</span>
          </div>
        </div>
      </Form.Group>

      <div className="form-row-3">
        <Form.Group className="flex-item">
          <Form.Label>Kategorie</Form.Label>
          <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Bitte wählen</option>
            <option value="breakfast">Frühstück</option>
            <option value="lunch">Mittagessen</option>
            <option value="dinner">Abendessen</option>
            <option value="dessert">Desserts</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="flex-item">
          <Form.Label>Zubereitungszeit (in Minuten)</Form.Label>
          <Form.Control
            type="number"
            min="1"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="z.B. 20"
          />
        </Form.Group>

        <Form.Group className="flex-item">
          <Form.Label>Schwierigkeit</Form.Label>
          <Form.Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="">Bitte wählen</option>
            <option value="easy">Einfach</option>
            <option value="medium">Mittel</option>
            <option value="hard">Schwer</option>
          </Form.Select>
        </Form.Group>
      </div>


      <Form.Group className="mb-3">
        <Form.Label>Titel</Form.Label>
        <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Zutaten</Form.Label>
        <Form.Control as="textarea" rows={2} value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Schritte</Form.Label>
        <Form.Control as="textarea" rows={3} value={steps} onChange={(e) => setSteps(e.target.value)} />
      </Form.Group>

            
      <Button
        variant="warning"
        type="submit"
        className="custom-nav-link"
        style={{ 
              alignContent: "center",
              marginTop:"5rem",
            }}
      >
        {mode === "edit" ? "Speichern" : "Veröffentlichen"}
      </Button>
    </Form>
  );
}

//--------------------------------------------------------------------------

export default RecipeForm;