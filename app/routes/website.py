from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.website_detector import analyze_website
from app.services.history_service import save_history


router = APIRouter(
    prefix="/api/analyze",
    tags=["Website Analysis"]
)


class WebsiteRequest(BaseModel):
    url: str


@router.post("/website")
async def analyze_website_route(data: WebsiteRequest):

    if not data.url.strip():
        raise HTTPException(
            status_code=400,
            detail="Website URL is required."
        )

    try:
        result = analyze_website(data.url)

        save_history(
            filename=data.url[:80],
            prediction=result["result"],
            confidence=result["confidence"]
        )

        return {
            "success": True,
            **result
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )
