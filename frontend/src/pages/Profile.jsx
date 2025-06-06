import { useEffect, useState } from "react";

import ProfileHeader from "../components/profile/ProfileHeader";
import ToggleFormButton from "../components/profile/ToggleFormButton";
import RecipeList from "../components/profile/RecipeList";
import ProfileSpinnerOrError from "../components/profile/ProfileSpinnerOrError";

import { fetchUserProfile } from "../api-services/auth";
import RecipeForm from "../components/recipe/RecipeForm";
import { useFavorites } from "../context/FavoritesContext";

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

  const { favorites, handleFavoriteAdded, handleFavoriteDeleted, refreshFavorites } = useFavorites();

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const fetchUserRecipes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/my-recipes`, {
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
    refreshFavorites();
  }, []);

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  return (
    <ProfileSpinnerOrError loading={loading} error={error}>
      <div className="profile-page" style={{ marginTop: "100px" }}>
        <div className="centered-content">
          <ProfileHeader
            user={user}
            totalRecipes={totalRecipes}
            publicCount={publicCount}
            privateCount={privateCount}
          />

          <ToggleFormButton showForm={showForm} toggleForm={() => setShowForm(!showForm)} />

          {showForm && <RecipeForm onRecipeAdded={fetchUserRecipes} onCloseForm={() => setShowForm(false)}/>}

          <h4 className="mb-3" style={{ marginTop: "3rem" }}>Meine Rezepte</h4>
          <hr className="profile-divider" />
        </div>

        <RecipeList
          recipes={recipes}
          recipeError={recipeError}
          onRefresh={fetchUserRecipes}
          favorites={favorites}
          onFavoriteAdded={handleFavoriteAdded}
          onFavoriteDeleted={handleFavoriteDeleted}
          currentUser={user}
          showPrivacy={true}
        />

        <hr className="profile-divider" />

        <div className="centered-content">
          <h4 className="mb-3" style={{ marginTop: "3rem" }}>Meine Favoriten</h4>
          <hr className="profile-divider" />
        </div>

        <RecipeList
          recipes={favorites}
          recipeError={""}
          favorites={favorites}
          onFavoriteAdded={handleFavoriteAdded}
          onFavoriteDeleted={handleFavoriteDeleted}
          currentUser={user}
          showPrivacy={true}
        />
      </div>
    </ProfileSpinnerOrError>
  );
}

//--------------------------------------------------------------------------

export default Profile;