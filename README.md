
# TED Tender Analyser
Prerequisites
* Docker and Git

# Getting Started
1. Environment Setup

Create a .env file in the root directory (same level as docker-compose.yml):

create a copy of `.env.example` and name it .env (can change to desired values but since we work locally its not )

2. Start the Application

Run the following command in the root directory:

`docker-compose up --build`


3. Wait for the logs to stabilize.

Frontend: Open http://localhost:5173
Backend Docs: Open http://localhost:8000/docs


4. Data Seeding (Ingestion)

The application supports "Live Search" out of the box. However, to use the Database Table View and Trend Analysis Graphs, you must seed the local MongoDB with historical data.
While the Docker containers are running, open a new terminal and run:

`docker-compose exec backend python -m app.scripts.ingest_ted`



## ABOUT
A full-stack Dockerized application to search, visualize, and analyze European Union public procurement notices using the TED (Tenders Electronic Daily) API.

🏗 Architecture

* uses a Microservices architecture orchestrated via Docker Compose.
* Frontend (/client): A React (Vite + TypeScript) Single Page Application.Styling: Tailwind CSS, Routing: React Router, Visualization: Recharts, Runs on: http://localhost:5173
* Backend (/server): A FastAPI (Python 3.11) REST API, Dependency Management: Poetry, Database Driver: Motor (Async MongoDB), Runs on: http://localhost:8000 (Docs at /docs)
* Database: MongoDB container, Runs on: localhost:27017


📝 Assumptions & Design Decisions

TED API Structure: We assume the TED API v3 structure remains consistent regarding field names (e.g., tender-value, publication-date).

Currency: For the trend analysis graph, we currently filter only for EUR values to ensure mathematical consistency.

Data Volatility: The ingestion script uses publication-number as a unique ID. If a notice is updated on TED with the same ID, our local copy will be overwritten (Upsert strategy).

Network: We assume ports 8000, 5173, and 27017 are free on the host machine.

🚧 Future Extensions

To make this project production-ready, the following extensions are recommended:

Reverse Proxy (Nginx): Currently, the Frontend talks directly to localhost:8000. In production, Nginx should serve the frontend and proxy /api requests to the backend to avoid CORS issues and expose a single port (80/443).

Authentication: Add JWT Authentication to the FastAPI backend to protect the Ingestion endpoints.

Celery/Redis: Move the ingest_ted script to a background worker queue (Celery) so it can be scheduled periodically (Cron) without blocking the main server.

Unit Testing: Add pytest for the backend and Vitest for the frontend.

⚠️ A Note on Code Quality & Constraints

Status: Proof of Concept / MVP

Due to strict time limitations during the development of this prototype, certain Best Practices were prioritized lower than feature completeness:

DRY (Don't Repeat Yourself): You may notice some code duplication between the "Live Search" logic and the "Database Search" logic. In a refactored version, these would share a common Service layer or Query Builder class to handle TED data transformation centrally.

Hardcoded Values: Lists of countries (DEU, POL, etc.) and products are defined in multiple places (Frontend constants and Backend scripts). Ideally, these should be served via a configuration endpoint or shared config file.

Type Safety: While TypeScript is used, some API responses use loose typing (any) for complex nested TED structures. A stricter type definition schema would be implemented in a production environment.