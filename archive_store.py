import sqlite3
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path(__file__).parent / "archive.db"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = get_connection()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS archive_items (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            monastery TEXT NOT NULL,
            type TEXT NOT NULL,
            year TEXT NOT NULL,
            location TEXT NOT NULL,
            image_filename TEXT NOT NULL,
            ocr_text TEXT NOT NULL,
            tags TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


def add_item(item: dict) -> None:
    conn = get_connection()
    conn.execute(
        """
        INSERT INTO archive_items
            (id, title, monastery, type, year, location, image_filename, ocr_text, tags, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            item["id"],
            item["title"],
            item["monastery"],
            item["type"],
            item["year"],
            item["location"],
            item["image_filename"],
            item["ocr_text"],
            ",".join(item["tags"]),
            datetime.now(timezone.utc).isoformat(),
        ),
    )
    conn.commit()
    conn.close()


def list_items() -> list[dict]:
    conn = get_connection()
    rows = conn.execute("SELECT * FROM archive_items ORDER BY created_at DESC").fetchall()
    conn.close()
    return [
        {
            "id": row["id"],
            "title": row["title"],
            "monastery": row["monastery"],
            "type": row["type"],
            "year": row["year"],
            "location": row["location"],
            "image_filename": row["image_filename"],
            "ocrText": row["ocr_text"],
            "tags": row["tags"].split(",") if row["tags"] else [],
        }
        for row in rows
    ]
