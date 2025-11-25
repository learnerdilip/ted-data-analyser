import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NoticesTable from "./components/NoticesTable"; // Or your NoticesPage

// Simple Navbar
function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="text-xl font-bold text-blue-600 tracking-tight">
          Tender<span className="text-gray-800">Watch</span>
        </div>
        <div className="flex gap-6 text-sm font-medium text-gray-600">
          <Link to="/" className="hover:text-blue-600 transition">
            Live Search (Home)
          </Link>
          <Link to="/saved" className="hover:text-blue-600 transition">
            Saved Database
          </Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 font-sans">
        <Navbar />

        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route
            path="/saved"
            element={
              <div className="container mx-auto p-6">
                <NoticesTable />
              </div>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
