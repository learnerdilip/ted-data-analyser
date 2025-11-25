// client/src/components/NoticeCard.tsx
import type { Notice } from "../types";

interface NoticeCardProps {
  notice: Notice;
}

export default function NoticeCard({ notice }: NoticeCardProps) {
  // Helper to format dates nicely
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper to format currency
  const formatCurrency = (amount?: number, currency?: string) => {
    if (!amount) return null;
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency: currency || "EUR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTedLink = (notice: Notice): string | undefined => {
    if (!notice.links?.html) return undefined;
    return (
      notice.links.html["ENG"] ||
      notice.links.html["DEU"] ||
      Object.values(notice.links.html)[0]
    );
  };

  // Helper to extract text from TED's complex multi-language objects
  const getTedText = (field, lang = "eng") => {
    if (!field) return "N/A";

    // Case 1: It's a simple array ["DEU"] -> return "DEU"
    if (Array.isArray(field)) {
      return field[0] || "N/A";
    }

    // Case 2: It's a multilingual object
    if (typeof field === "object") {
      // Try preferred language, then fallback to English, then German, then just the first one found
      const val =
        field[lang] || field["eng"] || field["deu"] || Object.values(field)[0];

      // Sometimes the value inside the language key is ALSO an array ["Name"]
      if (Array.isArray(val)) {
        return val[0];
      }
      return val || "N/A";
    }

    // Case 3: It's just a string
    return field;
  };

  const cumulativeTenderValue = (vals?: number[]) => {
    if (!vals) {
      return 0;
    }
    return vals.reduce((prev: number, curr: number) => curr + prev, 0);
  };

  const title = getTedText(notice["notice-title"]) || "No Title Available";
  const description = getTedText(notice["BT-24-Procedure"]) || "No description";
  const country = notice["organisation-country-buyer"]?.[0] || "EU";
  const buyer =
    getTedText(notice["organisation-name-buyer"]) || "Unknown Buyer";
  const date = notice["publication-date"]?.substring(10);
  const value = formatCurrency(
    cumulativeTenderValue(notice["B-27-Procedure"]),
    notice["tender-value-cur"]
  );
  const winner = getTedText(notice["winner-name"]);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      {/* Card Header with Country Flag/Code & Date */}
      <div className="bg-gray-50 px-4 py-2 flex justify-between items-center border-b border-gray-100">
        <span
          className={`text-xs font-bold px-2 py-1 rounded-full ${
            country === "DEU"
              ? "bg-yellow-100 text-yellow-800"
              : country === "POL"
              ? "bg-red-100 text-red-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {country}
        </span>
        <span className="text-xs text-gray-500">{date}</span>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-grow flex flex-col gap-3">
        <h3
          className="font-semibold text-gray-900 text-sm line-clamp-2"
          title={title}
        >
          {title}
        </h3>

        <div className="text-sm text-gray-600 truncate">
          <span className="font-medium">Buyer:</span> {buyer}
        </div>

        <div className="mt-auto pt-3 border-t border-gray-100 flex flex-col gap-1">
          {value && (
            <div className="text-lg font-bold text-emerald-700">{value}</div>
          )}
          {winner && (
            <div className="text-xs text-gray-500 truncate">
              <span className="font-medium text-gray-700">Winner:</span>{" "}
              {winner}
            </div>
          )}
        </div>
        {getTedLink(notice) && (
          <a
            href={getTedLink(notice)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 w-full block text-center bg-gray-50 hover:bg-blue-50 text-blue-600 text-xs font-semibold py-2 rounded border border-gray-200 hover:border-blue-200 transition-colors"
          >
            View Official Notice ↗
          </a>
        )}
      </div>

      {/* Footer / ID */}
      <div className="bg-gray-50 px-4 py-1 text-[10px] text-gray-400 text-right">
        ID: {notice["publication-number"]}
      </div>
    </div>
  );
}
