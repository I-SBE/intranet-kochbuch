import { FaUtensils, FaBookOpen, FaHeart, FaReact, FaDatabase, FaCode, FaUserTie, FaSchool } from "react-icons/fa";

import "../styles/AboutPage.css";

//--------------------------------------------------------------------------

function AboutPage() {

  return (
    <div className="about-page">
      <section className="about-section top-section">
        <div className="about-grid">
          <div className="about-column fade-in-scale">
            <FaUtensils size={48} className="mb-3 text-info" />
            <h5>Warum unsere Rezepte besonders sind</h5>
            <p>Eine breite Auswahl an internationalen und traditionellen Rezepten.</p>
          </div>
          <div className="about-column fade-in-scale">
            <FaBookOpen size={48} className="mb-3 text-warning" />
            <h5>Einfach erklärt</h5>
            <p>Schritt-für-Schritt Anleitung, perfekt für Anfänger und Profis.</p>
          </div>
          <div className="about-column fade-in-scale">
            <FaHeart size={48} className="mb-3 text-success" />
            <h5>Von Nutzern empfohlen</h5>
            <p>Rezepte werden von unserer Community bewertet und geteilt.</p>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      <section className="about-section text-center">
        <h1 className="fade-in-title">Über uns</h1>
        <p className="fs-5 fade-in-scale">
          Willkommen beim <strong>Intranet-Kochbuch</strong>!  
          Diese Anwendung wurde im Rahmen eines Ausbildungsprojekts entwickelt.  
          Sie dient als Plattform, auf der Benutzer ihre Lieblingsrezepte speichern, teilen und entdecken können.
        </p>
        <p className="fs-5 fade-in-scale">
          Ziel dieses Projekts ist es, moderne Webentwicklung mit <strong>React</strong>, <strong>Node.js</strong> und <strong>MariaDB</strong> praktisch umzusetzen.
          Alle Inhalte sind nur innerhalb eines Intranets zugänglich und nicht öffentlich.
        </p>
      </section>

      <hr className="section-divider" />

      <section className="about-section bottom-section">
        <div className="about-grid">
          <div className="about-column fade-in-scale">
            <FaReact size={48} className="mb-3 text-info" />
            <h5>Frontend mit React</h5>
            <p>Moderne Benutzeroberfläche mit Komponenten und Hooks.</p>
          </div>
          <div className="about-column fade-in-scale">
            <FaDatabase size={48} className="mb-3 text-warning" />
            <h5>Datenbank mit MariaDB</h5>
            <p>Sichere Speicherung aller Rezept- und Benutzerdaten.</p>
          </div>
          <div className="about-column fade-in-scale">
            <FaCode size={48} className="mb-3 text-success" />
            <h5>Backend mit Node.js</h5>
            <p>Robuste API mit Express und Authentifizierung mit JWT.</p>
          </div>
        </div>
      </section>

      <div className="text-center pt-4">
        <p className="mb-2">
          <FaUserTie className="me-2" />
          Entwickelt von: <strong>Ihab Sbeih</strong>
        </p>
        <p className="mb-2">
          <FaSchool className="me-2" />
          Ausbildungsstätte: <strong>Comhard GmbH, Berlin</strong>
        </p>
      </div>
    </div>
  );
}

//--------------------------------------------------------------------------

export default AboutPage;