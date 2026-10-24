"""
YardSight AI (GodownOS) - Enterprise Hybrid Cloud Database Architecture
Supports both Cloud-Hosted PostgreSQL (Supabase, Neon, AWS Aurora, Azure PostgreSQL)
and High-Concurrency Local SQLite in WAL (Write-Ahead Logging) Mode.
Engineered for 1,000 concurrent MVP connections up to 100,000 through PgBouncer/connection pooling.
"""

import os
import time
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import QueuePool, NullPool

DATABASE_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_DB_URL = (
    os.environ.get("DATABASE_URL")
    or os.environ.get("YARDSIGHT_DATABASE_URL")
    or "postgresql://postgres@localhost:5432/yardsight_db"
)

if RAW_DB_URL.startswith("postgres://"):
    DATABASE_URL = RAW_DB_URL.replace("postgres://", "postgresql://", 1)
else:
    DATABASE_URL = RAW_DB_URL

IS_POSTGRES = "postgresql" in DATABASE_URL

if IS_POSTGRES:
    # Production Cloud PostgreSQL Configuration with Connection Pooling & Pre-Ping
    engine = create_engine(
        DATABASE_URL,
        poolclass=QueuePool,
        pool_size=25,
        max_overflow=50,
        pool_timeout=30,
        pool_recycle=1800,
        pool_pre_ping=True,  # Automatically detects stale/disconnected cloud sockets
        echo=False
    )
else:
    # High-Concurrency Local SQLite in WAL Mode
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False
    )

    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        cursor.execute("PRAGMA synchronous=NORMAL;")
        cursor.execute("PRAGMA foreign_keys=ON;")
        cursor.execute("PRAGMA busy_timeout=5000;")
        cursor.execute("PRAGMA cache_size=-64000;")  # 64MB memory page cache
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """FastAPI dependency for database session injection."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def check_database_health() -> dict:
    """Verifies live database connectivity, dialect, and query roundtrip latency."""
    start_time = time.time()
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1;"))
        latency_ms = round((time.time() - start_time) * 1000, 2)
        return {
            "status": "HEALTHY",
            "dialect": "postgresql" if IS_POSTGRES else "sqlite",
            "connection_mode": "CLOUD_HOSTED_DATABASE" if IS_POSTGRES else "LOCAL_WAL_PERSISTENT",
            "latency_ms": latency_ms,
            "pool_size": getattr(engine.pool, "size", lambda: 1)(),
            "checked_in_connections": getattr(engine.pool, "checkedin", lambda: 1)(),
            "checked_out_connections": getattr(engine.pool, "checkedout", lambda: 0)()
        }
    except Exception as e:
        return {
            "status": "DEGRADED",
            "error": str(e),
            "dialect": "postgresql" if IS_POSTGRES else "sqlite"
        }
