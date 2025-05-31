import { Spinner, Alert } from "react-bootstrap";

//--------------------------------------------------------------------------

function ProfileSpinnerOrError({ loading, error, children }) {

  if (loading) return <Spinner animation="border" className="mt-5" />;
  if (error) return <Alert variant="danger" className="mt-5">{error}</Alert>;
  return children;
}

//--------------------------------------------------------------------------

export default ProfileSpinnerOrError;