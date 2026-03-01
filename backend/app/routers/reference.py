from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models import ExchangeRate, TariffRate, User, VehicleSpec
from app.schemas import ExchangeRateResponse, TariffResponse, VehicleResponse

router = APIRouter(prefix='/reference', tags=['reference'])


@router.get('/vehicles', response_model=list[VehicleResponse])
def list_vehicles(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[VehicleResponse]:
    return db.query(VehicleSpec).filter(VehicleSpec.active.is_(True)).order_by(VehicleSpec.tonnage.asc()).all()


@router.get('/tariffs', response_model=list[TariffResponse])
def list_tariffs(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[TariffResponse]:
    return db.query(TariffRate).order_by(TariffRate.origin.asc(), TariffRate.destination_region.asc()).all()


@router.get('/exchange-rate', response_model=ExchangeRateResponse)
def get_exchange_rate(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> ExchangeRateResponse:
    rate = db.query(ExchangeRate).filter(ExchangeRate.currency == 'USD').first()
    if not rate:
        raise HTTPException(status_code=404, detail='USD exchange rate not configured')
    return rate
