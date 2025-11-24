import NoticesTable from "./components/NoticesTable";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Market Intelligence
            </h1>
            <p className="text-gray-500 mt-1">
              Tracking medicine tenders across Europe
            </p>
          </div>

          {/* We will wire this button up later if needed */}
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 shadow-sm transition">
            Sync Data
          </button>
        </div>

        {/* The Table Component */}
        <NoticesTable />
      </div>
    </div>
  );
}

export default App;
