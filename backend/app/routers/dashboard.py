from datetime import UTC, datetime

from fastapi import APIRouter, Depends
from sqlalchemy import and_, extract, func
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models import Quote, User
from app.schemas import DashboardSummary

router = APIRouter(prefix='/dashboard', tags=['dashboard'])


@router.get('/summary', response_model=DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> DashboardSummary:
    base_query = db.query(Quote)
    if current_user.role != 'admin':
        base_query = base_query.filter(Quote.user_id == current_user.id)

    now = datetime.now(UTC)
    month_query = base_query.filter(
        and_(
            extract('year', Quote.created_at) == now.year,
            extract('month', Quote.created_at) == now.month,
        )
    )

    total_quotes = base_query.count()
    quotes_this_month = month_query.count()

    avg_quote = base_query.with_entities(func.avg(Quote.final_usd)).scalar() or 0
    lcl_count = base_query.filter(Quote.service_mode == 'LCL').count()
    lcl_ratio = (lcl_count / total_quotes * 100) if total_quotes else 0

    latest_quotes = base_query.order_by(Quote.created_at.desc()).limit(5).all()

    return DashboardSummary(
        total_quotes=total_quotes,
        quotes_this_month=quotes_this_month,
        avg_quote_usd=round(float(avg_quote), 2),
        lcl_ratio_pct=round(float(lcl_ratio), 1),
        latest_quotes=latest_quotes,
    )
