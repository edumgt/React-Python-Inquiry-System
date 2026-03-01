from datetime import UTC, datetime


def generate_quote_no(sequence: int) -> str:
    date_part = datetime.now(UTC).strftime('%Y%m%d')
    return f'Q-{date_part}-{sequence:05d}'
