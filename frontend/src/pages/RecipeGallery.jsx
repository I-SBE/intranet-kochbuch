import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner, Alert, Row } from "react-bootstrap";

import RecipeCard from "../components/RecipeCard";

import "./css/RecipeGallery.css"

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
      .then(data => {
        const publicRecipes = data.filter(recipe => recipe.is_public === true || recipe.is_public === 1);
        setRecipes(publicRecipes);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  if (loading) return <Spinner animation="border" className="mt-5" />;
  if (error) return <Alert variant="danger" className="mt-5">{error}</Alert>;

  return (
    <Row>
      <div className="gallery-page">
        <h1 className="gallery-title">Rezept-Galerie</h1>
        <hr className="title-divider" />
        
        <div className="gallery-recipes-grid">
          {recipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </div>
    </Row>
  );
}

//--------------------------------------------------------------------------

export default RecipeGallery;
