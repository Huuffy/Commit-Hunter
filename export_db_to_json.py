"""
Export SQLite DB data to static JSON files for frontend-only Vercel deployment.

Usage:
    python export_db_to_json.py

Reads: backend/data/commit_collector.db
Writes: frontend/public/data/teams.json
        frontend/public/data/event-status.json
        frontend/public/data/analytics/{team_name}.json
"""

import sqlite3
import json
import os

DB_PATH = os.path.join("backend", "commit_collector.db")
OUT_DIR = os.path.join("frontend", "public", "data")
ANALYTICS_DIR = os.path.join(OUT_DIR, "analytics")

os.makedirs(ANALYTICS_DIR, exist_ok=True)

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row


def parse_json_field(val):
    if val is None:
        return []
    if isinstance(val, str):
        try:
            return json.loads(val)
        except json.JSONDecodeError:
            return []
    return val


# --- 1. Export teams.json (mirrors GET /api/v1/history/teams) ---

# Find the active/running run
cur = conn.execute("SELECT id FROM collection_runs WHERE status='running' ORDER BY id DESC LIMIT 1")
run_row = cur.fetchone()
run_id = run_row["id"] if run_row else None

teams = conn.execute("SELECT * FROM teams").fetchall()
scores = []
if run_id:
    scores = conn.execute("SELECT * FROM team_scores WHERE run_id=?", (run_id,)).fetchall()

score_map = {s["team_name"]: s for s in scores}

teams_json = []
for t in teams:
    s = score_map.get(t["name"])
    teams_json.append({
        "team_name": t["name"],
        "repo_url": t["repo_url"],
        "commit_count": s["commit_count"] if s else 0,
        "additions": s["additions"] if s else 0,
        "deletions": s["deletions"] if s else 0,
        "churn_rate": s["churn_rate"] if s else 0.0,
        "productivity_score": s["productivity_score"] if s else 0.0,
        "is_finalized": bool(s["is_finalized"]) if s else False,
        "final_review": s["final_review"] if s else None,
    })

with open(os.path.join(OUT_DIR, "teams.json"), "w") as f:
    json.dump(teams_json, f, indent=2)
print(f"Exported {len(teams_json)} teams to teams.json")


# --- 2. Export event-status.json ---

event = conn.execute("SELECT * FROM event_config ORDER BY id DESC LIMIT 1").fetchone()
event_json = {
    "is_active": bool(event["is_active"]) if event else False,
    "event_start_time": event["event_start_time"] if event else None,
    "event_end_time": event["event_end_time"] if event else None,
    "static_mode": True,
}

with open(os.path.join(OUT_DIR, "event-status.json"), "w") as f:
    json.dump(event_json, f, indent=2)
print("Exported event-status.json")


# --- 3. Export per-team analytics (mirrors GET /api/v1/history/analytics/{team_name}) ---

for t in teams:
    team_name = t["name"]

    # Find latest score
    ts = conn.execute(
        "SELECT * FROM team_scores WHERE team_name=? ORDER BY id DESC LIMIT 1",
        (team_name,)
    ).fetchone()

    analytics = None
    if ts:
        analytics = conn.execute(
            "SELECT * FROM team_analytics WHERE team_score_id=?",
            (ts["id"],)
        ).fetchone()

    # Fetch recent commits
    commits = conn.execute(
        "SELECT * FROM commits WHERE team_name=? ORDER BY date DESC LIMIT 20",
        (team_name,)
    ).fetchall()

    recent_commits = []
    for c in commits:
        recent_commits.append({
            "message": c["message"],
            "author_name": c["author_name"],
            "score": c["ai_score"] or 0,
            "summary": c["ai_explanation"] or "No summary available",
            "url": c["url"],
            "date": c["date"],
        })

    analytics_json = {
        "team_name": team_name,
        "commit_count": ts["commit_count"] if ts else 0,
        "additions": ts["additions"] if ts else 0,
        "deletions": ts["deletions"] if ts else 0,
        "churn_rate": ts["churn_rate"] if ts else 0.0,
        "productivity_score": ts["productivity_score"] if ts else 0.0,
        "hourly_commits": parse_json_field(analytics["hourly_commits"]) if analytics else [0]*24,
        "hourly_volume": parse_json_field(analytics["hourly_volume"]) if analytics else [0]*24,
        "top_contributors": parse_json_field(analytics["top_contributors"]) if analytics else [],
        "top_files": parse_json_field(analytics["top_files"]) if analytics else [],
        "top_folders": parse_json_field(analytics["top_folders"]) if analytics else [],
        "file_types": parse_json_field(analytics["file_types"]) if analytics else [],
        "recent_commits": recent_commits,
        "final_review": ts["final_review"] if ts else None,
    }

    filename = f"{team_name}.json"
    with open(os.path.join(ANALYTICS_DIR, filename), "w") as f:
        json.dump(analytics_json, f, indent=2)
    print(f"Exported analytics for '{team_name}'")


conn.close()
print("\nDone! Static data exported to frontend/public/data/")
