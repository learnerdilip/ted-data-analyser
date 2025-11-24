from fastapi import APIRouter, BackgroundTasks
from app.scripts.ingest_ted import run_ted_ingestion

router = APIRouter()


@router.post("/ingest-data")
async def trigger_ingestion(background_tasks: BackgroundTasks):
    """
    Triggers the TED data ingestion process in the background.
    Returns immediately so the user doesn't wait.
    """
    # FastAPI will run this function AFTER sending the response
    background_tasks.add_task(run_ted_ingestion)

    return {"message": "Ingestion started in the background.", "status": "processing"}
