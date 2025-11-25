import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import NoticesTable from "./components/NoticesTable";
import StatsPage from "./pages/StatsPage";
import Navbar from "./components/Navbar";

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
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
