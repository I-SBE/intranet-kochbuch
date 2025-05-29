import { Modal, Button, Spinner } from "react-bootstrap";

//--------------------------------------------------------------------------

function CustomModal({ show, onHide, title, body, onConfirm, confirmText = "Bestätigen", loading = false }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>{body}</Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={onConfirm} disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

//--------------------------------------------------------------------------

export default CustomModal;
