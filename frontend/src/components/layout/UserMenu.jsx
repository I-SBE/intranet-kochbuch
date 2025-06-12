import { useAuth } from "../../context/AuthContext";
import { Image } from "react-bootstrap";

function UserMenu() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <>
      <Image
        src={`${import.meta.env.VITE_BACKEND_URL}/profile_pics/${user.image_url || "default-profile.png"}`}
        roundedCircle
        height={30}
        width={30}
        alt="User"
        className="me-2 border"
        style={{ objectFit: "cover"}}
      />
      <span>{user.firstName}</span>
    </>
  );
}

export default UserMenu;