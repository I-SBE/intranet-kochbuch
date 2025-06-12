import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

//--------------------------------------------------------

const FavoritesContext = createContext();

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuth();

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const fetchFavorites = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setFavorites([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/recipes/favorites`, {
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
    if (isLoggedIn) fetchFavorites();
    else {
      setFavorites([]);
      setLoading(false);
    }
  }, [isLoggedIn]);

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