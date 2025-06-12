import { Image, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import "./ProfileHeader.css";
import { FiEdit } from "react-icons/fi";

//--------------------------------------------------------------------------

function ProfileHeader({ user, totalRecipes, publicCount, privateCount }) {

  const navigate = useNavigate();

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  return (
    <div className="profile-header d-flex align-items-center gap-4 mb-4 border-bottom pb-4">
      <Image
        src={`${import.meta.env.VITE_BACKEND_URL}/profile_pics/${user.image_url || "default-profile.png"}`}
        roundedCircle
        alt="Profilbild"
      />

      <div style={{ position: "relative" }}>
        <h3>{user.firstName} {user.lastName}</h3>
        <p className="mb-1">{user.email}</p>
        <small className="text-muted">
          Mitglied seit{" "}
          {new Date(user.created_at).toLocaleDateString("de-DE", {
            year: "numeric",
            month: "long",
            day: "numeric"
          })}
        </small>
      </div>

      <div className="profile-stats mb-4">
        <strong>📊 Deine Rezeptstatistik:</strong><br />
        Gesamt: <span className="text-hell">{totalRecipes}</span> |
        Öffentlich: <span className="text-success">{publicCount}</span> |
        Privat: <span className="text-danger">{privateCount}</span>
      </div>

      <Button
        className="custom-nav-link with-border"
        size="sm"
        onClick={() => navigate("/edit-profile")}
        title="Profil bearbeiten"
      >
        <FiEdit className="me-1" />
      </Button>
    </div>
  );
}

//--------------------------------------------------------------------------

export default ProfileHeader;