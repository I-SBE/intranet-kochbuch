import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from "react-router-dom";
import {Navbar, Nav, Container} from 'react-bootstrap';
import { useEffect, useState } from 'react';

//--------------------------------------------------------------------------

import 'bootstrap/dist/css/bootstrap.min.css';

//--------------------------------------------------------------------------

import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import RecipeGallery from './pages/RecipeGallery';
import RecipeDetails from './pages/RecipeDetails';
import EditRecipe from "./pages/EditRecipe";
import EditProfile from "./pages/EditProfile";
import About from "./pages/About.jsx";
import Kontakt from "./pages/Kontakt.jsx";

//--------------------------------------------------------------------------

import './App.css'

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const navigate = useNavigate();

  const handleLogin = (token) => {
    localStorage.setItem("token", token);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <>
      <Navbar expand="lg" className="bg-body-tertiary fixed-top">
        <Container>
          <Navbar.Brand as={Link} to="/">Recipes</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Recipes</Nav.Link>
              {isLoggedIn ? (
                <>
                  <Nav.Link as={Link} to="/profile">Profil</Nav.Link>
                  <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login">Login</Nav.Link>
                  <Nav.Link as={Link} to="/register">Register</Nav.Link>
                </>
              )}
              
              <Nav.Link as={Link} to="/about">About</Nav.Link>
              <Nav.Link as={Link} to="/kontakt">Kontakt</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Routes>
        <Route path="/" element={<RecipeGallery />} />
        <Route path="/recipe/:id" element={<RecipeDetails />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-recipe/:id" element={<EditRecipe />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/about" element={<About />} />
        <Route path="/kontakt" element={<Kontakt />} />
      </Routes>
    </>
  );
}

//--------------------------------------------------------------------------

export default App
