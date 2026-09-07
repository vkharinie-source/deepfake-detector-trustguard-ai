from fastapi import APIRouter

from app.services.history_service import get_history

router = APIRouter(tags=["History"])


@router.get("/history")
def history():
    return {
        "success": True,
        "history": get_history(),
    }
