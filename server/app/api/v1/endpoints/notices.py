from fastapi import APIRouter, Query
from typing import List, Optional
from app.core.database import db, settings
from app.models.schemas import PaginatedResponse
import math

router = APIRouter()


@router.get("/")
async def read_notices(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    countries: Optional[List[str]] = Query(None, alias="country"),
    cpv_codes: Optional[List[str]] = Query(None, alias="cpv"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    search_text: Optional[str] = Query(None),
):
    collection = db.client[settings.MONGO_DB_NAME]["ted_notices"]

    query_filter = {}

    if countries:
        query_filter["$or"] = [
            {"buyer-country-sub": {"$in": countries}},
            {"organisation-country-buyer": {"$in": countries}},
        ]

    skip_amount = (page - 1) * size
    cursor = collection.find(query_filter).skip(skip_amount).limit(size)

    notices_data = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        notices_data.append(doc)

    total_records = await collection.count_documents(query_filter)
    total_pages = math.ceil(total_records / size) if size > 0 else 0

    return {
        "data": notices_data,
        "total": total_records,
        "page": page,
        "size": size,
        "total_pages": total_pages,
    }


@router.get("/notices", response_model=PaginatedResponse)
async def get_notices(
    # Pagination
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Items per page"),
    # Filters
    countries: Optional[List[str]] = Query(
        None, alias="country", description="List of country codes e.g. DEU"
    ),
    cpv_codes: Optional[List[str]] = Query(
        None, alias="cpv", description="List of CPV codes"
    ),
    start_date: Optional[str] = Query(None, description="Start Date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End Date (YYYY-MM-DD)"),
    search_text: Optional[str] = Query(
        None, description="Text search in title or description"
    ),
):
    collection = db.client[settings.MONGO_DB_NAME]["ted_notices"]

    # --- 1. Build the Query Object Dynamically ---
    query_filter = {}

    # Filter by Country (Matches if the document's country is IN the provided list)
    # The field name in DB from TED API is usually "buyer-country-sub" or "organisation-country-buyer"
    # We check both just in case, using $or
    if countries:
        query_filter["$or"] = [
            {"buyer-country-sub": {"$in": countries}},
            {"organisation-country-buyer": {"$in": countries}},
        ]

    # Filter by CPV Codes
    if cpv_codes:
        query_filter["classification-cpv"] = {"$in": cpv_codes}

    # Filter by Date Range
    # We assume 'publication-date' is stored as an ISO string "YYYY-MM-DD..."
    date_filter = {}
    if start_date:
        date_filter["$gte"] = start_date  # Greater than or Equal
    if end_date:
        date_filter["$lte"] = end_date  # Less than or Equal

    if date_filter:
        query_filter["publication-date"] = date_filter

    # Text Search (Optional bonus)
    # Allows simple substring match on title
    if search_text:
        query_filter["title-part"] = {
            "$regex": search_text,
            "$options": "i",
        }  # Case insensitive

    # --- 2. execute Query with Pagination ---
    skip_amount = (page - 1) * size

    # Fetch data with the filter applied
    cursor = (
        collection.find(query_filter)
        .sort("publication-date", -1)
        .skip(skip_amount)
        .limit(size)
    )

    # Convert results
    notices_data = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        notices_data.append(doc)

    # --- 3. Get Total Count for THIS filter ---
    # We must count only the documents that match the filter for accurate pagination
    total_records = await collection.count_documents(query_filter)
    total_pages = math.ceil(total_records / size) if size > 0 else 0

    return {
        "data": notices_data,
        "total": total_records,
        "page": page,
        "size": size,
        "total_pages": total_pages,
    }
