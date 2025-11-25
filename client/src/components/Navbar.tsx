import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="text-xl font-bold text-blue-600 tracking-tight">
          Tender<span className="text-gray-800">Analyser</span>
        </div>
        <div className="flex gap-6 text-sm font-medium text-gray-600">
          <Link to="/" className="hover:text-blue-600 transition">
            Live Search
          </Link>
          <Link to="/saved" className="hover:text-blue-600 transition">
            Saved Database
          </Link>
          <Link
            to="/stats"
            className="hover:text-blue-600 transition text-purple-600"
          >
            Analysis
          </Link>
        </div>
      </div>
    </nav>
  );
}
