import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", {
        state: { message: "Bitte melden Sie sich an, um das Rezept zu sehen." },
      });
      return;
    }

    fetch(`/api/recipes/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
    if (res.status === 401) {
        navigate("/login", {
        state: { message: "Ihre Sitzung ist abgelaufen. Bitte erneut anmelden." },
        });
        return null;
    }
    if (!res.ok) throw new Error("Fehler beim Abrufen des Rezepts.");
    return res.json();
    })
    .then((data) => {
        if (data) setRecipe(data);
    })
    .catch((err) => setError(err.message));
  }, [id, navigate]);

  if (error) {
    return <p className="text-red-500 p-4">{error}</p>;
  }

  if (!recipe) {
    return <p className="p-4">Lade Rezeptdaten...</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">{recipe.title}</h1>
      <p className="text-gray-600 mb-4">ID: {recipe.id}</p>

      <h2 className="text-lg font-semibold mt-4">Zutaten:</h2>
      <p className="mb-4 whitespace-pre-line">{recipe.ingredients}</p>

      <h2 className="text-lg font-semibold mt-4">Zubereitung:</h2>
      <p className="whitespace-pre-line">{recipe.steps}</p>
    </div>
  );
}