import hashlib
import secrets

from fastapi import APIRouter, HTTPException
from pydantic import AliasChoices, BaseModel, EmailStr, Field

from app.core.database import users_collection


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


# ============================================================
# PASSWORD HASHING
# ============================================================

def hash_password(
    password: str,
    salt: str | None = None,
) -> tuple[str, str]:

    if salt is None:
        salt = secrets.token_hex(16)

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100_000,
    ).hex()

    return password_hash, salt


def verify_password(
    password: str,
    stored_hash: str,
    salt: str,
) -> bool:

    calculated_hash, _ = hash_password(
        password,
        salt,
    )

    return secrets.compare_digest(
        calculated_hash,
        stored_hash,
    )


# ============================================================
# REQUEST MODELS
# ============================================================

class RegisterRequest(BaseModel):

    full_name: str = Field(
        default="",
        validation_alias=AliasChoices(
            "fullName",
            "full_name",
            "name",
        ),
    )

    email: EmailStr

    password: str

    confirm_password: str | None = Field(
        default=None,
        validation_alias=AliasChoices(
            "confirmPassword",
            "confirm_password",
        ),
    )


class LoginRequest(BaseModel):

    email: EmailStr

    password: str


# ============================================================
# REGISTER
# ============================================================

@router.post("/register")
async def register(data: RegisterRequest):

    full_name = data.full_name.strip()
    email = str(data.email).lower().strip()
    password = data.password

    # --------------------------------------------------------
    # Validation
    # --------------------------------------------------------

    if not full_name:
        raise HTTPException(
            status_code=400,
            detail="Full name is required.",
        )

    if len(password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 8 characters.",
        )

    if (
        data.confirm_password is not None
        and password != data.confirm_password
    ):
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match.",
        )

    # --------------------------------------------------------
    # Check MongoDB
    # --------------------------------------------------------

    existing_user = users_collection.find_one(
        {
            "email": email
        }
    )

    if existing_user:

        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists.",
        )

    # --------------------------------------------------------
    # Hash password
    # --------------------------------------------------------

    password_hash, salt = hash_password(password)

    # --------------------------------------------------------
    # Create MongoDB document
    # --------------------------------------------------------

    user_document = {
        "full_name": full_name,
        "email": email,
        "password_hash": password_hash,
        "salt": salt,
    }

    users_collection.insert_one(user_document)

    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return {
        "success": True,
        "message": "Account created successfully.",
        "user": {
            "full_name": full_name,
            "email": email,
        },
    }


# ============================================================
# LOGIN
# ============================================================

@router.post("/login")
async def login(data: LoginRequest):

    email = str(data.email).lower().strip()
    password = data.password

    # --------------------------------------------------------
    # Find user in MongoDB
    # --------------------------------------------------------

    user = users_collection.find_one(
        {
            "email": email
        }
    )

    # --------------------------------------------------------
    # Demo account
    # --------------------------------------------------------

    if not user:

        if (
            email == "harinievk@gmail.com"
            and password == "12345678"
        ):

            return {
                "success": True,
                "message": "Login successful.",
                "token": "demo-token",
                "user": {
                    "full_name": "Harini VK",
                    "email": email,
                },
            }

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    # --------------------------------------------------------
    # Verify password
    # --------------------------------------------------------

    if not verify_password(
        password,
        user["password_hash"],
        user["salt"],
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    # --------------------------------------------------------
    # Generate login token
    # --------------------------------------------------------

    token = secrets.token_urlsafe(32)

    return {
        "success": True,
        "message": "Login successful.",
        "token": token,
        "user": {
            "full_name": user["full_name"],
            "email": user["email"],
        },
    }


# ============================================================
# AUTH TEST
# ============================================================

@router.get("/test")
async def auth_test():

    return {
        "success": True,
        "message": "Authentication API is working.",
    }