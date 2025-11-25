// This matches the Pydantic model structure from your backend responses
export interface Notice {
  _id: string; // MongoDB ID
  "publication-number": string;
  "title-part"?: string;
  "buyer-country-sub"?: string;
  "organisation-name-buyer"?: string;
  "organisation-country-buyer"?: string[];
  "publication-date"?: string;
  "tender-value"?: number[];
  "tender-value-cur"?: string;
  "winner-name"?: string;
  _search_term?: string; // Optional field added by ingestion script
  "notice-title"?: String; // The main title
  "BT-24-Procedure"?: String; // The main description
}

// Structure for paginated response
export interface PaginatedApiResponse {
  data: Notice[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}
