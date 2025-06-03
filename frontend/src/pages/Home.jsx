import { Button } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";

import RecipeCard from "../components/recipe/RecipeCard";
import ProfileSpinnerOrError from "../components/profile/ProfileSpinnerOrError";

import { FiLogIn, FiUserPlus, FiArrowRightCircle } from "react-icons/fi";
import "../styles/Home.css";

//--------------------------------------------------------------------------

function Home() {

  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const { favorites, handleFavoriteAdded, handleFavoriteDeleted } = useFavorites();

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  useEffect(() => {

    fetch("/api/recipes")
      .then((res) => {
        if (!res.ok) throw new Error("Fehler beim Abrufen der Rezepte");
        return res.json();
      })
      .then((data) => setRecipes(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  return (
    <ProfileSpinnerOrError loading={loading} error={error}>
      <div className="home-page">
        <div className="hero-section text-center text-white d-flex flex-column justify-content-center align-items-center">
          <h1 className="mt-3 display-5">Choose From Thousands of Recipes</h1>
          <input
            type="text"
            placeholder="Search Recipes"
            className="form-control search-box mt-3 mx-auto"
            style={{ maxWidth: "400px" }}
          />
          <div className="mt-3">
            {isLoggedIn ? (
              <p className="text-light">Welcome, {user?.firstName || "Guest"}!</p>
            ) : (
              <>
                <Button
                  variant="warning"
                  className="custom-nav-link"
                  onClick={() => navigate("/register")}
                >
                  <FiUserPlus className="me-1" /> Sign Up
                </Button>
                <Button
                  variant="outline-light"
                  className="custom-nav-link"
                  onClick={() => navigate("/login")}
                >
                  <FiLogIn className="me-1" /> Login
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="home-recipes mt-5">
          <h2 className="section-title text-white text-center mb-4">Unsere beliebtesten Rezepte</h2>

          <div className="card-grid px-4">
            {recipes.slice(0, 8).map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                favorites={favorites}
                onFavoriteAdded={handleFavoriteAdded}
                onFavoriteDeleted={handleFavoriteDeleted}/>
            ))}
          </div>

          <div className="text-center mt-4">
            <Button
              variant="warning"
              onClick={() => navigate("/gallery")}
              className="custom-nav-link align-items-center"
            >
              Jetzt alle Rezepte entdecken
              <FiArrowRightCircle className="ms-2" />
            </Button>
          </div>
        </div>

        <div className="info-section mt-5 text-light">
          <h3 className="section-title text-white text-center mb-4">Warum Koch-Buch?</h3>

          <div className="info-grid">
            <div className="info-card text-center">
              <img src="/icons/favorite-icon.png" alt="Favoriten" className="info-icon mb-3" />
              <h5>Rezepte merken</h5>
              <p>Markieren Sie Lieblingsrezepte mit einem Herzsymbol und greifen Sie später schnell darauf zu.</p>
            </div>

            <div className="info-card text-center">
              <img src="icons/add-icon.png" alt="Eigene Rezepte" className="info-icon mb-3" />
              <h5>Eigene Rezepte hochladen</h5>
              <p>Teilen Sie Ihre eigenen Rezepte mit Kolleg:innen im Intranet – einfach & direkt.</p>
            </div>

            <div className="info-card text-center">
              <img src="icons/search-icon.png" alt="Filtern & Suchen" className="info-icon mb-3" />
              <h5>Filtern & Suchen</h5>
              <p>Nutzen Sie die intelligente Suche und Filterfunktionen, um schnell passende Rezepte zu finden.</p>
            </div>
          </div>
        </div>
      </div>
    </ProfileSpinnerOrError>
  );
}

//--------------------------------------------------------------------------

export default Home;