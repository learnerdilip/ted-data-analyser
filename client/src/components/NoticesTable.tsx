import { useEffect, useState } from "react";

interface Notice {
  _id: string;
  "publication-number": string;
  "BT-27-Procedure"?: string;
  "tender-value"?: number;
  "organisation-name-buyer"?: string;
  "tender-value-cur"?: string;
  "buyer-country-sub"?: string;
  "publication-date"?: string;
  "winner-decision-date"?: string;
  _search_term?: string;
  "organisation-country-buyer"?: string; // Added to interface for safeRender
}

interface ApiResponse {
  data: Notice[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

// Hardcoded lists based on your project requirements
const PRODUCTS = ["Abiraterone", "Eplerenone", "Pomalidomide"];
const COUNTRIES = ["DEU", "POL", "ITA", "HUN"];

const NoticesTable = () => {
  const [data, setData] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  // Filter State
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const [showWinnerOnly, setShowWinnerOnly] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Construct URL with dynamic query params
        const params = new URLSearchParams({
          page: page.toString(),
          size: pageSize.toString(),
        });

        // Append filters if they exist
        if (selectedCountry) params.append("country", selectedCountry);
        // We map the product selection to 'search_text' so the backend finds it in the title/text
        if (selectedProduct) params.append("search_text", selectedProduct);

        if (showWinnerOnly) params.append("withWinnerOnly", "true");

        const res = await fetch(
          `http://localhost:8000/api/v1/notices?${params.toString()}`
        );
        const json: ApiResponse = await res.json();

        setData(json.data);
        setTotalPages(json.total_pages);
      } catch (error) {
        console.error("Error fetching notices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, selectedProduct, selectedCountry]); // Re-run when these change

  // Handler to toggle filters (Clicking selected button again unselects it)
  const handleProductFilter = (product: string) => {
    setSelectedProduct((prev) => (prev === product ? null : product));
    setPage(1); // Always reset to page 1 on filter change
  };

  const handleCountryFilter = (country: string) => {
    setSelectedCountry((prev) => (prev === country ? null : country));
    setPage(1); // Always reset to page 1 on filter change
  };

  // --- Utility Functions (Unchanged) ---
  const safeRender = (value: any): string => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }
    if (Array.isArray(value)) {
      return value.map((v) => safeRender(v)).join(", ");
    }
    if (typeof value === "object") {
      if (value.eng) return value.eng;
      if (value.deu) return value.deu;
      const values = Object.values(value);
      if (values.length > 0) return String(values[0]);
    }
    return JSON.stringify(value);
  };

  const formatCurrency = (amount?: any, currency?: string) => {
    // Safety check: ensure amount is actually a number before formatting
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount)) return "-";

    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency: currency || "EUR",
    }).format(numAmount);
  };

  const toggleWinnerFilter = () => {
    setShowWinnerOnly((prev) => !prev);
    setPage(1); // Reset to page 1
  };

  return (
    <div className="w-full space-y-4">
      {/* --- Filter Section (New) --- */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between">
          {/* Product Filters */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Filter by Product
            </h3>
            <div className="flex flex-wrap gap-2">
              {PRODUCTS.map((prod) => (
                <button
                  key={prod}
                  onClick={() => handleProductFilter(prod)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    selectedProduct === prod
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {prod}
                </button>
              ))}
            </div>
          </div>

          {/* Country Filters */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Filter by Country
            </h3>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.map((country) => (
                <button
                  key={country}
                  onClick={() => handleCountryFilter(country)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    selectedCountry === country
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500 uppercase">
            Options:
          </h3>

          <button
            onClick={toggleWinnerFilter}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
              showWinnerOnly
                ? "bg-purple-50 text-purple-700 border-purple-200 ring-2 ring-purple-100"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {/* Simple Checkbox Icon */}
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center ${
                showWinnerOnly
                  ? "bg-purple-600 border-purple-600"
                  : "border-gray-400"
              }`}
            >
              {showWinnerOnly && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            Only show awarded contracts
          </button>
        </div>
      </div>

      {/* --- Table Section --- */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              TED Tender Notices
            </h2>
            <p className="text-sm text-gray-500">
              {loading ? "Fetching data..." : `Showing ${data.length} results`}
            </p>
          </div>

          {/* Clear Filters Button (Only shows if filters are active) */}
          {(selectedProduct || selectedCountry) && (
            <button
              onClick={() => {
                setSelectedProduct(null);
                setSelectedCountry(null);
                setPage(1);
              }}
              className="text-xs text-red-600 hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-100 text-xs uppercase font-medium text-gray-500">
              <tr>
                <th className="px-6 py-3">Publication #</th>
                <th className="px-6 py-3">Product (Query)</th>
                <th className="px-6 py-3">Country</th>
                <th className="px-6 py-3">Buyer</th>
                <th className="px-6 py-3 text-right">Tender Value</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Decision date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No results found for these filters.
                  </td>
                </tr>
              ) : (
                data.map((notice) => (
                  <tr
                    key={notice._id}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {safeRender(notice["publication-number"])}
                    </td>

                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {safeRender(notice["_search_term"])}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {safeRender(
                        notice["organisation-country-buyer"] ||
                          notice["buyer-country-sub"]
                      ).substring(0, 3)}
                    </td>

                    <td className="px-6 py-4 truncate max-w-xs">
                      {safeRender(notice["organisation-name-buyer"])}
                    </td>

                    <td className="px-6 py-4 text-right font-mono text-gray-900">
                      {/* Note: Updated logic to use 'tender-value' instead of 'BT-27-Procedure' for currency formatting */}
                      {formatCurrency(
                        notice["tender-value"],
                        notice["tender-value-cur"]
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {String(notice["publication-date"] || "").substring(
                        0,
                        10
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {String(notice["winner-decision-date"] || "").substring(
                        0,
                        10
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Page <span className="font-semibold">{page}</span> of{" "}
            {totalPages || 1}
          </span>
          <div className="space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 text-sm"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading || totalPages === 0}
              className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 text-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticesTable;
