from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


@router.post("", response_model=schemas.ReviewOut, status_code=201)
def create_review(
    booking_id: int,
    payload: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != "customer":
        raise HTTPException(status_code=403, detail="Only customers can review")

    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your booking")
    if booking.status != "COMPLETED":
        raise HTTPException(status_code=400, detail="Service must be completed first")
    if booking.review is not None:
        raise HTTPException(status_code=409, detail="Already reviewed")

    review = models.Review(
        booking_id=booking.id,
        customer_id=current_user.id,
        mechanic_id=booking.mechanic_id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return schemas.ReviewOut(
        id=review.id,
        booking_id=review.booking_id,
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at,
        customer_name=current_user.name,
    )


@router.get("/mechanic/{mechanic_user_id}", response_model=List[schemas.ReviewOut])
def mechanic_reviews(
    mechanic_user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    rows = (
        db.query(models.Review)
        .filter(models.Review.mechanic_id == mechanic_user_id)
        .order_by(models.Review.created_at.desc())
        .all()
    )
    result = []
    for r in rows:
        customer = db.query(models.User).filter(models.User.id == r.customer_id).first()
        result.append(
            schemas.ReviewOut(
                id=r.id,
                booking_id=r.booking_id,
                rating=r.rating,
                comment=r.comment,
                created_at=r.created_at,
                customer_name=customer.name if customer else None,
            )
        )
    return result
