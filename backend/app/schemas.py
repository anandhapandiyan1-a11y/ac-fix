from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str = Field(min_length=6)
    role: str  # "customer" | "mechanic"
    # mechanic fields
    bio: Optional[str] = ""
    skills: Optional[str] = ""
    years_experience: Optional[int] = 0
    base_fee: Optional[float] = 0.0
    lat: Optional[float] = 0.0
    lng: Optional[float] = 0.0
    location_name: Optional[str] = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class MechanicProfileOut(BaseModel):
    id: int
    user_id: int
    bio: str
    skills: str
    years_experience: int
    base_fee: float
    verified: bool
    lat: float
    lng: float
    location_name: str
    rating: Optional[float] = None
    reviews_count: int = 0
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    token: str
    user: UserOut
    mechanic_profile: Optional[MechanicProfileOut] = None


class ServiceOut(BaseModel):
    id: int
    name: str
    description: str
    base_price: float
    estimated_time: str
    icon: str

    class Config:
        from_attributes = True


class BookingCreate(BaseModel):
    mechanic_id: int
    service_id: int
    address: str
    lat: float
    lng: float
    scheduled_time: Optional[str] = ""
    notes: Optional[str] = ""
    total_price: Optional[float] = None


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str = ""


class ReviewOut(BaseModel):
    id: int
    booking_id: int
    rating: int
    comment: str
    created_at: datetime
    customer_name: Optional[str] = None

    class Config:
        from_attributes = True


class BookingOut(BaseModel):
    id: int
    status: str
    address: str
    lat: float
    lng: float
    notes: str
    total_price: float
    scheduled_time: str
    created_at: datetime
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    mechanic_name: Optional[str] = None
    mechanic_phone: Optional[str] = None
    service_name: Optional[str] = None
    service_icon: Optional[str] = None
    reviewed: bool = False

    class Config:
        from_attributes = True


class StatusUpdateRequest(BaseModel):
    status: str


class StatsOut(BaseModel):
    total_bookings: int
    completed: int
    pending: int
    avg_rating: Optional[float] = None
    total_reviews: int = 0
    rating_breakdown: dict = {}
