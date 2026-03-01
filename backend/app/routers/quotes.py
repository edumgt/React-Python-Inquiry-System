from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models import Quote, User
from app.schemas import QuoteCreateRequest, QuoteParseRequest, QuoteParseResponse, QuoteResponse
from app.services.quote_calculator import QuoteInput, calculate_quote, parse_cargo_text
from app.utils import generate_quote_no

router = APIRouter(prefix='/quotes', tags=['quotes'])


@router.get('', response_model=list[QuoteResponse])
def list_quotes(
    include_all: bool = Query(default=False, description='Admin can view all quotes'),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[QuoteResponse]:
    query = db.query(Quote)

    if current_user.role != 'admin' or not include_all:
        query = query.filter(Quote.user_id == current_user.id)

    return query.order_by(Quote.created_at.desc()).all()


@router.post('/calculate', response_model=QuoteResponse)
def calculate_and_create_quote(
    payload: QuoteCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuoteResponse:
    try:
        result = calculate_quote(
            db,
            current_user,
            QuoteInput(
                origin=payload.origin,
                destination_region=payload.destination_region,
                total_weight_kg=payload.total_weight_kg,
                total_cbm=payload.total_cbm,
                cargo_length_cm=payload.cargo_length_cm,
                cargo_width_cm=payload.cargo_width_cm,
                cargo_height_cm=payload.cargo_height_cm,
            ),
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    sequence = db.query(func.count(Quote.id)).scalar() or 0
    quote = Quote(
        quote_no=generate_quote_no(sequence + 1),
        user_id=current_user.id,
        origin=payload.origin,
        destination_region=payload.destination_region,
        destination_address=payload.destination_address,
        package_count=payload.package_count,
        total_weight_kg=payload.total_weight_kg,
        total_cbm=payload.total_cbm,
        cargo_length_cm=payload.cargo_length_cm,
        cargo_width_cm=payload.cargo_width_cm,
        cargo_height_cm=payload.cargo_height_cm,
        recommended_vehicle_id=result.recommended_vehicle.id,
        service_mode=result.service_mode,
        subtotal_usd=result.subtotal_usd,
        surcharge_usd=result.surcharge_usd,
        discount_usd=result.discount_usd,
        final_usd=result.final_usd,
        final_krw=result.final_krw,
        pricing_breakdown=result.pricing_breakdown,
        status='issued',
        created_at=datetime.now(UTC),
    )
    db.add(quote)
    db.commit()
    db.refresh(quote)
    return quote


@router.post('/parse-text', response_model=QuoteParseResponse)
def parse_quote_text(
    payload: QuoteParseRequest,
    _: User = Depends(get_current_user),
) -> QuoteParseResponse:
    return QuoteParseResponse(**parse_cargo_text(payload.raw_text))


@router.get('/{quote_id}', response_model=QuoteResponse)
def get_quote(
    quote_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuoteResponse:
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail='Quote not found')
    if current_user.role != 'admin' and quote.user_id != current_user.id:
        raise HTTPException(status_code=403, detail='Not allowed to view this quote')
    return quote
