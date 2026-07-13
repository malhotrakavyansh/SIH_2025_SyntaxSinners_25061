import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path(__file__).parent / "submissions.db"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, timeout=5)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = get_connection()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS submissions (
            id TEXT PRIMARY KEY,
            contributor_id TEXT NOT NULL,
            contributor_name TEXT NOT NULL,
            title TEXT NOT NULL,
            monastery TEXT NOT NULL,
            type TEXT NOT NULL,
            year TEXT NOT NULL,
            location TEXT NOT NULL,
            description TEXT NOT NULL,
            image_filename TEXT NOT NULL,
            ocr_text TEXT NOT NULL,
            tags TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            review_note TEXT,
            created_at TEXT NOT NULL,
            reviewed_at TEXT
        )
        """
    )
    conn.commit()
    conn.close()


def add_submission(item: dict) -> str:
    submission_id = uuid.uuid4().hex
    conn = get_connection()
    conn.execute(
        """
        INSERT INTO submissions
            (id, contributor_id, contributor_name, title, monastery, type, year, location,
             description, image_filename, ocr_text, tags, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
        """,
        (
            submission_id,
            item["contributor_id"],
            item["contributor_name"],
            item["title"],
            item["monastery"],
            item["type"],
            item["year"],
            item["location"],
            item.get("description", ""),
            item["image_filename"],
            item["ocr_text"],
            ",".join(item.get("tags", [])),
            datetime.now(timezone.utc).isoformat(),
        ),
    )
    conn.commit()
    conn.close()
    return submission_id


def _row_to_dict(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "contributorId": row["contributor_id"],
        "contributorName": row["contributor_name"],
        "title": row["title"],
        "monastery": row["monastery"],
        "type": row["type"],
        "year": row["year"],
        "location": row["location"],
        "description": row["description"],
        "imageFilename": row["image_filename"],
        "ocrText": row["ocr_text"],
        "tags": row["tags"].split(",") if row["tags"] else [],
        "status": row["status"],
        "reviewNote": row["review_note"],
        "createdAt": row["created_at"],
        "reviewedAt": row["reviewed_at"],
    }


def list_submissions(status: str | None = None) -> list[dict]:
    conn = get_connection()
    if status:
        rows = conn.execute(
            "SELECT * FROM submissions WHERE status = ? ORDER BY created_at DESC", (status,)
        ).fetchall()
    else:
        rows = conn.execute("SELECT * FROM submissions ORDER BY created_at DESC").fetchall()
    conn.close()
    return [_row_to_dict(row) for row in rows]


def list_submissions_by_contributor(contributor_id: str) -> list[dict]:
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM submissions WHERE contributor_id = ? ORDER BY created_at DESC",
        (contributor_id,),
    ).fetchall()
    conn.close()
    return [_row_to_dict(row) for row in rows]


def get_submission(submission_id: str) -> dict | None:
    conn = get_connection()
    row = conn.execute("SELECT * FROM submissions WHERE id = ?", (submission_id,)).fetchone()
    conn.close()
    return _row_to_dict(row) if row else None


def update_status(submission_id: str, status: str, review_note: str = "") -> dict | None:
    conn = get_connection()
    conn.execute(
        "UPDATE submissions SET status = ?, review_note = ?, reviewed_at = ? WHERE id = ?",
        (status, review_note, datetime.now(timezone.utc).isoformat(), submission_id),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM submissions WHERE id = ?", (submission_id,)).fetchone()
    conn.close()
    return _row_to_dict(row) if row else None
