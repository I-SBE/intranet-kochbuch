import { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";

//--------------------------------------------------------------------------

function RecipeForm({ onRecipeAdded }) {
    
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title || !ingredients || !steps) {
      setError("Bitte alle Felder ausfüllen.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("ingredients", ingredients);
    formData.append("steps", steps);
    if (image) formData.append("image", image);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://backend-api.com:3001/api/recipes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Fehler beim Speichern der Rezept.");
      }

      setSuccess("Rezept erfolgreich gespeichert!");
      setTitle("");
      setIngredients("");
      setSteps("");
      setImage(null);
      if (onRecipeAdded) onRecipeAdded();

    } catch (err) {
      console.error(err);
      setError(err.message || "Fehler beim Speichern.");
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-5">
      <h4 className="mb-3">➕ Neues Rezept hinzufügen</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form.Group className="mb-3">
      <Form.Label>Bild (optional)</Form.Label>
      <Form.Control
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />
      </Form.Group>

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

      <Button variant="primary" type="submit">Post</Button>
    </Form>
  );
}

export default RecipeForm;