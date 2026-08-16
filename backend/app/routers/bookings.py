from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


def _serialize(db: Session, b: models.Booking) -> schemas.BookingOut:
    customer = db.query(models.User).filter(models.User.id == b.customer_id).first()
    mechanic = db.query(models.User).filter(models.User.id == b.mechanic_id).first()
    service = db.query(models.Service).filter(models.Service.id == b.service_id).first()
    return schemas.BookingOut(
        id=b.id,
        status=b.status,
        address=b.address,
        lat=b.lat,
        lng=b.lng,
        notes=b.notes,
        total_price=b.total_price,
        scheduled_time=b.scheduled_time,
        created_at=b.created_at,
        customer_name=customer.name if customer else None,
        customer_phone=customer.phone if customer else None,
        mechanic_name=mechanic.name if mechanic else None,
        mechanic_phone=mechanic.phone if mechanic else None,
        service_name=service.name if service else None,
        service_icon=service.icon if service else None,
        reviewed=b.review is not None,
    )


@router.post("", response_model=schemas.BookingOut, status_code=201)
def create_booking(
    payload: schemas.BookingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != "customer":
        raise HTTPException(status_code=403, detail="Only customers can book")

    mechanic = db.query(models.User).filter(models.User.id == payload.mechanic_id).first()
    if not mechanic or mechanic.role != "mechanic":
        raise HTTPException(status_code=404, detail="Mechanic not found")

    service = db.query(models.Service).filter(models.Service.id == payload.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    profile = (
        db.query(models.MechanicProfile)
        .filter(models.MechanicProfile.user_id == mechanic.id)
        .first()
    )
    total = payload.total_price or (service.base_price + (profile.base_fee if profile else 0))

    booking = models.Booking(
        customer_id=current_user.id,
        mechanic_id=mechanic.id,
        service_id=service.id,
        address=payload.address,
        lat=payload.lat,
        lng=payload.lng,
        notes=payload.notes,
        total_price=total,
        scheduled_time=payload.scheduled_time,
        status="PENDING",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return _serialize(db, booking)


@router.get("/my", response_model=List[schemas.BookingOut])
def my_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role == "mechanic":
        rows = (
            db.query(models.Booking)
            .filter(models.Booking.mechanic_id == current_user.id)
            .order_by(models.Booking.created_at.desc())
            .all()
        )
    else:
        rows = (
            db.query(models.Booking)
            .filter(models.Booking.customer_id == current_user.id)
            .order_by(models.Booking.created_at.desc())
            .all()
        )
    return [_serialize(db, b) for b in rows]


@router.patch("/{booking_id}/status", response_model=schemas.BookingOut)
def update_status(
    booking_id: int,
    payload: schemas.StatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if payload.status not in models.BOOKING_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")

    if current_user.role == "mechanic":
        if booking.mechanic_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not your booking")
        allowed = {"PENDING": ["ACCEPTED", "CANCELLED"], "ACCEPTED": ["ON_THE_WAY", "CANCELLED"], "ON_THE_WAY": ["COMPLETED"]}
        if payload.status not in allowed.get(booking.status, []):
            raise HTTPException(
                status_code=400,
                detail=f"Cannot move booking from {booking.status} to {payload.status}",
            )
    elif current_user.role == "customer":
        if booking.customer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not your booking")
        if booking.status == "PENDING" and payload.status == "CANCELLED":
            pass
        else:
            raise HTTPException(status_code=400, detail="Customers can only cancel pending bookings")
    else:
        raise HTTPException(status_code=403, detail="Invalid role")

    booking.status = payload.status
    db.commit()
    db.refresh(booking)
    return _serialize(db, booking)


@router.get("/stats", response_model=schemas.StatsOut)
def my_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role == "mechanic":
        bookings = (
            db.query(models.Booking)
            .filter(models.Booking.mechanic_id == current_user.id)
            .all()
        )
    else:
        bookings = (
            db.query(models.Booking)
            .filter(models.Booking.customer_id == current_user.id)
            .all()
        )
    completed = [b for b in bookings if b.status == "COMPLETED"]
    reviews = (
        db.query(models.Review)
        .filter(models.Review.mechanic_id == current_user.id)
        .all()
        if current_user.role == "mechanic"
        else []
    )
    rating = (
        round(sum(r.rating for r in reviews) / len(reviews), 1) if reviews else None
    )
    breakdown = {i: 0 for i in range(1, 6)}
    for r in reviews:
        breakdown[r.rating] += 1
    return schemas.StatsOut(
        total_bookings=len(bookings),
        completed=len(completed),
        pending=sum(1 for b in bookings if b.status == "PENDING"),
        avg_rating=rating,
        total_reviews=len(reviews),
        rating_breakdown=breakdown,
    )
