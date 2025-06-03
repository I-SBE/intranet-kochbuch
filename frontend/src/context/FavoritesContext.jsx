import { createContext, useContext, useState, useEffect } from "react";

//--------------------------------------------------------

const FavoritesContext = createContext();

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://backend-api.com:3001/api/recipes/favorites", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data.favorites)) setFavorites(data.favorites);
    } catch (err) {
      console.error("Fehler beim Laden der Favoriten:", err);
    } finally {
      setLoading(false);
    }
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const handleFavoriteAdded = (recipe) => {
    setFavorites((prev) => [...prev, recipe]);
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const handleFavoriteDeleted = (recipe) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== recipe.id));
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  useEffect(() => {
    fetchFavorites();
  }, []);

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  return (
    <FavoritesContext.Provider
      value={{ favorites, handleFavoriteAdded, handleFavoriteDeleted, refreshFavorites: fetchFavorites, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
};

//--------------------------------------------------------

export const useFavorites = () => useContext(FavoritesContext);