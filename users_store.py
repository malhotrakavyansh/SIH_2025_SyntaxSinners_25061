import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path

import bcrypt

DB_PATH = Path(__file__).parent / "users.db"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, timeout=5)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = get_connection()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


def create_user(name: str, email: str, password: str, role: str = "contributor") -> dict:
    """Raises sqlite3.IntegrityError if the email is already registered."""
    user_id = uuid.uuid4().hex
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    conn = get_connection()
    conn.execute(
        "INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (user_id, name, email.lower().strip(), password_hash, role, datetime.now(timezone.utc).isoformat()),
    )
    conn.commit()
    conn.close()
    return {"id": user_id, "name": name, "email": email.lower().strip(), "role": role}


def verify_user(email: str, password: str) -> dict | None:
    """Returns the user dict (without password_hash) if the email/password match, else None."""
    conn = get_connection()
    row = conn.execute("SELECT * FROM users WHERE email = ?", (email.lower().strip(),)).fetchone()
    conn.close()
    if row is None:
        return None
    if not bcrypt.checkpw(password.encode(), row["password_hash"].encode()):
        return None
    return {"id": row["id"], "name": row["name"], "email": row["email"], "role": row["role"]}


def get_user_by_id(user_id: str) -> dict | None:
    conn = get_connection()
    row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    if row is None:
        return None
    return {"id": row["id"], "name": row["name"], "email": row["email"], "role": row["role"]}
