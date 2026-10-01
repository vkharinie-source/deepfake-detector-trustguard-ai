import hashlib
import json
import secrets
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import AliasChoices, BaseModel, EmailStr, Field


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


# ============================================================
# USER STORAGE
# ============================================================

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "data"
USERS_FILE = DATA_DIR / "users.json"

DATA_DIR.mkdir(parents=True, exist_ok=True)


def load_users() -> dict:
    if not USERS_FILE.exists():
        return {}

    try:
        with open(USERS_FILE, "r", encoding="utf-8") as file:
            return json.load(file)
    except (json.JSONDecodeError, OSError):
        return {}


def save_users(users: dict) -> None:
    with open(USERS_FILE, "w", encoding="utf-8") as file:
        json.dump(users, file, indent=2)


# ============================================================
# PASSWORD HASHING
# ============================================================

def hash_password(password: str, salt: str | None = None) -> tuple[str, str]:
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

    users = load_users()

    if email in users:
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists.",
        )

    password_hash, salt = hash_password(password)

    users[email] = {
        "full_name": full_name,
        "email": email,
        "password_hash": password_hash,
        "salt": salt,
    }

    save_users(users)

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

    users = load_users()

    # --------------------------------------------------------
    # Existing registered user
    # --------------------------------------------------------

    if email in users:
        user = users[email]

        if not verify_password(
            password,
            user["password_hash"],
            user["salt"],
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password.",
            )

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

    # --------------------------------------------------------
    # Demo account preserved
    # --------------------------------------------------------

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


# ============================================================
# AUTH TEST
# ============================================================

@router.get("/test")
async def auth_test():
    return {
        "success": True,
        "message": "Authentication API is working.",
    }