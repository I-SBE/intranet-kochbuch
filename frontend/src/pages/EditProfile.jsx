import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";

//--------------------------------------------------------------------------

function EditProfile() {

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    image: null,
  });

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://backend-api.com:3001/api/users/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setFormData({
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            email: data.user.email,
            image: null,
          });
          if (data.user.image_url) {
            setPreview(`http://backend-api.com:3001/profile_pics/${data.user.image_url}`);
          }
        }
      })
      .catch(() => setError("Fehler beim Laden der Profildaten."))
      .finally(() => setLoading(false));
  }, []);

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      setFormData(prev => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const form = new FormData();
    form.append("firstName", formData.firstName);
    form.append("lastName", formData.lastName);
    form.append("email", formData.email);
    if (formData.image) form.append("image", formData.image);

    try {
      const res = await fetch("http://backend-api.com:3001/api/users/update-profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: form
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setSuccess("Profil erfolgreich aktualisiert.");
      setTimeout(() => navigate("/profile"), 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  if (loading) return <Spinner animation="border" className="mt-5" />;

  return (
    <Container style={{ maxWidth: "600px", marginTop: "100px" }}>
      <h2 className="mb-4">Profil bearbeiten</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleSubmit} encType="multipart/form-data">

        <div className="text-center mb-3">
          <label htmlFor="image-upload">
            <div
              className="image-preview"
              style={{
                backgroundImage: `url(${preview || "/default-profile.png"})`,
                width: 100,
                height: 100,
                borderRadius: "50%",
                backgroundSize: "cover",
                backgroundPosition: "center",
                margin: "0 auto"
              }}
            />
          </label>

          <Form.Control
            id="image-upload"
            type="file"
            name="image"
            onChange={handleChange}
            style={{ display: "none" }}
            accept="image/*"
          />
        </div>

        <Form.Group className="mb-3">
          <Form.Label>Vorname</Form.Label>
          <Form.Control
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Nachname</Form.Label>
          <Form.Control
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>E-Mail</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Button type="submit" variant="primary" className="mb-3">
          Speichern
        </Button>
      </Form>
      <div className="d-flex flex-column gap-2">
        <Button className="mb-4" variant="outline-secondary" onClick={() => navigate("/change-password")}>Passwort ändern</Button>
        <Button variant="outline-danger" onClick={() => navigate("/delete-account")}>Konto löschen</Button>
      </div>
    </Container>
  );
}

//--------------------------------------------------------------------------

export default EditProfile;