# Use an official lightweight Python image
FROM python:3.11-slim

# Set environment variables
# PYTHONUNBUFFERED=1 ensures logs are printed immediately
ENV PYTHONUNBUFFERED=1 \
  POETRY_VERSION=1.7.1 \
  POETRY_VIRTUALENVS_CREATE=false

# Set work directory
WORKDIR /app

# Install system dependencies (if needed) and Poetry
RUN pip install "poetry==$POETRY_VERSION"

# Copy only dependencies first to leverage Docker cache
COPY pyproject.toml poetry.lock* /app/

# Install dependencies via Poetry
# --no-interaction: Do not ask interactive questions
# --no-ansi: Disable ANSI output
# --no-root: Do not install the current project package (we copy code next)
RUN poetry install --no-interaction --no-ansi --no-root

# Copy the rest of the application code
COPY . /app

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]