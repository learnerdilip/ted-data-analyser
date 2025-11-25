import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import NoticesPage from "./pages/NoticesPage";

function App() {
  return (
    <BrowserRouter>
      {/* Navbar is outside Routes so it stays visible on all pages */}
      <Navbar />

      <div style={{ padding: "2rem" }}>
        <Routes>
          {/* Route for Home */}
          <Route path="/" element={<Home />} />

          {/* Route for Notices */}
          <Route path="/notices" element={<NoticesPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
