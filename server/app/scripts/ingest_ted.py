import asyncio
import httpx
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

# --- Configuration ---
TED_API_ENDPOINT = "https://api.ted.europa.eu/v3/notices/search"

TARGET_COUNTRIES = ["POL", "DEU", "ITA", "HUN"]
TARGET_ITEMS = ["Abiraterone", "Eplerenone", "Pomalidomide"]

# I added 'publication-number' to this list so we can use it as the unique database ID
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
    "BT-137-Part",
    "BT-137-Lot",
    "winner-decision-date",
    "publication-date",
]


async def fetch_page(client: httpx.AsyncClient, item_name: str, page_number: int):
    """
    Fetches a single page of results for a specific item.
    """
    # 1. Construct the Country Query Part: (POL OR DEU OR ITA OR HUN)
    countries_query = " OR ".join(TARGET_COUNTRIES)

    # 2. Construct the Full Query String
    # "FT~ Abiraterone AND buyer-country=(POL OR DEU...) SORT BY ..."
    query_string = (
        f"FT~ {item_name} "
        f"AND buyer-country=({countries_query}) "
        f"SORT BY publication-number DESC"
    )

    # 3. Payload matching your specific request
    payload = {
        "query": query_string,
        "fields": REQUEST_FIELDS,
        "page": page_number,
        "limit": 100,
        "scope": "ALL",
        "checkQuerySyntax": False,
        "paginationMode": "PAGE_NUMBER",
        "onlyLatestVersions": False,
    }

    try:
        response = await client.post(TED_API_ENDPOINT, json=payload)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"    !! Error fetching page {page_number} for {item_name}: {e}")
        return None


async def save_to_mongo(db_client: AsyncIOMotorClient, item_name: str, notices: list):
    """
    Saves a list of notices to MongoDB.
    """
    if not notices:
        return 0

    collection = db_client[settings.MONGO_DB_NAME]["ted_notices"]
    count = 0

    for notice in notices:
        # We use publication-number as the unique ID (_id)
        unique_id = notice.get("publication-number")

        if unique_id:
            # Add metadata to track which search term found this result
            notice["_search_term"] = item_name

            # UPSERT: Update if exists, Insert if not
            await collection.update_one(
                {"publication-number": unique_id}, {"$set": notice}, upsert=True
            )
            count += 1
    return count


async def process_item(
    client: httpx.AsyncClient, db_client: AsyncIOMotorClient, item_name: str
):
    """
    Orchestrates fetching ALL pages for a single item.
    """
    page = 1
    total_saved = 0

    print(f"\n--- Processing Item: {item_name} ---")

    while True:
        print(f"  -> Fetching Page {page}...")
        data = await fetch_page(client, item_name, page)

        if not data:
            break

        # Extract notices
        notices = data.get("notices", [])
        if not notices:
            print("    -> No more notices found. Finished this item.")
            break

        # Save to DB
        saved_count = await save_to_mongo(db_client, item_name, notices)
        total_saved += saved_count

        # Prepare for next page
        page += 1

        # Rate Limit Protection (brief pause)
        await asyncio.sleep(0.5)

    print(f"--- Finished {item_name}: Saved {total_saved} records total ---")


async def run_ted_ingestion():
    """
    This function can be called by the FastAPI Endpoint.
    It manages its own lifecycle.
    """
    print("--- Starting Background Ingestion ---")

    # 1. Connect to DB (We create a dedicated connection for this task)
    db_client = AsyncIOMotorClient(settings.MONGO_URL)

    try:
        async with httpx.AsyncClient(timeout=30.0) as http_client:
            for item in TARGET_ITEMS:
                await process_item(http_client, db_client, item)
    except Exception as e:
        print(f"Error during ingestion: {e}")
    finally:
        db_client.close()
        print("---Background Ingestion Complete ---")


async def main():
    # 1. Database Connection
    db_client = AsyncIOMotorClient(settings.MONGO_URL)

    # 2. HTTP Client
    async with httpx.AsyncClient(timeout=30.0) as http_client:
        # 3. Loop through items
        for item in TARGET_ITEMS:
            await process_item(http_client, db_client, item)

    print("\n=== All Ingestion Tasks Complete ===")
    db_client.close()


if __name__ == "__main__":
    asyncio.run(main())
