import httpx
from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional

router = APIRouter()

TED_API_URL = "https://api.ted.europa.eu/v3/notices/search"

# The specific fields your Frontend needs
REQUEST_FIELDS = [
    "publication-number",
    "buyer-country-sub",
    "organisation-country-buyer",
    "classification-cpv",
    "issue-date",
    "winner-decision-date",
    "organisation-name-buyer",
    "tender-value",
    "tender-value-cur",
    "winner-name",
    "title-part",
    "contract-duration-start-date-lot",
    "contract-duration-end-date-lot",
    "BT-27-Procedure",
    "BT-24-Procedure",
    "notice-title",
    "BT-137-Part",
    "BT-137-Lot",
    "publication-date",
]


def build_ted_query(
    search_text: Optional[str],
    countries: Optional[List[str]],
    cpv_codes: Optional[List[str]],
    winner_name: Optional[str],
    currency: str = "EUR",
) -> str:
    """
    Constructs the TED API Query String dynamically based on inputs.
    """
    clauses = []

    if search_text:
        clauses.append(f"FT ~ {search_text}")

    if countries:
        # We assume the API expects OR for multiple countries
        joined_countries = " OR ".join(countries)
        clauses.append(f"buyer-country=({joined_countries})")

    # Example: classification-cpv IN (33690000, 12345678)
    if cpv_codes:
        joined_cpvs = ", ".join(cpv_codes)
        clauses.append(f"classification-cpv IN ({joined_cpvs})")

    # 4. Winning Supplier
    if winner_name:
        clauses.append(f'winner-name ~ "{winner_name}"')

    # Default fallback if no filters provided (to avoid empty query error)
    if not clauses:
        return "FT ~ Abiraterone"

    # Combine all clauses with AND
    full_query = " AND ".join(clauses)

    # Always append Sort
    full_query += " SORT BY publication-number DESC"

    return full_query


@router.get("/search")
async def search_live_ted(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    # Filters
    q: Optional[str] = Query(
        None, alias="search_text", description="Product or keyword"
    ),
    country: Optional[List[str]] = Query(None, alias="country"),
    cpv: Optional[List[str]] = Query(None),
    winner: Optional[str] = Query(None, description="Filter by winner name"),
):
    # 1. Build Query
    ted_query_string = build_ted_query(
        search_text=q, countries=country, cpv_codes=cpv, winner_name=winner
    )

    # Debug print to server logs (so you can see what is being sent)
    print(f"Generated TED Query: {ted_query_string}")

    # 2. Prepare Payload
    payload = {
        "query": ted_query_string,
        "fields": REQUEST_FIELDS,
        "page": page,
        "limit": size,
        "scope": "ACTIVE",
        "checkQuerySyntax": False,
        "paginationMode": "PAGE_NUMBER",
        "onlyLatestVersions": False,
    }

    # 3. Execute Request
    async with httpx.AsyncClient(timeout=20.0) as client:
        try:
            response = await client.post(TED_API_URL, json=payload)
            response.raise_for_status()
            data = response.json()
        except httpx.HTTPStatusError as e:
            # Pass the upstream error detail to the frontend for easier debugging
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"TED API Error: {e.response.text}",
            )
        except Exception as e:
            print(f"Internal Error: {e}")
            raise HTTPException(status_code=500, detail="Failed to connect to TED API")

    # 4. Transform Data (map the TED response to match your Frontend's expected format)
    results = data.get("notices", [])
    total_count = data.get("total", 0)

    # Calculate pages
    import math

    total_pages = math.ceil(total_count / size) if size > 0 else 0

    # Add a temporary _id for React keys (using publication number)
    for item in results:
        item["_id"] = item.get("publication-number")
        # Inject the search term for UI highlighting if available
        if q:
            item["_search_term"] = q

    return {
        "data": results,
        "total": total_count,
        "page": page,
        "size": size,
        "total_pages": total_pages,
    }
