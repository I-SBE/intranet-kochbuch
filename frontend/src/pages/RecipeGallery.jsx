import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Carousel, Container, Row, Col, Spinner, Alert, Button } from "react-bootstrap";

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
          <Col md={4} sm={6} xs={12} key={recipe.id} className="mb-4">
            <Card onClick={() => navigate(`/recipe/${recipe.id}`)} style={{ cursor: "pointer" }} >
              <Button
                variant="light"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  alert("Zur Favoritenliste hinzugefügt!");
                }}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  padding: "0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 2
                }}
              >
                ❤️
              </Button>
              {Array.isArray(recipe.images) && recipe.images.length > 0 ? (
                <Carousel interval={null} indicators={false} controls={false} >
                  {recipe.images.map((img, idx) => (
                    <Carousel.Item key={idx}>
                      <img
                        src={`http://backend-api.com:3001/uploads/${img}`}
                        alt={`Bild ${idx + 1}`}
                        className="d-block w-100"
                        style={{
                          height: "auto",
                          objectFit: "cover",
                          borderRadius: "8px"
                        }}
                      />
                    </Carousel.Item>
                  ))}
                </Carousel>
              ) : (
                 <img
                  src={`http://backend-api.com:3001/uploads/default-recipe.png`}
                  alt="default-pic"
                />
              )}
              <Card.Body>
                <Card.Title className="text-center">{recipe.title}</Card.Title>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

//--------------------------------------------------------------------------

export default RecipeGallery;
