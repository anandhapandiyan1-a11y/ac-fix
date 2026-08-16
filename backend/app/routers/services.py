from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/api/services", tags=["services"])


@router.get("", response_model=List[schemas.ServiceOut])
def list_services(db: Session = Depends(get_db)):
    return db.query(models.Service).all()
