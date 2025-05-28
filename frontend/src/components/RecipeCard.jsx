import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import "./css/RecipeCard.css";

//--------------------------------------------------------------------------

function RecipeCard({ recipe }) {

  const navigate = useNavigate();

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const handleNavigate = () => {
    navigate(`/recipe/${recipe.id}`);
  };

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const handleFavorite = (e) => {
    e.stopPropagation();
    alert("Zur Favoritenliste hinzugefügt!");
  };

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  return (
    <Card onClick={handleNavigate} className="card">
      <div className="imageContainer">
        <img
          src={
            Array.isArray(recipe.images) && recipe.images.length > 0
              ? `http://backend-api.com:3001/uploads/${recipe.images[0]}`
              : `http://backend-api.com:3001/uploads/default-recipe.png`
          }
          alt={recipe.title}
          className="cardImage"
        />

        <Button onClick={handleFavorite} className="favoriteBtn">
          ❤️
        </Button>
      </div>

      <Card.Body className="bg-transparent">
        <Card.Title className="fw-bold cardTitle">{recipe.title}</Card.Title>
        <Card.Text className="text-muted small">
          {recipe.shortDescription || "Leckeres Rezept entdecken!"}
        </Card.Text>

        <Button variant="outline-dark" size="sm" className="mt-2">
          Mehr lesen
        </Button>
      </Card.Body>
    </Card>
  );
}

//--------------------------------------------------------------------------

export default RecipeCard;