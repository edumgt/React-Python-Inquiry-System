from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import require_roles
from app.models import User
from app.schemas import UserBase

router = APIRouter(prefix='/admin', tags=['admin'])


@router.get('/users', response_model=list[UserBase])
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles('admin')),
) -> list[UserBase]:
    return db.query(User).order_by(User.created_at.desc()).all()
