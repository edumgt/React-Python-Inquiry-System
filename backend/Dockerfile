FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt /app/requirements.txt
# Copy pre-downloaded wheels directory (populated by scripts/airgap-save.sh for AIRGAP=1 builds)
COPY vendor/ /app/vendor/

# AIRGAP=1: install from pre-downloaded wheels in backend/vendor/ (no network required)
# AIRGAP=0 (default): install from PyPI as normal
ARG AIRGAP=0
RUN if [ "$AIRGAP" = "1" ]; then \
      pip install --no-cache-dir --no-index --find-links=/app/vendor -r /app/requirements.txt; \
    else \
      pip install --no-cache-dir -r /app/requirements.txt; \
    fi

COPY app /app/app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
