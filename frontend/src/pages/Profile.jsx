import { useEffect, useState } from "react";
import { Container, Image, Spinner, Alert } from "react-bootstrap";
import { fetchUserProfile } from "../api-services/auth";

//--------------------------------------------------------------------------

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  useEffect(() => {
  async function fetchUser() {
      try {
          const { ok, data } = await fetchUserProfile();
          if (!ok) throw new Error(data.message);
          setUser(data.user);
        } catch (err) {
          setError(err.message || "Fehler beim Laden des Profils.");
        } finally {
          setLoading(false);
        }
    }
    fetchUser();
  }, []);

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  if (loading) return <Spinner animation="border" className="mt-5" />;
  if (error) return <Alert variant="danger" className="mt-5">{error}</Alert>;

  return (
    <Container style={{ maxWidth: "800px", marginTop: "100px" }}>
      <div className="d-flex align-items-center gap-4 mb-4 border-bottom pb-4">
        <Image
          src={`http://backend-api.com:3001/profile_pics/${user.image_url || "default-profile.png"}`}
          roundedCircle
          width={120}
          height={120}
          style={{ objectFit: "cover" }}
          alt="Profilbild"
        />
        <div>
          <h3>{user.firstName} {user.lastName}</h3>
          <p className="mb-1">{user.email}</p>
          <small className="text-muted">
            Mitglied seit 
            {new Date(user.created_at).toLocaleDateString(
              'de-DE', 
              {year: 'numeric', month: 'long', day: 'numeric'})
            }
          </small>
        </div>
      </div>
    </Container>
  );
}

//--------------------------------------------------------------------------

export default Profile;
