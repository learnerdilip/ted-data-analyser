from fastapi import APIRouter
from app.core.database import db, settings
from typing import List, Any
from collections import defaultdict

router = APIRouter()


@router.get("/trends")
async def get_trends_data():
    """
    Aggregates data to show contract frequency over time per product.
    """
    collection = db.client[settings.MONGO_DB_NAME]["ted_notices"]

    pipeline = [
        # 1. Filter
        {
            "$match": {
                "publication-date": {"$exists": True},
                "_search_term": {"$exists": True},
            }
        },
        # 2. Project
        {
            "$project": {
                # FIX: Access directly as string. Do NOT use $arrayElemAt here.
                "date_str": "$publication-date",
                "product": "$_search_term",
            }
        },
        # 3. Project Month (Extract "YYYY-MM" from "YYYY-MM-DD...")
        {
            "$project": {
                "month": {"$substr": ["$date_str", 0, 7]},
                "product": "$product",
            }
        },
        # 4. Group
        {
            "$group": {
                "_id": {"month": "$month", "product": "$product"},
                "count": {"$sum": 1},
            }
        },
        # 5. Sort
        {"$sort": {"_id.month": 1}},
    ]

    # Execute
    try:
        raw_data = await collection.aggregate(pipeline).to_list(length=1000)
    except Exception as e:
        print(f"Aggregation Error: {e}")
        return {"data": [], "products": []}

    # --- Pivot Logic (Same as before) ---
    merged_data = defaultdict(dict)
    all_products = set()

    for item in raw_data:
        # Use .get() for safety
        month = item.get("_id", {}).get("month", "Unknown")
        product = item.get("_id", {}).get("product", "Unknown")
        count = item.get("count", 0)

        merged_data[month]["month"] = month
        merged_data[month][product] = count
        all_products.add(product)

    final_list = sorted(merged_data.values(), key=lambda x: x["month"])

    return {"data": final_list, "products": list(all_products)}
