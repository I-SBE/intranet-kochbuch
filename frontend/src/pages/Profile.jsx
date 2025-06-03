import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ProfileHeader from "../components/profile/ProfileHeader";
import ToggleFormButton from "../components/profile/ToggleFormButton";
import RecipeList from "../components/profile/RecipeList";
import ProfileSpinnerOrError from "../components/profile/ProfileSpinnerOrError";

import { fetchUserProfile } from "../api-services/auth";
import RecipeForm from "../components/recipe/RecipeForm";
import CustomModal from "../components/ConfirmModal";

import "../styles/Profile.css";

//--------------------------------------------------------------------------

function Profile() {
  
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recipeError, setRecipeError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [totalRecipes, setTotalRecipes] = useState(0);
  const [publicCount, setPublicCount] = useState(0);
  const [privateCount, setPrivateCount] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [favoritesError, setFavoritesError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState("");

  const navigate = useNavigate();

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
      const fetchedRecipes = Array.isArray(data.recipes) ? data.recipes : [];

      const total = fetchedRecipes.length;
      const publicR = fetchedRecipes.filter(r => r.is_public === true || r.is_public === 1).length;
      const privateR = total - publicR;

      setRecipes(fetchedRecipes);
      setTotalRecipes(total);
      setPublicCount(publicR);
      setPrivateCount(privateR);
      
    } catch (err) {
      console.error("Fehler beim Laden der Rezepte:", err);
      setRecipeError("Fehler beim Laden deiner Rezepte.");
    }
  };

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
    fetchFavorites();
  }, []);


  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://backend-api.com:3001/api/recipes/favorites", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Fehler beim Laden der Favoriten.");
      }

      const data = await response.json();
      setFavorites(Array.isArray(data.favorites) ? data.favorites : []);
      
    } catch (err) {
      console.error("Fehler beim Laden der Favoriten:", err);
      setFavoritesError("Fehler beim Laden deiner Favoriten.");
    }
  };

  const handleFavoriteAdded = (recipe) => {
    setToastText(`"${recipe.title}" wurde zu Favoriten hinzugefügt!`);
    setShowToast(true);
    fetchFavorites();
  };


  return (
    <ProfileSpinnerOrError loading={loading} error={error}>
      <div className="profile-page" style={{ marginTop: "100px" }}>
        <div className="centered-content">
          <CustomModal
            show={showToast}
            onHide={() => setShowToast(false)}
            title="Erfolg"
            body={toastText}
            onConfirm={() => setShowToast(false)}
            confirmText="OK"
          />
          <ProfileHeader
            user={user}
            totalRecipes={totalRecipes}
            publicCount={publicCount}
            privateCount={privateCount}
          />
          
          <ToggleFormButton showForm={showForm} toggleForm={() => setShowForm(!showForm)} />
  
          {showForm && <RecipeForm onRecipeAdded={fetchUserRecipes} />}

          <h4 className="mb-3" style={{ marginTop: "3rem" }}>Meine Rezepte</h4>
          <hr className="profile-divider" />
        </div>

        <RecipeList
          recipes={recipes}
          recipeError={recipeError}
          onRefresh={fetchUserRecipes}
          favorites={favorites}
          onFavoriteAdded={handleFavoriteAdded}
        />

        <hr className="profile-divider" />

        <div className="centered-content">
          <h4 className="mb-3" style={{ marginTop: "3rem" }}>Meine Favoriten</h4>
          <hr className="profile-divider" />
        </div>

        <RecipeList
          recipes={favorites}
          recipeError={favoritesError}
          favorites={favorites}
          onFavoriteAdded={handleFavoriteAdded}
        />
      </div>
    </ProfileSpinnerOrError>
  );
}

//--------------------------------------------------------------------------

export default Profile;