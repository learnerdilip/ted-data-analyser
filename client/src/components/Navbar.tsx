import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav
      style={{
        padding: "1rem",
        borderBottom: "1px solid #ccc",
        marginBottom: "1rem",
      }}
    >
      <Link to="/" style={{ marginRight: "1rem" }}>
        Home
      </Link>
      <Link to="/notices">TED Notices</Link>
      <Link
        to="/stats"
        className="hover:text-blue-600 transition text-purple-600"
      >
        Analysis
      </Link>{" "}
    </nav>
  );
}
