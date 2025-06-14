import { BrowserRouter as Router, Link, useNavigate } from "react-router-dom";
import {Navbar, Nav, Container} from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import UserMenu from "./UserMenu";

//--------------------------------------------------------------------------

import { FiLogIn, FiUserPlus, FiLogOut, FiUser } from "react-icons/fi";
import 'bootstrap/dist/css/bootstrap.min.css';

//--------------------------------------------------------------------------


function Header() {

  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const handleLogout = () => {
    logout();
    navigate("/");
  };

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  return (
      <Navbar bg="dark" variant="dark" expand="lg" className="fixed-top shadow-sm">
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <img src="/logo.png" alt="Logo" height="40" className="me-2" />
            <span className="fw-bold">Koch-Buch</span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/" className="custom-nav-link">Startseite</Nav.Link>
              <Nav.Link as={Link} to="/gallery" className="custom-nav-link">Rezept-Galerie</Nav.Link>
              <Nav.Link as={Link} to="/about" className="custom-nav-link">Über-uns</Nav.Link>
              <Nav.Link as={Link} to="/kontakt" className="custom-nav-link">Kontakt</Nav.Link>
            </Nav>

            <Nav className="ms-auto align-items-center">
              {isLoggedIn ? (
                <>
                  <Nav.Link as={Link} to="/profile" className="custom-nav-link" title="Profil" ><UserMenu/><FiUser style={{marginRight:"1rem", marginLeft:"0.5rem"}} /></Nav.Link>
                  <Nav.Link onClick={handleLogout} className="custom-nav-link"style={{backgroundColor: "#7f0000"}}><FiLogOut className="me-1" />Abmelden</Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login" className="custom-nav-link" style={{backgroundColor: "#007f00"}}> <FiLogIn className="me-1" />Anmelden</Nav.Link>
                  <Nav.Link as={Link} to="/register" className="custom-nav-link with-border"><FiUserPlus className="me-1" />Registrieren</Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
  );
}

//--------------------------------------------------------------------------

export default Header;