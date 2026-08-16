from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _build_auth_response(db: Session, user: models.User) -> schemas.AuthResponse:
    profile = None
    if user.role == "mechanic":
        profile_row = (
            db.query(models.MechanicProfile)
            .filter(models.MechanicProfile.user_id == user.id)
            .first()
        )
        if profile_row:
            reviews = (
                db.query(models.Review)
                .filter(models.Review.mechanic_id == user.id)
                .all()
            )
            rating = (
                round(sum(r.rating for r in reviews) / len(reviews), 1)
                if reviews
                else None
            )
            profile = schemas.MechanicProfileOut(
                id=profile_row.id,
                user_id=profile_row.user_id,
                bio=profile_row.bio,
                skills=profile_row.skills,
                years_experience=profile_row.years_experience,
                base_fee=profile_row.base_fee,
                verified=profile_row.verified,
                lat=profile_row.lat,
                lng=profile_row.lng,
                location_name=profile_row.location_name,
                rating=rating,
                reviews_count=len(reviews),
            )
    token = auth.create_access_token({"sub": str(user.id)})
    return schemas.AuthResponse(
        token=token, user=schemas.UserOut.model_validate(user), mechanic_profile=profile
    )


@router.post("/register", response_model=schemas.AuthResponse, status_code=201)
def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    if payload.role not in models.USER_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")
    existing = (
        db.query(models.User).filter(models.User.email == payload.email).first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = models.User(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        password_hash=auth.hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.flush()

    if payload.role == "mechanic":
        profile = models.MechanicProfile(
            user_id=user.id,
            bio=payload.bio,
            skills=payload.skills,
            years_experience=payload.years_experience,
            base_fee=payload.base_fee,
            lat=payload.lat,
            lng=payload.lng,
            location_name=payload.location_name,
        )
        db.add(profile)

    db.commit()
    db.refresh(user)
    return _build_auth_response(db, user)


@router.post("/login", response_model=schemas.AuthResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not auth.verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return _build_auth_response(db, user)


@router.get("/me", response_model=schemas.AuthResponse)
def me(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    return _build_auth_response(db, current_user)
