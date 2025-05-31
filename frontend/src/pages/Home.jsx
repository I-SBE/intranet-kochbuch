import { Button, Spinner, Row, Col, Alert } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import RecipeCard from "../components/RecipeCard";
import Sidebar from "../components/Sidebar";

import { FiLogIn, FiUserPlus } from "react-icons/fi";
import "./css/Home.css";

//--------------------------------------------------------------------------

function Home() {

  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  useEffect(() => {
    fetch("/api/recipes")
      .then((res) => {
        if (!res.ok) throw new Error("Fehler beim Abrufen der Rezepte");
        return res.json();
      })
      .then((data) => setRecipes(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );

  if (error)
    return (
      <div className="text-center mt-5">
        <Alert variant="danger">{error}</Alert>
      </div>
    );

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  return (
    <div className="home-page">
      <div className="hero-section text-center text-white d-flex flex-column justify-content-center align-items-center">
        <h1 className="mt-3 display-5">Choose From Thousands of Recipes</h1>
        <input
          type="text"
          placeholder="Search Recipes"
          className="form-control search-box mt-3 mx-auto"
          style={{ maxWidth: "400px" }}
        />
        <div className="mt-3">
          {isLoggedIn ? (
            <p className="text-light">Welcome, {user?.firstName || "Guest"}!</p>
          ) : (
            <>
              <Button
                variant="primary"
                className="custom-nav-link"
                onClick={() => navigate("/register")}
              >
                <FiUserPlus className="me-1" /> Sign Up
              </Button>
              <Button
                variant="outline-light"
                className="custom-nav-link"
                onClick={() => navigate("/login")}
              >
                <FiLogIn className="me-1" /> Login
              </Button>
            </>
          )}
        </div>
      </div>

      <Row className="content-area">
        <Col md={3}>
          <Sidebar />
        </Col>
        <Col md={9}>
          <div className="card-grid">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </Col>
      </Row>
    </div>
  );
}

//--------------------------------------------------------------------------

export default Home;