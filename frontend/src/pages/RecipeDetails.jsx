import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Spinner, Alert, Carousel } from "react-bootstrap";

//--------------------------------------------------------------------------

export default function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState("");

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", {
        state: { message: "Bitte melden Sie sich an, um das Rezept zu sehen." },
      });
      return;
    }

    fetch(`http://backend-api.com:3001/api/recipes/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          navigate("/login", {
            state: { message: "Ihre Sitzung ist abgelaufen. Bitte erneut anmelden." },
          });
          return null;
        }
        if (!res.ok) throw new Error("Fehler beim Abrufen des Rezepts.");
        return res.json();
      })
      .then((data) => {
        if (data) setRecipe(data);
      })
      .catch((err) => setError(err.message));
  }, [id, navigate]);

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  if (error) {
    return <Alert variant="danger" className="mt-4">{error}</Alert>;
  }

  if (!recipe) {
    return <Spinner animation="border" className="mt-4" />;
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  return (
    <Container style={{ maxWidth: "800px", marginTop: "80px" }}>
      <h1 className="mb-3">{recipe.title}</h1>

      {Array.isArray(recipe.images) && recipe.images.length > 0 && (
        <Carousel interval={null} indicators={recipe.images.length > 1} className="mb-4">
          {recipe.images.map((img, idx) => (
            <Carousel.Item key={idx}>
              <img
                src={`http://backend-api.com:3001/uploads/${img}`}
                alt={`Bild ${idx + 1}`}
                className="d-block w-100"
                style={{
                  height: "300px",
                  objectFit: "cover",
                  borderRadius: "8px"
                }}
              />
            </Carousel.Item>
          ))}
        </Carousel>
      )}

      <h5 className="mt-4">Zutaten:</h5>
      <p style={{ whiteSpace: "pre-line" }}>{recipe.ingredients}</p>

      <h5 className="mt-4">Zubereitung:</h5>
      <p style={{ whiteSpace: "pre-line" }}>{recipe.steps}</p>

      <small className="text-muted d-block mt-4">
        Erstellt am: {new Date(recipe.created_at).toLocaleDateString("de-DE")}
      </small>
    </Container>
  );
}