import { Alert } from "react-bootstrap";
import RecipeCard from "../recipe/RecipeCard";
import { useNavigate } from "react-router-dom";

//--------------------------------------------------------------------------

function RecipeList({ recipes, recipeError, onRefresh, onFavoriteAdded, favorites = [] }) {

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
          editable={true}
          showPrivacy={true}
          favorites={favorites}
          onFavoriteAdded={onFavoriteAdded}
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