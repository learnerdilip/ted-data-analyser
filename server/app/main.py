import math
from contextlib import asynccontextmanager
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import db
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.models.schemas import PaginatedResponse


# 1. Lifespan events (Startup/Shutdown)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    await connect_to_mongo()
    yield
    # Shutdown logic
    await close_mongo_connection()


# 2. App Initialization
app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

# 3. CORS Configuration
# Allow requests from localhost:3000 (common for React/Vue)
# and localhost:8000 (docs). Adjust origins list for production.
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 4. Simple Health Check Route
@app.get("/")
async def root():
    return {"message": "Server is running", "database": settings.MONGO_DB_NAME}


# In server/app/main.py
@app.get("/ted-data")
async def get_data():
    # Fetch 10 documents
    docs = await db.client[settings.MONGO_DB_NAME]["ted_notices"].find().to_list(10)
    # Convert ObjectId to string for JSON serialization
    for doc in docs:
        doc["_id"] = str(doc["_id"])
    return docs


@app.get("/notices")
async def get_notices(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Items per page"),
):
    collection = db.client[settings.MONGO_DB_NAME]["ted_notices"]

    print("--- 1111 ----", collection.count_documents({}))
    # 1. Calculate Skip (How many to ignore)
    # Page 1: skip 0. Page 2: skip 10. Page 3: skip 20.
    skip_amount = (page - 1) * size

    # 2. Fetch the Data
    cursor = collection.find().skip(skip_amount).limit(size)

    # 3. Serialize data (Convert MongoDB _id to string)
    notices_data = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])  # Convert ObjectId to string
        notices_data.append(doc)

    # 4. Get Total Count (Required for frontend pagination buttons)
    total_records = await collection.count_documents({})

    # 5. Calculate Total Pages
    total_pages = math.ceil(total_records / size)

    return {
        "data": notices_data,
        "total": total_records,
        "page": page,
        "size": size,
        "total_pages": total_pages,
    }
