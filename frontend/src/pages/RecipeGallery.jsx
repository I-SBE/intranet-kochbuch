import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function RecipeGallery() {
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/recipes')
      .then(res => {
        if (!res.ok) throw new Error('Fehler beim Abrufen der Rezepte');
        return res.json();
      })
      .then(data => setRecipes(data))
      .catch(err => setError(err.message));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Rezept-Galerie</h1>

      {error && <p className="text-red-500">{error}</p>}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipes.map(recipe => (
          <div key={recipe.id} className="border rounded-xl p-4 shadow bg-white">
            <h2 className="text-xl font-semibold">{recipe.title}</h2>
            <p className="text-sm text-gray-600 mt-2">{recipe.ingredients.slice(0, 100)}...</p>
            <Link to={`/recipe/${recipe.id}`} className="text-blue-600 hover:underline mt-2 inline-block">
                Mehr erfahren →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}