import json
import re
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path(__file__).parent / "monasteries.db"

SECTION_KEYS = ["overview", "history", "architecture", "rituals", "bestVisitTime", "travelInfo"]


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, timeout=5)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = get_connection()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS monasteries (
            id TEXT PRIMARY KEY,
            slug TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            location TEXT NOT NULL,
            altitude TEXT NOT NULL,
            founded TEXT NOT NULL,
            short_description TEXT NOT NULL,
            hero_image_url TEXT NOT NULL,
            gallery TEXT NOT NULL,
            sections TEXT NOT NULL,
            historical_period TEXT NOT NULL,
            source_references TEXT NOT NULL,
            is_published INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


def slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return slug or uuid.uuid4().hex[:8]


def _row_to_dict(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "slug": row["slug"],
        "name": row["name"],
        "location": row["location"],
        "altitude": row["altitude"],
        "founded": row["founded"],
        "shortDescription": row["short_description"],
        "heroImageUrl": row["hero_image_url"],
        "gallery": json.loads(row["gallery"]),
        "sections": json.loads(row["sections"]),
        "historicalPeriod": row["historical_period"],
        "sourceReferences": row["source_references"],
        "isPublished": bool(row["is_published"]),
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }


def create_monastery(data: dict) -> dict:
    monastery_id = uuid.uuid4().hex
    slug = data.get("slug", "").strip() or slugify(data["name"])
    now = datetime.now(timezone.utc).isoformat()
    conn = get_connection()
    conn.execute(
        """
        INSERT INTO monasteries
            (id, slug, name, location, altitude, founded, short_description, hero_image_url,
             gallery, sections, historical_period, source_references, is_published, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            monastery_id,
            slug,
            data["name"],
            data.get("location", ""),
            data.get("altitude", ""),
            data.get("founded", ""),
            data.get("shortDescription", ""),
            data.get("heroImageUrl", ""),
            json.dumps([g for g in data.get("gallery", []) if g.strip()]),
            json.dumps({k: v for k, v in data.get("sections", {}).items() if v.strip()}),
            data.get("historicalPeriod", ""),
            data.get("sourceReferences", ""),
            1 if data.get("isPublished") else 0,
            now,
            now,
        ),
    )
    conn.commit()
    conn.close()
    return get_monastery(monastery_id)


def update_monastery(monastery_id: str, data: dict) -> dict | None:
    existing = get_monastery(monastery_id)
    if existing is None:
        return None
    now = datetime.now(timezone.utc).isoformat()
    conn = get_connection()
    conn.execute(
        """
        UPDATE monasteries SET
            slug = ?, name = ?, location = ?, altitude = ?, founded = ?, short_description = ?,
            hero_image_url = ?, gallery = ?, sections = ?, historical_period = ?,
            source_references = ?, is_published = ?, updated_at = ?
        WHERE id = ?
        """,
        (
            data.get("slug", "").strip() or existing["slug"],
            data.get("name", existing["name"]),
            data.get("location", existing["location"]),
            data.get("altitude", existing["altitude"]),
            data.get("founded", existing["founded"]),
            data.get("shortDescription", existing["shortDescription"]),
            data.get("heroImageUrl", existing["heroImageUrl"]),
            json.dumps([g for g in data.get("gallery", existing["gallery"]) if g.strip()]),
            json.dumps({k: v for k, v in data.get("sections", existing["sections"]).items() if v.strip()}),
            data.get("historicalPeriod", existing["historicalPeriod"]),
            data.get("sourceReferences", existing["sourceReferences"]),
            1 if data.get("isPublished", existing["isPublished"]) else 0,
            now,
            monastery_id,
        ),
    )
    conn.commit()
    conn.close()
    return get_monastery(monastery_id)


def delete_monastery(monastery_id: str) -> bool:
    conn = get_connection()
    cursor = conn.execute("DELETE FROM monasteries WHERE id = ?", (monastery_id,))
    conn.commit()
    conn.close()
    return cursor.rowcount > 0


def get_monastery(monastery_id: str) -> dict | None:
    conn = get_connection()
    row = conn.execute("SELECT * FROM monasteries WHERE id = ?", (monastery_id,)).fetchone()
    conn.close()
    return _row_to_dict(row) if row else None


def get_monastery_by_slug(slug: str) -> dict | None:
    conn = get_connection()
    row = conn.execute("SELECT * FROM monasteries WHERE slug = ?", (slug,)).fetchone()
    conn.close()
    return _row_to_dict(row) if row else None


def list_monasteries(published_only: bool = False) -> list[dict]:
    conn = get_connection()
    if published_only:
        rows = conn.execute(
            "SELECT * FROM monasteries WHERE is_published = 1 ORDER BY created_at DESC"
        ).fetchall()
    else:
        rows = conn.execute("SELECT * FROM monasteries ORDER BY created_at DESC").fetchall()
    conn.close()
    return [_row_to_dict(row) for row in rows]
