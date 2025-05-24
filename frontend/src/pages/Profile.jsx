import { useEffect, useState } from "react";
import { Container, Image, Spinner, Alert, Card, Row, Col, Button, Carousel } from "react-bootstrap";

import { fetchUserProfile } from "../api-services/auth";
import RecipeForm from "../components/RecipeForm";

//--------------------------------------------------------------------------

function Profile() {

  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recipeError, setRecipeError] = useState("");
  const [showForm, setShowForm] = useState(false);

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const fetchUserRecipes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://backend-api.com:3001/api/users/my-recipes", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Fehler beim Laden deiner Rezepte.");
      }

      const data = await response.json();
      setRecipes(Array.isArray(data.recipes) ? data.recipes : []);
    } catch (err) {
      console.error("Fehler beim Laden der Rezepte:", err);
      setRecipeError("Fehler beim Laden deiner Rezepte.");
    }
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  useEffect(() => {
    async function fetchUser() {
      try {
        const { ok, data } = await fetchUserProfile();
        if (!ok) throw new Error(data.message);
        setUser(data.user);
      } catch (err) {
        setError(err.message || "Fehler beim Laden des Profils.");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
    fetchUserRecipes();
  }, []);

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  if (loading) return <Spinner animation="border" className="mt-5" />;
  if (error) return <Alert variant="danger" className="mt-5">{error}</Alert>;

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  return (
    <Container style={{ maxWidth: "800px", marginTop: "100px" }}>
      <div className="d-flex align-items-center gap-4 mb-4 border-bottom pb-4">
        <Image
          src={`http://backend-api.com:3001/profile_pics/${user.image_url || "default-profile.png"}`}
          roundedCircle
          width={120}
          height={120}
          style={{ objectFit: "cover" }}
          alt="Profilbild"
        />
        <div>
          <h3>{user.firstName} {user.lastName}</h3>
          <p className="mb-1">{user.email}</p>
          <small className="text-muted">
            Mitglied seit{" "}
            {new Date(user.created_at).toLocaleDateString(
              "de-DE",
              { year: "numeric", month: "long", day: "numeric" }
            )}
          </small>
        </div>
      </div>

      <Button
        variant={showForm ? "outline-danger" : "outline-primary"}
        className="mb-4"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Zurück" : "Rezept veröffentlichen"}
      </Button>

      {showForm && <RecipeForm onRecipeAdded={fetchUserRecipes} />}

      <h4 className="mb-3">Meine Rezepte</h4>
      {recipeError && <Alert variant="warning">{recipeError}</Alert>}
      {Array.isArray(recipes) && recipes.length === 0 ? (
        <p>Du hast noch keine Rezepte veröffentlicht.</p>
      ) : (
        <Row>
          {recipes.map(recipe => (
            <Col md={6} key={recipe.id} className="mb-4">
              <Card>
                {Array.isArray(recipe.images) && recipe.images.length > 0 && (
                  <Carousel interval={null} indicators={recipe.images.length > 1}>
                    {recipe.images.map((img, idx) => (
                      <Carousel.Item key={idx}>
                        <img
                          src={`http://backend-api.com:3001/uploads/${img}`}
                          alt={`Bild ${idx + 1}`}
                          className="d-block w-100"
                          style={{
                            height: "250px",
                            objectFit: "cover",
                            borderTopLeftRadius: "8px",
                            borderTopRightRadius: "8px"
                          }}
                        />
                      </Carousel.Item>
                    ))}
                  </Carousel>
                )}
                <Card.Body>
                  <Card.Title>{recipe.title}</Card.Title>
                  <Card.Text>
                    <strong>Zutaten:</strong><br />
                    {recipe.ingredients}<br /><br />
                    <strong>Schritte:</strong><br />
                    {recipe.steps}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

//--------------------------------------------------------------------------

export default Profile;
