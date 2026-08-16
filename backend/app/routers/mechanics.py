from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional

from ..database import get_db
from .. import models, schemas, geo
from ..auth import get_current_user

router = APIRouter(prefix="/api/mechanics", tags=["mechanics"])


def _profile_stats(db: Session, mechanic_id: int):
    reviews = (
        db.query(models.Review).filter(models.Review.mechanic_id == mechanic_id).all()
    )
    rating = (
        round(sum(r.rating for r in reviews) / len(reviews), 1) if reviews else None
    )
    return rating, len(reviews)


@router.get("", response_model=List[dict])
def nearby_mechanics(
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    radius_km: float = Query(20.0),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    profiles = (
        db.query(models.MechanicProfile)
        .join(models.User, models.User.id == models.MechanicProfile.user_id)
        .filter(models.User.role == "mechanic")
        .all()
    )
    result = []
    for p in profiles:
        rating, count = _profile_stats(db, p.user_id)
        distance = (
            geo.haversine_km(lat, lng, p.lat, p.lng) if lat is not None else None
        )
        if lat is not None and distance is not None and distance > radius_km:
            continue
        result.append(
            {
                "id": p.id,
                "user_id": p.user_id,
                "name": p.user.name,
                "phone": p.user.phone,
                "email": p.user.email,
                "bio": p.bio,
                "skills": p.skills,
                "years_experience": p.years_experience,
                "base_fee": p.base_fee,
                "verified": p.verified,
                "lat": p.lat,
                "lng": p.lng,
                "location_name": p.location_name,
                "rating": rating,
                "reviews_count": count,
                "distance_km": round(distance, 1) if distance is not None else None,
            }
        )
    if lat is not None:
        result.sort(key=lambda m: m["distance_km"])
    else:
        result.sort(key=lambda m: (m["rating"] is None, -(m["rating"] or 0)))
    return result


@router.get("/{mechanic_id}", response_model=dict)
def mechanic_detail(
    mechanic_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    profile = (
        db.query(models.MechanicProfile)
        .filter(
            or_(
                models.MechanicProfile.id == mechanic_id,
                models.MechanicProfile.user_id == mechanic_id,
            )
        )
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Mechanic not found")
    rating, count = _profile_stats(db, profile.user_id)
    reviews = (
        db.query(models.Review)
        .filter(models.Review.mechanic_id == profile.user_id)
        .order_by(models.Review.created_at.desc())
        .all()
    )
    review_list = []
    for r in reviews:
        customer = db.query(models.User).filter(models.User.id == r.customer_id).first()
        review_list.append(
            {
                "id": r.id,
                "rating": r.rating,
                "comment": r.comment,
                "created_at": r.created_at,
                "customer_name": customer.name if customer else None,
            }
        )
    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "name": profile.user.name,
        "phone": profile.user.phone,
        "email": profile.user.email,
        "bio": profile.bio,
        "skills": profile.skills,
        "years_experience": profile.years_experience,
        "base_fee": profile.base_fee,
        "verified": profile.verified,
        "lat": profile.lat,
        "lng": profile.lng,
        "location_name": profile.location_name,
        "rating": rating,
        "reviews_count": count,
        "reviews": review_list,
    }
