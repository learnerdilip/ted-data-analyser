# In server/app/models/schemas.py (Create this file if needed)
from pydantic import BaseModel, Field
from typing import List, Any, Optional


# The model for a single Notice (subset of fields)
class TedNotice(BaseModel):
    id: str = Field(..., alias="_id")  # Handle MongoDB _id
    publication_number: Optional[str] = None
    winner_name: Optional[str] = Field(None, alias="winner-name")
    tender_value: Optional[float] = Field(None, alias="tender-value")
    buyer_country: Optional[str] = Field(None, alias="buyer-country-sub")

    class Config:
        populate_by_name = True


# The wrapper model for the paginated response
class PaginatedResponse(BaseModel):
    data: List[TedNotice]
    total: int
    page: int
    size: int
    total_pages: int
