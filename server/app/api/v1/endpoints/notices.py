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
