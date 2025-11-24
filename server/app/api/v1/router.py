from fastapi import APIRouter
from app.api.v1.endpoints import notices

api_router = APIRouter()

api_router.include_router(notices.router, prefix="/notices", tags=["notices"])
