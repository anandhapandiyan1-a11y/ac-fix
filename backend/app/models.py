from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

USER_ROLES = ("customer", "mechanic")

BOOKING_STATUSES = (
    "PENDING",
    "ACCEPTED",
    "ON_THE_WAY",
    "COMPLETED",
    "CANCELLED",
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(160), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    mechanic_profile = relationship(
        "MechanicProfile", back_populates="user", uselist=False
    )


class MechanicProfile(Base):
    __tablename__ = "mechanic_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    bio = Column(Text, default="")
    skills = Column(String(300), default="")
    years_experience = Column(Integer, default=0)
    base_fee = Column(Float, default=0.0)
    verified = Column(Boolean, default=True)
    lat = Column(Float, default=0.0)
    lng = Column(Float, default=0.0)
    location_name = Column(String(200), default="")

    user = relationship("User", back_populates="mechanic_profile")

    @property
    def rating(self):
        return None

    @property
    def reviews_count(self):
        return None


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    description = Column(Text, default="")
    base_price = Column(Float, nullable=False)
    estimated_time = Column(String(60), default="")
    icon = Column(String(40), default="🔧")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mechanic_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    status = Column(String(20), default="PENDING", index=True)
    address = Column(String(300), nullable=False)
    lat = Column(Float, default=0.0)
    lng = Column(Float, default=0.0)
    notes = Column(Text, default="")
    total_price = Column(Float, nullable=False)
    scheduled_time = Column(String(60), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("User", foreign_keys=[customer_id])
    mechanic = relationship("User", foreign_keys=[mechanic_id])
    service = relationship("Service")
    review = relationship("Review", back_populates="booking", uselist=False)


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mechanic_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="review")
