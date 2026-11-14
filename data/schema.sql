-- SQLite local (sql.js / WebAssembly). Esquema versionado 1.
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS task_progress (
    study_date TEXT NOT NULL,
    task_index INTEGER NOT NULL CHECK(task_index BETWEEN 0 AND 3),
    completed INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0,1)),
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (study_date, task_index)
);
CREATE TABLE IF NOT EXISTS day_journal (
    study_date TEXT PRIMARY KEY,
    notes TEXT NOT NULL DEFAULT '',
    questions_correct INTEGER NOT NULL DEFAULT 0 CHECK(questions_correct >= 0),
    questions_total INTEGER NOT NULL DEFAULT 0 CHECK(questions_total >= 0),
    confidence INTEGER NOT NULL DEFAULT 3 CHECK(confidence BETWEEN 1 AND 5),
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS error_notebook (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    study_date TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    reviewed INTEGER NOT NULL DEFAULT 0 CHECK(reviewed IN (0,1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS focus_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    study_date TEXT NOT NULL,
    minutes INTEGER NOT NULL CHECK(minutes BETWEEN 1 AND 120),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS quotes (
    study_date TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'api'
);
CREATE TABLE IF NOT EXISTS preferences (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_error_date ON error_notebook(study_date);
CREATE INDEX IF NOT EXISTS ix_focus_date ON focus_sessions(study_date);
