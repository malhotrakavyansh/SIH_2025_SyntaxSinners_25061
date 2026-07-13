import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path(__file__).parent / "bookings.db"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = get_connection()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS bookings (
            id TEXT PRIMARY KEY,
            order_id TEXT NOT NULL,
            booking_type TEXT NOT NULL,
            status TEXT NOT NULL,
            amount REAL NOT NULL,
            payload TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


def add_booking(booking_id: str, order_id: str, booking_type: str, amount: float, payload: dict) -> None:
    conn = get_connection()
    conn.execute(
        """
        INSERT INTO bookings (id, order_id, booking_type, status, amount, payload, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            booking_id,
            order_id,
            booking_type,
            "confirmed",
            amount,
            json.dumps(payload),
            datetime.now(timezone.utc).isoformat(),
        ),
    )
    conn.commit()
    conn.close()


def get_booking(booking_id: str) -> dict | None:
    conn = get_connection()
    row = conn.execute("SELECT * FROM bookings WHERE id = ?", (booking_id,)).fetchone()
    conn.close()
    if row is None:
        return None
    return _row_to_dict(row)


def list_bookings() -> list[dict]:
    conn = get_connection()
    rows = conn.execute("SELECT * FROM bookings ORDER BY created_at DESC").fetchall()
    conn.close()
    return [_row_to_dict(row) for row in rows]


def _row_to_dict(row: sqlite3.Row) -> dict:
    payload = json.loads(row["payload"])
    return {
        "id": row["id"],
        "orderId": row["order_id"],
        "status": row["status"],
        "amount": row["amount"],
        "date": row["created_at"],
        **payload,
    }
