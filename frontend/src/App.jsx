import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Container } from "react-bootstrap";
import { useAuth } from "./context/AuthContext";

//--------------------------------------------------------------------------

import 'bootstrap/dist/css/bootstrap.min.css';

//--------------------------------------------------------------------------

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import RecipeGallery from './pages/RecipeGallery';
import RecipeDetails from './pages/RecipeDetails';
import EditRecipe from "./pages/EditRecipe";
import EditProfile from "./pages/EditProfile";
import About from "./pages/About.jsx";
import Kontakt from "./pages/Kontakt.jsx";
import ChangePass from "./pages/ChangePassword.jsx";
import DeleteAccount from "./pages/DeleteAccount.jsx";
import Header from "./components/Header";
import Footer from "./components/Footer";

//--------------------------------------------------------------------------

import './App.css'

function App() {
  const { login } = useAuth();

  const handleLogin = (token, userData) => {
    localStorage.setItem("token", token);
    login(token, userData);
  };

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  return (
    <>
      <Container fluid>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<RecipeGallery />} />
          <Route path="/recipe/:id" element={<RecipeDetails />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-recipe/:id" element={<EditRecipe />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/about" element={<About />} />
          <Route path="/kontakt" element={<Kontakt />} />
          <Route path="/change-password" element={<ChangePass />} />
          <Route path="/delete-account" element={<DeleteAccount />} />
        </Routes>
        <Footer />
      </Container>
    </>
  );
}

//--------------------------------------------------------------------------

export default App