"""
YardSight AI (GodownOS) - Enterprise Database Configuration
SQLAlchemy 2.0 Engine with SQLite WAL (Write-Ahead Logging) Mode.
Provides sub-millisecond local reads/writes, ACID transactions, and zero external infrastructure requirements.
"""

import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = os.environ.get("YARDSIGHT_DATABASE_URL", f"sqlite:///{os.path.join(DATABASE_DIR, 'yardsight.db')}")

# Create engine with connect_args for SQLite WAL mode and thread safety
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False
)

# Enable SQLite WAL mode and foreign key constraints for maximum concurrency and integrity
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL;")
    cursor.execute("PRAGMA synchronous=NORMAL;")
    cursor.execute("PRAGMA foreign_keys=ON;")
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
