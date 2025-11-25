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
  _search_term?: string;
}

interface ApiResponse {
  data: Notice[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

const NoticesTable = () => {
  const [data, setData] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch data with pagination
        const res = await fetch(
          `http://localhost:8000/api/v1/notices?page=${page}&size=${pageSize}`
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
  }, [page]); // Re-run when 'page' changes

  const safeRender = (value: any): string => {
    if (value === null || value === undefined) return "-";

    // If it's a simple string or number, return it
    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }

    // If it's an array (e.g. ["DEU", "POL"]), join them
    if (Array.isArray(value)) {
      return value.map((v) => safeRender(v)).join(", ");
    }

    // If it's an object (the cause of your error), try to grab the text
    if (typeof value === "object") {
      // Check for common language keys
      if (value.eng) return value.eng; // English
      if (value.deu) return value.deu; // German
      // If no specific language, just take the first value found
      const values = Object.values(value);
      if (values.length > 0) return String(values[0]);
    }

    return JSON.stringify(value); // Fallback: show raw JSON so we can debug
  };

  // Helper to format currency
  const formatCurrency = (amount?: number, currency?: string) => {
    console.log(amount, currency);

    if (!amount) return "-";
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency: currency || "EUR",
    }).format(amount);
  };
  console.log(data);

  return (
    <div className="w-full">
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            TED Tender Notices
          </h2>
          <p className="text-sm text-gray-500">Live data from MongoDB</p>
        </div>

        {/* The Table */}
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
                <th className="px-6 py-3">Winner decision date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading
                ? // Loading Skeleton
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                : data.map((notice) => (
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
                        {safeRender(notice["organisation-country-buyer"])}
                      </td>

                      <td className="px-6 py-4 truncate max-w-xs">
                        {safeRender(notice["organisation-name-buyer"])}
                      </td>

                      <td className="px-6 py-4 text-right font-mono text-gray-900">
                        {formatCurrency(
                          notice["BT-27-Procedure"],
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
                  ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Page <span className="font-semibold">{page}</span> of {totalPages}
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
              disabled={page === totalPages || loading}
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
