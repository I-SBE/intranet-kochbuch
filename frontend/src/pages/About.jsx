import React from "react";
import { Container } from "react-bootstrap";

//--------------------------------------------------------------------------

function AboutPage() {
  return (
    <Container className="my-5">
      <h1>Über uns</h1>
      <p>
        Willkommen beim <strong>Intranet-Kochbuch</strong>!  
        Diese Anwendung wurde im Rahmen eines Ausbildungsprojekts entwickelt.  
        Sie dient als Plattform, auf der Benutzer ihre Lieblingsrezepte speichern, teilen und entdecken können.
      </p>
      <p>
        Ziel dieses Projekts ist es, moderne Webentwicklung mit React, Node.js und MariaDB praktisch umzusetzen.
        Alle Inhalte sind nur innerhalb eines Intranets zugänglich und nicht öffentlich.
      </p>
      <p>
        Entwickelt von: <strong>Ihab Sbeih</strong>  
        <br />
        Ausbildungsstätte: <strong>Comhard GmbH, Berlin</strong>
      </p>
    </Container>
  );
}

//--------------------------------------------------------------------------

export default AboutPage;