import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Carousel, Button } from "react-bootstrap";

import { fetchUserProfile } from "../api-services/auth";
import ProfileSpinnerOrError from "../components/profile/ProfileSpinnerOrError";
import ConfirmModal from "../components/ConfirmModal";

import { format } from "timeago.js";
import de from "timeago.js/lib/lang/de";
import { register } from "timeago.js";
import { FiEdit2, FiTrash2, FiMessageCircle } from "react-icons/fi";

import "../styles/RecipeDetails.css";

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
  const [loading, setLoading] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/recipes/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetchUserProfile(),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/comments/${id}`, {
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
      } finally {
        setLoading(false);
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
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/comments/${id}`, {
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

  const handleDeleteConfirmed = async () => {
    const token = localStorage.getItem("token");
    if (!selectedCommentId) return;

    setDeleteLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/comments/${selectedCommentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Fehler beim Löschen des Kommentars.");

      setComments((prev) => prev.filter((c) => c.id !== selectedCommentId));
      setSelectedCommentId(null);
      setShowDeleteModal(false);
    } catch (err) {
      alert("Fehler: " + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUpdateComment = async (commentId) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: editedContent }),
      });

      if (!res.ok) throw new Error("Fehler beim Bearbeiten des Kommentars.");

      setComments((prev) =>
        prev.map((c) =>
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

  if (loading || !recipe) {
    return <ProfileSpinnerOrError loading={loading} error={error} />;
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  return (
    <Container className="recipe-container">
      {/* Carousel + Edit Button */}
      <div className="recipe-carousel-wrapper">
        <Carousel className="recipe-carousel" interval={null}>
          {(recipe.images.length > 0 ? recipe.images : ["default-recipe.png"]).map((img, index) => (
            <Carousel.Item key={index}>
              <img
                src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${img}`}
                alt={`Bild ${index + 1}`}
                className="recipe-image"
              />
            </Carousel.Item>
          ))}
        </Carousel>

        {currentUser?.id === recipe.user_id && (
          <Button
            className="edit-btn"
            variant="outline-light"
            onClick={() => navigate(`/edit-recipe/${recipe.id}`)}
          >
            <FiEdit2 />
          </Button>
        )}
      </div>

      <div className="recipe-inner">
        <h1 className="recipe-title">{recipe.title}</h1>

        <div className="recipe-top-section">
          <div className="recipe-ingredients">
            <h5>Zutaten:</h5>
            <p style={{ whiteSpace: "pre-line" }}>{recipe.ingredients}</p>
          </div>

          <div className="recipe-meta-box">
            <h5>Informationen:</h5>
            <p><strong style={{color:"#fd8f00"}}>Kategorie: </strong> {recipe.category || "Nicht angegeben"}</p>
            <p><strong style={{color:"#fd8f00"}}>Dauer:</strong> {recipe.duration ? `${recipe.duration} Minuten` : "Nicht angegeben"}</p>
            <p><strong style={{color:"#fd8f00"}}>Schwierigkeit:</strong> {recipe.difficulty || "Nicht angegeben"}</p>
          </div>
        </div>


        <div className="recipe-steps-section">
          <h5>Zubereitung:</h5>
          <p style={{ whiteSpace: "pre-line" }}>{recipe.steps}</p>
        </div>

        <div className="recipe-date">
          Erstellt am: {new Date(recipe.created_at).toLocaleDateString("de-DE")}
        </div>

        <div className="comment-section mt-4">
          <h4>Kommentare</h4>

          {currentUser && (
            <div className="comment-form mt-3">
              <textarea
                className="form-control mb-2"
                style={{ marginTop: "2rem" }}
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Was möchtest du sagen?"
              />
              {commentError && <div className="text-danger">{commentError}</div>}
              <Button
                onClick={handleSubmitComment}
                className="custom-nav-link d-flex align-items-center gap-2 mt-2"
                variant="outline-light"
              >
                <FiMessageCircle /> Kommentieren
              </Button>
            </div>
          )}

          {comments.length === 0 ? (
            <p className="text-muted mt-3">Noch keine Kommentare.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="comment-box">
                <div className="d-flex align-items-start justify-content-between mb-2">
                  <div className="d-flex align-items-center">
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}/profile_pics/${comment.image_url || "default-profile.png"}`}
                      alt="Profil"
                      className="comment-avatar me-2"
                    />
                    <strong>{comment.firstName} {comment.lastName}</strong>
                  </div>

                  <div className="comment-side ms-auto text-end">
                    <span className="comment-time d-block">
                      {format(comment.created_at, "de")}
                      {comment.updated_at && comment.updated_at !== comment.created_at && (
                        <span className="comment-edited ms-2">(Bearbeitet)</span>
                      )}
                    </span>

                    {currentUser?.id === comment.user_id && (
                      <div className="comment-actions mt-1 d-flex justify-content-end gap-2">
                        <Button
                          variant="link"
                          size="sm"
                          className="text-warning p-0"
                          onClick={() => {
                            setEditingCommentId(comment.id);
                            setEditedContent(comment.content);
                          }}
                        >
                          <FiEdit2 />
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger p-0"
                          onClick={() => {
                            setSelectedCommentId(comment.id);
                            setShowDeleteModal(true);
                          }}
                        >
                          <FiTrash2 />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {editingCommentId === comment.id ? (
                  <div>
                    <textarea
                      className="form-control mb-2"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                    />
                    <div className="d-flex gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleUpdateComment(comment.id)}
                      >
                        Speichern
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingCommentId(null)}
                      >
                        Abbrechen
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>{comment.content}</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmModal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setSelectedCommentId(null);
        }}
        title="Kommentar löschen"
        body="Bist du sicher, dass du diesen Kommentar löschen möchtest?"
        onConfirm={handleDeleteConfirmed}
        confirmText="Löschen"
        loading={deleteLoading}
      />
    </Container>
  );
}

//--------------------------------------------------------------------------

export default RecipeDetails;