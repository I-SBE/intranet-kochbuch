import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Spinner, Alert, Carousel, Button } from "react-bootstrap";

import { fetchUserProfile } from "../api-services/auth";
import ProfileSpinnerOrError from "../components/profile/ProfileSpinnerOrError";

import { format } from "timeago.js";
import de from "timeago.js/lib/lang/de";
import { register } from "timeago.js";

register("de", de);

//--------------------------------------------------------------------------

function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState("");

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", {
        state: { message: "Bitte melden Sie sich an, um das Rezept zu sehen." },
      });
      return;
    }

    const fetchData = async () => {
      try {
        const [recipeRes, userRes, commentsRes] = await Promise.all([
          fetch(`http://backend-api.com:3001/api/recipes/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetchUserProfile(),
          fetch(`http://backend-api.com:3001/api/comments/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!recipeRes.ok) throw new Error("Fehler beim Abrufen des Rezepts.");
        const recipeData = await recipeRes.json();
        setRecipe(recipeData);

        if (userRes.ok) {
          setCurrentUser(userRes.data.user);
        }

        if (!commentsRes.ok) throw new Error("Fehler beim Abrufen der Kommentare.");
        const commentsData = await commentsRes.json();
        setComments(commentsData);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, [id, navigate]);

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

   const handleSubmitComment = async () => {
    const token = localStorage.getItem("token");
    if (!newComment.trim()) {
      setCommentError("Kommentar darf nicht leer sein.");
      return;
    }

    try {
      const res = await fetch(`http://backend-api.com:3001/api/comments/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (!res.ok) throw new Error("Fehler beim Senden des Kommentars.");

      const added = await res.json();
      setComments([added, ...comments]);
      setNewComment("");
      setCommentError("");
    } catch (err) {
      setCommentError(err.message);
    }
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const handleDeleteComment = async (commentId) => {
    const token = localStorage.getItem("token");

    if (!window.confirm("Möchtest du diesen Kommentar wirklich löschen?")) return;

    try {
      const res = await fetch(`http://backend-api.com:3001/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Fehler beim Löschen des Kommentars.");

      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      alert("Fehler: " + err.message);
    }
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const handleUpdateComment = async (commentId) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://backend-api.com:3001/api/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: editedContent })
      });

      if (!res.ok) throw new Error("Fehler beim Bearbeiten des Kommentars.");

      setComments(prev =>
        prev.map(c =>
          c.id === commentId ? { ...c, content: editedContent, updated_at: new Date().toISOString() } : c
        )
      );
      setEditingCommentId(null);
      setEditedContent("");
    } catch (err) {
      alert("Fehler: " + err.message);
    }
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  return (
    <ProfileSpinnerOrError loading={loading} error={error}>
      <Container style={{ maxWidth: "800px", marginTop: "80px" }}>
        <h1 className="mb-3">{recipe.title}</h1>

        {currentUser?.id === recipe.user_id && (
          <div className="d-flex gap-2 mb-3">
            <Button variant="outline-secondary" onClick={() => navigate(`/edit-recipe/${recipe.id}`)}>
              Bearbeiten
            </Button>
          </div>
        )}

        {Array.isArray(recipe.images) && recipe.images.length > 0 ? (
          <Carousel interval={null} indicators={recipe.images.length > 1} className="mb-4">
            {recipe.images.map((img, idx) => (
              <Carousel.Item key={idx}>
                <img
                  src={`http://backend-api.com:3001/uploads/${img}`}
                  alt={`Bild ${idx + 1}`}
                  style={{
                    height: "500px",
                    objectFit: "cover",
                    borderRadius: "8px"
                  }}
                />
              </Carousel.Item>
            ))}
          </Carousel>
        ) : (
          <img
            src={`http://backend-api.com:3001/uploads/default-recipe.png`}
            alt="default-pic"
            style={{
              height: "500px",
              objectFit: "cover",
              borderRadius: "8px"
            }}
          />
        )}

        <h5 className="mt-4">Zutaten:</h5>
        <p style={{ whiteSpace: "pre-line" }}>{recipe.ingredients}</p>

        <h5 className="mt-4">Zubereitung:</h5>
        <p style={{ whiteSpace: "pre-line" }}>{recipe.steps}</p>

        <small className="text-muted d-block mt-4">
          Erstellt am: {new Date(recipe.created_at).toLocaleDateString("de-DE")}
        </small>

        <hr className="my-4" />
        <h4>Kommentare</h4>

        {currentUser && (
          <div className="mb-3">
            <textarea
              className="form-control mb-2"
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Was möchtest du sagen?"
            />
            {commentError && <div className="text-danger">{commentError}</div>}
            <Button onClick={handleSubmitComment}>Kommentieren</Button>
          </div>
        )}

        {comments.length === 0 ? (
          <p className="text-muted">Noch keine Kommentare.</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="border rounded p-2 mb-3">
              <div className="d-flex align-items-center mb-2">
                <img
                  src={`http://backend-api.com:3001/profile_pics/${comment.image_url || "default-profile.png"}`}
                  alt="Profil"
                  className="rounded-circle me-2"
                  style={{ width: "40px", height: "40px", objectFit: "cover" }}
                />
                <strong>{comment.firstName} {comment.lastName}</strong>
                <span className="ms-auto text-muted" style={{ fontSize: "0.8rem" }}>
                  {format(comment.created_at, "de")}
                  {comment.updated_at && comment.updated_at !== comment.created_at && (
                    <span className="text-muted ms-2" style={{ fontSize: "0.75rem" }}>
                      (Bearbeitet)
                    </span>
                  )}
                  {currentUser?.id === comment.user_id && (
                    <>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-warning ms-2 p-0"
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditedContent(comment.content);
                        }}
                      >
                        ✏️
                      </Button>

                      <Button
                        variant="link"
                        size="sm"
                        className="text-danger ms-2 p-0"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        🗑️
                      </Button>
                    </>
                  )}
                </span>
              </div>
              {editingCommentId === comment.id ? (
                <div>
                  <textarea
                    className="form-control mb-2"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                  />
                  <div className="d-flex gap-2">
                    <Button variant="success" size="sm" onClick={() => handleUpdateComment(comment.id)}>Speichern</Button>
                    <Button variant="secondary" size="sm" onClick={() => setEditingCommentId(null)}>Abbrechen</Button>
                  </div>
                </div>
              ) : (
                <div>{comment.content}</div>
              )}
            </div>
          ))
        )}
      </Container>
    </ProfileSpinnerOrError>
  );
}

//--------------------------------------------------------------------------

export default RecipeDetails;