import { useState, useEffect } from "react";
import { Form, Button, Alert } from "react-bootstrap";

//--------------------------------------------------------------------------

function RecipeForm({ onRecipeAdded, onSubmit, mode = "create", initialData = {} }) {
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setTitle(initialData.title || "");
      setIngredients(initialData.ingredients || "");
      setSteps(initialData.steps || "");
      if (Array.isArray(initialData.images)) {
        const previews = initialData.images.map(img => `http://backend-api.com:3001/uploads/${img}`);
      }
    }
  }, [mode, initialData]);

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title || !ingredients || !steps) {
      setError("Bitte alle Felder ausfüllen.");
      return;
    }

    if (mode === "edit" && onSubmit) {
      const updatedData = { title, ingredients, steps };
      await onSubmit(updatedData);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("ingredients", ingredients);
    formData.append("steps", steps);

    for (let i = 0; i < images.length; i++) {
      formData.append("images", images[i]);
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://backend-api.com:3001/api/recipes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Fehler beim Speichern.");
      }

      setSuccess("Rezept erfolgreich gespeichert!");
      setTitle("");
      setIngredients("");
      setSteps("");
      setImages([]);
      setPreviewImages([]);

      if (onRecipeAdded) onRecipeAdded();

    } catch (err) {
      setError(err.message || "Fehler beim Speichern.");
    }
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  return (
    <Form onSubmit={handleSubmit} className="mb-5">
      <h4 className="mb-3">
        {mode === "edit" ? "bearbeiten" : "Neues hinzufügen"}
      </h4>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {mode === "create" && (
        <Form.Group className="mb-3">
          <Form.Label>Bilder (optional)</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files);
              setImages(files);
              const previews = files.map(file => URL.createObjectURL(file));
              setPreviewImages(previews);
            }}
          />
        </Form.Group>
      )}

      {previewImages.length > 0 && (
        <div className="mb-3 d-flex flex-wrap gap-3">
          {previewImages.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`preview-${idx}`}
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover",
                borderRadius: "8px",
                border: "1px solid #ccc"
              }}
            />
          ))}
        </div>
      )}

      <Form.Group className="mb-3">
        <Form.Label>Titel</Form.Label>
        <Form.Control
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Zutaten</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Schritte</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
        />
      </Form.Group>

      <Button variant="primary" type="submit">
        {mode === "edit" ? "Speichern" : "Veröffentlichen"}
      </Button>

    </Form>
  );
}

//--------------------------------------------------------------------------

export default RecipeForm;