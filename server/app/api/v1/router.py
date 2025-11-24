from fastapi import APIRouter
from app.api.v1.endpoints import notices
from app.api.v1.endpoints import admin


api_router = APIRouter()

api_router.include_router(notices.router, prefix="/notices", tags=["notices"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
