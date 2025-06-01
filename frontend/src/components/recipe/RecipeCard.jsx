import { Card, Button, Carousel } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import { FiHeart, FiEdit, FiArrowRightCircle } from "react-icons/fi";

import "../../styles/RecipeCard.css";

//--------------------------------------------------------------------------

function RecipeCard({ recipe, editable = false, showPrivacy = false, onEdit }) {

  const navigate = useNavigate();
  const isPublic = recipe.is_public === true || recipe.is_public === 1 || recipe.is_public === "true";

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
    <Card className="recipe-card">
      <div className="recipe-image-container">
        {Array.isArray(recipe.images) && recipe.images.length > 1 ? (
          <Carousel interval={null} indicators={recipe.images.length > 1}>
            {recipe.images.map((img, idx) => (
              <Carousel.Item key={idx}>
                <img
                  src={`http://backend-api.com:3001/uploads/${img}`}
                  alt={`Bild ${idx + 1}`}
                  className="recipe-card-image"
                />
              </Carousel.Item>
            ))}
          </Carousel>
        ) : (
          <img
            src={
              Array.isArray(recipe.images) && recipe.images.length > 0
                ? `http://backend-api.com:3001/uploads/${recipe.images[0]}`
                : `http://backend-api.com:3001/uploads/default-recipe.png`
            }
            alt={recipe.title}
            className="recipe-card-image"
          />
        )}

        <Button size="sm" onClick={handleFavorite} className="recipe-fav-btn" title="Zu Favoriten" >
          <FiHeart />
        </Button>


        {editable && (
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (onEdit) onEdit(recipe.id);
            }}
            className="recipe-edit-btn"
            title="Bearbeiten"
          >
            <FiEdit />
          </Button>

        )}
      </div>

      <Card.Body className="recipe-card-body">
        <Card.Title className="recipe-card-title">{recipe.title}</Card.Title>

        <Card.Text className="recipe-card-text text-muted small">
          {recipe.shortDescription || "Leckeres Rezept entdecken!"}
        </Card.Text>

        {showPrivacy && (
          <div className="small mt-1">
            {isPublic
              ? <span style={{ color: "green" }}>🌍 Öffentlich</span>
              : <span style={{ color: "red" }}>🔴 Privat</span>}
          </div>
        )}

        <Button className="recipe-read-btn" onClick={handleNavigate}>
          Mehr lesen <FiArrowRightCircle className="ms-1" />
        </Button>

      </Card.Body>
    </Card>
  );
}

//--------------------------------------------------------------------------

export default RecipeCard;