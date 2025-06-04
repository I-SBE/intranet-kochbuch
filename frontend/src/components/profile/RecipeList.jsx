import { Alert } from "react-bootstrap";
import RecipeCard from "../recipe/RecipeCard";
import { useNavigate } from "react-router-dom";

//--------------------------------------------------------------------------

function RecipeList({ recipes, recipeError, onRefresh, onFavoriteAdded, favorites = [], onFavoriteDeleted, currentUser }) {

  const navigate = useNavigate();

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  if (recipeError) {
    return <Alert variant="warning">{recipeError}</Alert>;
  }

  if (!Array.isArray(recipes) || recipes.length === 0) {
    return <p className="no-results">Du hast noch keine Rezepte!</p>;
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  return (
    <div className="card-grid">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          editable={recipe.user_id === currentUser?.id}
          showPrivacy={true}
          favorites={favorites}
          onFavoriteAdded={onFavoriteAdded}
          onFavoriteDeleted={onFavoriteDeleted}

          onEdit={(id) => {
            navigate(`/edit-recipe/${id}`);
            onRefresh();
          }}
        />
      ))}
    </div>
  );
}

//--------------------------------------------------------------------------

export default RecipeList;