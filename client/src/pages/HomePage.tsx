import { useEffect, useState } from "react";
import NoticeCard from "../components/NoticeCard";
import type { Notice, PaginatedApiResponse } from "../types";

// Predefined filters for quick access
const QUICK_COUNTRIES = ["DEU", "POL", "ITA", "HUN", "FRA", "ESP"];
const PRESET_PRODUCTS = ["Abiraterone", "Eplerenone", "Pomalidomide"];

export default function HomePage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 12; // 12 cards fits nicely in 3-col or 4-col grids

  const fetchLiveResults = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Build Query Params
      const params = new URLSearchParams({
        page: page.toString(),
        size: pageSize.toString(),
      });

      // Add Search Text if exists
      if (searchText.trim()) {
        params.append("search_text", searchText);
      }

      // Add Countries (Multi-select support)
      selectedCountries.forEach((c) => params.append("country", c));

      // 2. Call the LIVE API
      const response = await fetch(
        `http://localhost:8000/api/v1/live/search?${params.toString()}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch live data");
      }

      const json: PaginatedApiResponse = await response.json();
      setNotices(json.data);

      setTotalPages(json.total_pages);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedCountries]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset
    fetchLiveResults();
  };

  const toggleCountry = (country: string) => {
    setSelectedCountries((prev) => {
      const isSelected = prev.includes(country);
      if (isSelected) return prev.filter((c) => c !== country);
      return [...prev, country];
    });
    setPage(1);
  };

  const setPresetProduct = (prod: string) => {
    setSearchText(prod);
    setPage(1);
    setTimeout(() => document.getElementById("search-btn")?.click(), 0);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* --- HERO / SEARCH SECTION --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          TED Live Procurement Search
        </h1>

        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="max-w-2xl mx-auto flex gap-2 mb-6"
        >
          <input
            type="text"
            className="flex-grow px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            placeholder="Search products (e.g. Abiraterone)..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button
            id="search-btn"
            type="submit"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
          >
            Search
          </button>
        </form>

        {/* Quick Filters */}
        <div className="flex flex-col gap-4 items-center">
          {/* Preset Products */}
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            <span className="text-gray-400 py-1">Quick Search:</span>
            {PRESET_PRODUCTS.map((prod) => (
              <button
                key={prod}
                onClick={() => setPresetProduct(prod)}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded-full transition"
              >
                {prod}
              </button>
            ))}
          </div>

          {/* Country Toggles */}
          <div className="flex flex-wrap justify-center gap-2">
            {QUICK_COUNTRIES.map((c) => {
              const isActive = selectedCountries.includes(c);
              return (
                <button
                  key={c}
                  onClick={() => toggleCountry(c)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    isActive
                      ? "bg-gray-800 text-white border-gray-800 shadow-md"
                      : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- RESULTS SECTION --- */}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="text-center p-12 bg-red-50 rounded-xl border border-red-100 text-red-600">
          <p className="font-semibold text-lg">Oops! Something went wrong.</p>
          <p>{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && notices.length === 0 && (
        <div className="text-center p-12 text-gray-500">
          No results found. Try adjusting your search filters.
        </div>
      )}

      {/* DATA GRID */}
      {!loading && !error && notices.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {notices.map((notice) => (
              <NoticeCard key={notice._id} notice={notice} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-700"
            >
              Previous
            </button>
            <span className="text-gray-600 text-sm">
              Page <span className="font-bold text-gray-900">{page}</span> of{" "}
              {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-700"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
