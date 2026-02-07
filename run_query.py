"""Run SQL queries against Allium's Explorer API."""

import json
import os
import sys
import time

import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.environ["ALLIUM_API_KEY"]
BASE = "https://api.allium.so/api/v1/explorer"
HEADERS = {"X-API-KEY": API_KEY, "Content-Type": "application/json"}


def run_sql(sql: str, title: str = "ad-hoc", limit: int = 10000) -> list[dict]:
    """Create a query, run it, poll until done, return rows."""
    # Create
    resp = requests.post(
        f"{BASE}/queries",
        headers=HEADERS,
        json={"title": title, "config": {"sql": sql, "limit": limit}},
    )
    resp.raise_for_status()
    query_id = resp.json()["query_id"]

    # Run
    resp = requests.post(
        f"{BASE}/queries/{query_id}/run-async",
        headers=HEADERS,
        json={"parameters": {}},
    )
    resp.raise_for_status()
    run_id = resp.json()["run_id"]

    # Poll
    for _ in range(120):
        resp = requests.get(
            f"{BASE}/query-runs/{run_id}/status", headers=HEADERS
        )
        resp.raise_for_status()
        status = resp.json()
        if status == "success":
            break
        if status == "failed":
            raise RuntimeError(f"Query failed: {run_id}")
        time.sleep(5)
    else:
        raise TimeoutError(f"Query timed out after 10 min: {run_id}")

    # Results
    resp = requests.get(f"{BASE}/query-runs/{run_id}/results", headers=HEADERS)
    resp.raise_for_status()
    return resp.json()["data"]


def run_sql_file(path: str) -> list[dict]:
    """Read a .sql file and execute it."""
    with open(path) as f:
        sql = f.read()
    title = os.path.basename(path)
    print(f"Running {title}...", file=sys.stderr)
    rows = run_sql(sql, title=title)
    print(f"  -> {len(rows)} rows", file=sys.stderr)
    return rows


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: uv run run_query.py <sql_file_or_inline_sql>")
        sys.exit(1)

    arg = sys.argv[1]
    if arg.endswith(".sql"):
        rows = run_sql_file(arg)
    else:
        rows = run_sql(arg, title="inline")

    print(json.dumps(rows, indent=2))
