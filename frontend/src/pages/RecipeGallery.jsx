import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import RecipeCard from "../components/recipe/RecipeCard";
import Sidebar from "../components/layout/Sidebar";
import ProfileSpinnerOrError from "../components/profile/ProfileSpinnerOrError";

import "../styles/RecipeGallery.css";

//--------------------------------------------------------------------------

function RecipeGallery() {

  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const queryParams = new URLSearchParams(location.search);

  const filters = {
    search: queryParams.get("search") || "",
    category: queryParams.get("category") || "",
    duration: queryParams.get("duration") || "",
    difficulty: queryParams.get("difficulty") || ""
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  useEffect(() => {

    const query = new URLSearchParams(filters).toString();
    const url = `/api/recipes${query ? `?${query}` : ""}`;

    setLoading(true);
    fetch(url)
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
  }, [location.search]);

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const handleFilterChange = (newFilters) => {
    const searchParams = new URLSearchParams(newFilters).toString();
    navigate(`/gallery?${searchParams}`);
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  return (
    <ProfileSpinnerOrError loading={loading} error={error}>
      <div className="gallery-page">
        <div className="gallery-layout">
          <div className="sidebar-container">
            <Sidebar onFilterChange={handleFilterChange} />
          </div>

          <div className="content-container">
            <h1 className="gallery-title">Rezept-Galerie</h1>
            <hr className="title-divider" />

            <div className="gallery-recipes-grid">
              {recipes.length > 0 ? (
                recipes.map(recipe => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))
              ) : (
                <p className="no-result">Keine Rezepte gefunden!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProfileSpinnerOrError>
  );
}

//--------------------------------------------------------------------------

export default RecipeGallery;