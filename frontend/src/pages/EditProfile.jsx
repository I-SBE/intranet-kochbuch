import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";

import "../styles/RecipeForm.css";

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
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/me`, {
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
            setPreview(`${import.meta.env.VITE_BACKEND_URL}/profile_pics/${data.user.image_url}`);
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
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/update-profile`, {
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
    <div className="kontakt-container">
      <div className="kontakt-card">
        <h1>Profil bearbeiten</h1>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="text-center mb-4">
            <label htmlFor="image-upload">
              <div
                className="image-preview"
                style={{
                  backgroundImage: `url(${preview || "/default-profile.png"})`
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
          <div>
            <Button 
              type="submit"
              variant="warning"
              className="w-100 mb-3 custom-nav-link"
              style={{justifyContent:"center", maxWidth:"200px"}}>
              Speichern
            </Button>
          </div>
          <Button 
            variant="outline-secondary"
            className="custom-nav-link"
            onClick={() => navigate("/change-password")}>
            Passwort ändern
          </Button>

          <Button 
            variant="outline-danger"
            className="custom-nav-link"
            style={{background:"red"}}
            onClick={() => navigate("/delete-account")}>
            Konto löschen
          </Button>
        </Form>
      </div>
    </div>
  );
}

//--------------------------------------------------------------------------

export default EditProfile;