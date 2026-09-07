from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.predictor import predict_image
from app.services.history_service import save_history

router = APIRouter(
    prefix="/api/predict",
    tags=["Prediction"]
)


@router.post("/image")
async def predict(file: UploadFile = File(...)):
    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and WEBP images are supported."
        )

    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty."
        )

    result = predict_image(image_bytes)

    save_history(
        filename=file.filename or "unknown",
        prediction=result["prediction"],
        confidence=result["confidence"]
    )

    return {
        "success": True,
        "filename": file.filename,
        **result
    }
