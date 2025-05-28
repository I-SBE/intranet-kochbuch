import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Carousel, Container, Row, Col, Spinner, Alert, Button } from "react-bootstrap";

import RecipeCard from "../components/RecipeCard";

//--------------------------------------------------------------------------

function RecipeGallery() {
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  useEffect(() => {
    fetch("/api/recipes")
      .then(res => {
        if (!res.ok) throw new Error("Fehler beim Abrufen der Rezepte");
        return res.json();
      })
      .then(data => setRecipes(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  if (loading) return <Spinner animation="border" className="mt-5" />;
  if (error) return <Alert variant="danger" className="mt-5">{error}</Alert>;

  return (
    <Container style={{ maxWidth: "1200px", marginTop: "50px" }}>
      <h1 className="mb-4 text-center">🧾 Rezept-Galerie</h1>
      <Row>
        {recipes.map(recipe => (
          <Col key={recipe.id} md={6} lg={4}>
            <RecipeCard recipe={recipe} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}

//--------------------------------------------------------------------------

export default RecipeGallery;
