```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.prediction import router as prediction_router
from app.routes.auth import router as auth_router
from app.routes.history import router as history_router
from app.routes.message import router as message_router
from app.routes.email import router as email_router
from app.routes.website import router as website_router
from app.routes.call import router as call_router


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="TrustGuard AI",
    description="AI-powered digital threat and fake-content detection platform",
    version="2.0.0",
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Local frontend
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",

        # Deployed backend
        "https://deepfake-detector-trustguard-ai-1.onrender.com",

        # Deployed frontend
        "https://good-jq3j.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# API ROUTES
# ============================================================

app.include_router(prediction_router)
app.include_router(auth_router)
app.include_router(history_router)
app.include_router(message_router)
app.include_router(email_router)
app.include_router(website_router)
app.include_router(call_router)


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():
    return {
        "success": True,
        "message": "TrustGuard AI API",
        "version": "2.0.0",
        "status": "running",
        "endpoints": [
            "POST /api/predict/image",
            "POST /api/analyze/message",
            "POST /api/analyze/email",
            "POST /api/analyze/website",
            "POST /api/analyze/call",
            "POST /api/auth/login",
            "GET /api/auth/test",
            "GET /history",
            "GET /health",
        ],
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():
    return {
        "success": True,
        "status": "healthy",
        "model": "MobileNetV2",
        "version": "2.0.0",
    }
```
