# Multi-stage / Production Dockerfile for MikoSocial Backend
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies for Pillow and PostgreSQL
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY . /app/

# Create media directory
RUN mkdir -p /app/media /app/staticfiles

# Expose Daphne ASGI server port
EXPOSE 8000

# Default command: run migrations and start Daphne ASGI server
CMD ["sh", "-c", "python manage.py migrate && daphne -b 0.0.0.0 -p 8000 mikosocial.asgi:application"]
