from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    success: bool
    message: str
    email: str


# Temporary development account
# We will replace this with a database later.
DEMO_EMAIL = "harinievk@gmail.com"
DEMO_PASSWORD = "12345678"


@router.post("/login", response_model=LoginResponse)
async def login(data: LoginRequest):

    if (
        data.email.lower() != DEMO_EMAIL.lower()
        or data.password != DEMO_PASSWORD
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    return {
        "success": True,
        "message": "Login successful",
        "email": data.email,
    }


@router.get("/test")
async def auth_test():
    return {
        "success": True,
        "message": "Authentication API is working"
    }
