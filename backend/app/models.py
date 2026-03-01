from datetime import UTC, datetime

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class User(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    company_name: Mapped[str] = mapped_column(String(160), nullable=False)
    role: Mapped[str] = mapped_column(String(30), nullable=False, default='user')
    tier: Mapped[str] = mapped_column(String(20), nullable=False, default='STANDARD')
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    quotes = relationship('Quote', back_populates='user')


class VehicleSpec(Base):
    __tablename__ = 'vehicle_specs'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    vehicle_name: Mapped[str] = mapped_column(String(80), nullable=False)
    tonnage: Mapped[float] = mapped_column(Float, nullable=False)
    max_weight_kg: Mapped[float] = mapped_column(Float, nullable=False)
    load_length_cm: Mapped[float] = mapped_column(Float, nullable=False)
    load_width_cm: Mapped[float] = mapped_column(Float, nullable=False)
    load_height_cm: Mapped[float] = mapped_column(Float, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class TariffRate(Base):
    __tablename__ = 'tariff_rates'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    origin: Mapped[str] = mapped_column(String(120), nullable=False)
    destination_region: Mapped[str] = mapped_column(String(120), nullable=False)
    vehicle_spec_id: Mapped[int] = mapped_column(ForeignKey('vehicle_specs.id'), nullable=False)
    base_price_usd: Mapped[float] = mapped_column(Float, nullable=False)
    lcl_price_usd_per_cbm: Mapped[float] = mapped_column(Float, nullable=False)
    overweight_surcharge_usd_per_ton: Mapped[float] = mapped_column(Float, nullable=False)
    size_surcharge_pct: Mapped[float] = mapped_column(Float, nullable=False, default=15)

    vehicle = relationship('VehicleSpec')


class ExchangeRate(Base):
    __tablename__ = 'exchange_rates'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    currency: Mapped[str] = mapped_column(String(10), unique=True, nullable=False)
    rate_to_krw: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))


class Quote(Base):
    __tablename__ = 'quotes'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    quote_no: Mapped[str] = mapped_column(String(40), unique=True, nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)

    origin: Mapped[str] = mapped_column(String(120), nullable=False)
    destination_address: Mapped[str] = mapped_column(Text, nullable=False)
    destination_region: Mapped[str] = mapped_column(String(120), nullable=False)

    package_count: Mapped[int] = mapped_column(Integer, nullable=False)
    total_weight_kg: Mapped[float] = mapped_column(Float, nullable=False)
    total_cbm: Mapped[float] = mapped_column(Float, nullable=False)
    cargo_length_cm: Mapped[float] = mapped_column(Float, nullable=False)
    cargo_width_cm: Mapped[float] = mapped_column(Float, nullable=False)
    cargo_height_cm: Mapped[float] = mapped_column(Float, nullable=False)

    recommended_vehicle_id: Mapped[int] = mapped_column(ForeignKey('vehicle_specs.id'), nullable=False)
    service_mode: Mapped[str] = mapped_column(String(20), nullable=False)

    subtotal_usd: Mapped[float] = mapped_column(Float, nullable=False)
    surcharge_usd: Mapped[float] = mapped_column(Float, nullable=False)
    discount_usd: Mapped[float] = mapped_column(Float, nullable=False)
    final_usd: Mapped[float] = mapped_column(Float, nullable=False)
    final_krw: Mapped[float] = mapped_column(Float, nullable=False)
    pricing_breakdown: Mapped[dict] = mapped_column(JSON, nullable=False)

    status: Mapped[str] = mapped_column(String(30), default='issued')
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    user = relationship('User', back_populates='quotes')
    vehicle = relationship('VehicleSpec')
