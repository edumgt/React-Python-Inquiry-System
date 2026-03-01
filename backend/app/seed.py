from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models import ExchangeRate, Quote, TariffRate, User, VehicleSpec
from app.services.quote_calculator import QuoteInput, calculate_quote
from app.utils import generate_quote_no


def _seed_users(db: Session) -> None:
    if db.query(User).count() > 0:
        return

    users = [
        User(
            email='admin@inquiry.local',
            full_name='Admin Manager',
            company_name='Inquiry HQ',
            role='admin',
            tier='VIP',
            hashed_password=get_password_hash('Admin123!'),
        ),
        User(
            email='agent.alpha@globalfreight.com',
            full_name='James Carter',
            company_name='Global Freight Partners',
            role='user',
            tier='GOLD',
            hashed_password=get_password_hash('Agent123!'),
        ),
        User(
            email='agent.beta@oceangate.com',
            full_name='Sofia Lee',
            company_name='Ocean Gate Logistics',
            role='user',
            tier='STANDARD',
            hashed_password=get_password_hash('Agent123!'),
        ),
    ]
    db.add_all(users)
    db.commit()


def _seed_vehicles(db: Session) -> None:
    if db.query(VehicleSpec).count() > 0:
        return

    vehicles = [
        VehicleSpec(vehicle_name='1T Van', tonnage=1.0, max_weight_kg=1000, load_length_cm=280, load_width_cm=160, load_height_cm=160),
        VehicleSpec(vehicle_name='2.5T Truck', tonnage=2.5, max_weight_kg=2500, load_length_cm=430, load_width_cm=190, load_height_cm=180),
        VehicleSpec(vehicle_name='5T Truck', tonnage=5.0, max_weight_kg=5000, load_length_cm=620, load_width_cm=230, load_height_cm=230),
        VehicleSpec(vehicle_name='11T Truck', tonnage=11.0, max_weight_kg=11000, load_length_cm=960, load_width_cm=240, load_height_cm=260),
    ]
    db.add_all(vehicles)
    db.commit()


def _seed_exchange_rate(db: Session) -> None:
    if db.query(ExchangeRate).count() > 0:
        return

    rate = ExchangeRate(currency='USD', rate_to_krw=1320.0)
    db.add(rate)
    db.commit()


def _seed_tariffs(db: Session) -> None:
    if db.query(TariffRate).count() > 0:
        return

    vehicle_map = {v.vehicle_name: v.id for v in db.query(VehicleSpec).all()}
    routes = [
        ('Busan Port', 'Seoul Metro'),
        ('Busan Port', 'Incheon'),
        ('Busan Port', 'Gyeonggi South'),
        ('Incheon Port', 'Seoul Metro'),
        ('Incheon Port', 'Daejeon'),
    ]

    rows = []
    for origin, region in routes:
        rows.extend(
            [
                TariffRate(
                    origin=origin,
                    destination_region=region,
                    vehicle_spec_id=vehicle_map['1T Van'],
                    base_price_usd=180,
                    lcl_price_usd_per_cbm=42,
                    overweight_surcharge_usd_per_ton=85,
                    size_surcharge_pct=12,
                ),
                TariffRate(
                    origin=origin,
                    destination_region=region,
                    vehicle_spec_id=vehicle_map['2.5T Truck'],
                    base_price_usd=290,
                    lcl_price_usd_per_cbm=38,
                    overweight_surcharge_usd_per_ton=80,
                    size_surcharge_pct=10,
                ),
                TariffRate(
                    origin=origin,
                    destination_region=region,
                    vehicle_spec_id=vehicle_map['5T Truck'],
                    base_price_usd=470,
                    lcl_price_usd_per_cbm=35,
                    overweight_surcharge_usd_per_ton=75,
                    size_surcharge_pct=8,
                ),
                TariffRate(
                    origin=origin,
                    destination_region=region,
                    vehicle_spec_id=vehicle_map['11T Truck'],
                    base_price_usd=820,
                    lcl_price_usd_per_cbm=31,
                    overweight_surcharge_usd_per_ton=72,
                    size_surcharge_pct=6,
                ),
            ]
        )

    db.add_all(rows)
    db.commit()


def _seed_quotes(db: Session) -> None:
    if db.query(Quote).count() > 0:
        return

    users = db.query(User).filter(User.role == 'user').all()
    if not users:
        return

    samples = [
        {
            'user': users[0],
            'origin': 'Busan Port',
            'destination_region': 'Seoul Metro',
            'destination_address': '101 Teheran-ro, Gangnam-gu, Seoul, KR',
            'package_count': 12,
            'total_weight_kg': 1480,
            'total_cbm': 8.5,
            'cargo_length_cm': 380,
            'cargo_width_cm': 170,
            'cargo_height_cm': 170,
        },
        {
            'user': users[0],
            'origin': 'Incheon Port',
            'destination_region': 'Daejeon',
            'destination_address': '22 Expo-ro, Yuseong-gu, Daejeon, KR',
            'package_count': 6,
            'total_weight_kg': 720,
            'total_cbm': 4.1,
            'cargo_length_cm': 250,
            'cargo_width_cm': 150,
            'cargo_height_cm': 160,
        },
        {
            'user': users[1],
            'origin': 'Busan Port',
            'destination_region': 'Incheon',
            'destination_address': '150 Songdo-dong, Yeonsu-gu, Incheon, KR',
            'package_count': 18,
            'total_weight_kg': 3320,
            'total_cbm': 12.4,
            'cargo_length_cm': 560,
            'cargo_width_cm': 210,
            'cargo_height_cm': 220,
        },
        {
            'user': users[1],
            'origin': 'Busan Port',
            'destination_region': 'Gyeonggi South',
            'destination_address': '77 Gwanggyo-ro, Suwon-si, KR',
            'package_count': 9,
            'total_weight_kg': 950,
            'total_cbm': 5.6,
            'cargo_length_cm': 310,
            'cargo_width_cm': 160,
            'cargo_height_cm': 165,
        },
    ]

    for i, sample in enumerate(samples, start=1):
        quote_input = QuoteInput(
            origin=sample['origin'],
            destination_region=sample['destination_region'],
            total_weight_kg=sample['total_weight_kg'],
            total_cbm=sample['total_cbm'],
            cargo_length_cm=sample['cargo_length_cm'],
            cargo_width_cm=sample['cargo_width_cm'],
            cargo_height_cm=sample['cargo_height_cm'],
        )
        result = calculate_quote(db, sample['user'], quote_input)

        db.add(
            Quote(
                quote_no=generate_quote_no(i),
                user_id=sample['user'].id,
                origin=sample['origin'],
                destination_region=sample['destination_region'],
                destination_address=sample['destination_address'],
                package_count=sample['package_count'],
                total_weight_kg=sample['total_weight_kg'],
                total_cbm=sample['total_cbm'],
                cargo_length_cm=sample['cargo_length_cm'],
                cargo_width_cm=sample['cargo_width_cm'],
                cargo_height_cm=sample['cargo_height_cm'],
                recommended_vehicle_id=result.recommended_vehicle.id,
                service_mode=result.service_mode,
                subtotal_usd=result.subtotal_usd,
                surcharge_usd=result.surcharge_usd,
                discount_usd=result.discount_usd,
                final_usd=result.final_usd,
                final_krw=result.final_krw,
                pricing_breakdown=result.pricing_breakdown,
                status='issued',
            )
        )
    db.commit()


def seed_data(db: Session) -> None:
    _seed_users(db)
    _seed_vehicles(db)
    _seed_exchange_rate(db)
    _seed_tariffs(db)
    _seed_quotes(db)
