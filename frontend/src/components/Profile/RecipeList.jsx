import { Alert } from "react-bootstrap";
import RecipeCard from "../RecipeCard";
import { useNavigate } from "react-router-dom";

//--------------------------------------------------------------------------

function RecipeList({ recipes, recipeError, onRefresh }) {

  const navigate = useNavigate();

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  if (recipeError) {
    return <Alert variant="warning">{recipeError}</Alert>;
  }

  if (!Array.isArray(recipes) || recipes.length === 0) {
    return <p>Du hast noch keine Rezepte veröffentlicht.</p>;
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  return (
    <div className="profile-recipes-grid">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          editable={true}
          showPrivacy={true}
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