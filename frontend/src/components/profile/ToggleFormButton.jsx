import { Button } from "react-bootstrap";
import { FiPlusCircle, FiArrowLeftCircle } from "react-icons/fi";

//--------------------------------------------------------------------------

function ToggleFormButton({ showForm, toggleForm }) {

  return (
    <Button
      className="custom-nav-link with-border"
      style={{marginTop:"3rem", marginBottom: "3rem", padding: "10px 20px", fontSize: "24px"}}
      onClick={toggleForm}
    >
      {showForm ? (
        <>
          <FiArrowLeftCircle className="me-1" />
          Zurück
        </>
      ) : (
        <>
          Rezept
          <FiPlusCircle className="ms-1" />
        </>
      )}
    </Button>
  );
}

//--------------------------------------------------------------------------

export default ToggleFormButton;