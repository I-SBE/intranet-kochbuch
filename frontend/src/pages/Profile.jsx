import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";

import ProfileHeader from "../components/Profile/ProfileHeader";
import ToggleFormButton from "../components/Profile/ToggleFormButton";
import RecipeList from "../components/Profile/RecipeList";
import ProfileSpinnerOrError from "../components/Profile/ProfileSpinnerOrError";

import { fetchUserProfile } from "../api-services/auth";
import RecipeForm from "../components/RecipeForm";

import "./css/Profile.css";

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

  const navigate = useNavigate();

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
  }, []);

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 return (
    <ProfileSpinnerOrError loading={loading} error={error}>
      <Container style={{ marginTop: "100px" }}>
        <ProfileHeader
          user={user}
          totalRecipes={totalRecipes}
          publicCount={publicCount}
          privateCount={privateCount}
        />

        <ToggleFormButton showForm={showForm} toggleForm={() => setShowForm(!showForm)} />

        {showForm && <RecipeForm onRecipeAdded={fetchUserRecipes} />}

        <hr className="profile-divider" />

        <h4 className="mb-3" style={{ marginTop: "3rem" }} >Meine Rezepte</h4>

          <RecipeList
            recipes={recipes}
            recipeError={recipeError}
            onRefresh={fetchUserRecipes}
          />

      </Container>
    </ProfileSpinnerOrError>
  );
}

//--------------------------------------------------------------------------

export default Profile;
