"""Refresh dashboard JSON data by running SQL queries against Allium."""

import json
import os
import time
from datetime import datetime, timezone

from run_query import run_sql_file

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "dashboard", "app", "generated")

# Map SQL price_bucket labels to display names and midpoints
BUCKET_MAP = {
    "01: 0-5%": ("0\u20135%", 2.5),
    "02: 5-10%": ("5\u201310%", 7.5),
    "03: 10-20%": ("10\u201320%", 15),
    "04: 20-30%": ("20\u201330%", 25),
    "05: 30-40%": ("30\u201340%", 35),
    "06: 40-50%": ("40\u201350%", 45),
    "07: 50% exact": ("50% exact", 50),
    "08: 50-60%": ("50\u201360%", 55),
    "09: 60-70%": ("60\u201370%", 65),
    "10: 70-80%": ("70\u201380%", 75),
    "11: 80-90%": ("80\u201390%", 85),
    "12: 90-95%": ("90\u201395%", 92.5),
    "13: 95-100%": ("95\u2013100%", 97.5),
}

# Quarter label: "2023-01" -> "2023-Q1", "2023-04" -> "2023-Q2", etc.
MONTH_TO_QUARTER = {"01": "Q1", "04": "Q2", "07": "Q3", "10": "Q4"}


def to_num(val):
    """Coerce string numbers from API to float/int."""
    if val is None:
        return None
    try:
        f = float(val)
        return int(f) if f == int(f) and isinstance(val, (int, str)) else f
    except (ValueError, TypeError):
        return val


def quarter_label(group_value: str) -> str:
    year, month = group_value.split("-")
    return f"{year}-{MONTH_TO_QUARTER.get(month, month)}"


def transform_calibration(rows: list[dict]) -> dict:
    """Query 01 -> calibration.json with binary/multi arrays."""
    binary = []
    multi = []
    for row in rows:
        bucket_key = row["price_bucket"]
        if bucket_key not in BUCKET_MAP or bucket_key == "07: 50% exact":
            continue
        display, midpoint = BUCKET_MAP[bucket_key]
        entry = {
            "bucket": display,
            "midpoint": midpoint,
            "winRate": to_num(row["actual_win_rate_pct"]),
            "bias": to_num(row["bias_pp"]),
            "n": to_num(row["n_tokens"]),
            "nQuestions": to_num(row["n_questions"]),
            "ciLo": to_num(row["win_rate_ci_lo_pct"]),
            "ciHi": to_num(row["win_rate_ci_hi_pct"]),
            "brierScore": to_num(row["brier_score"]),
        }
        if row["market_type"] == "binary":
            binary.append(entry)
        elif row["market_type"] == "multi_outcome":
            multi.append(entry)
    return {"binary": binary, "multi": multi}


def transform_query02(rows: list[dict]) -> tuple[list[dict], list[dict]]:
    """Query 02 -> (categories, quarters)."""
    # Pivot categories: group by category, collect binary/multi columns
    cat_map: dict[str, dict] = {}
    quarters_map: dict[str, dict] = {}

    for row in rows:
        if row["group_type"] == "category":
            cat = str(row["group_value"]).capitalize()
            if cat not in cat_map:
                cat_map[cat] = {"category": cat, "binaryAcc": None, "multiAcc": None, "binaryN": 0, "multiN": 0}
            if row["market_type"] == "binary":
                cat_map[cat]["binaryAcc"] = to_num(row["competitive_accuracy_pct"])
                cat_map[cat]["binaryN"] = to_num(row["n_competitive"])
            elif row["market_type"] == "multi_outcome":
                cat_map[cat]["multiAcc"] = to_num(row["competitive_accuracy_pct"])
                cat_map[cat]["multiN"] = to_num(row["n_competitive"])

        elif row["group_type"] == "quarter":
            q = quarter_label(row["group_value"])
            if q not in quarters_map:
                quarters_map[q] = {
                    "quarter": q,
                    "binaryAcc": None,
                    "multiAcc": None,
                    "binaryN": 0,
                    "multiN": 0,
                    "maxResolutionDate": None,
                }
            if row["market_type"] == "binary":
                quarters_map[q]["binaryAcc"] = to_num(row["competitive_accuracy_pct"])
                quarters_map[q]["binaryN"] = to_num(row["n_competitive"])
            elif row["market_type"] == "multi_outcome":
                quarters_map[q]["multiAcc"] = to_num(row["competitive_accuracy_pct"])
                quarters_map[q]["multiN"] = to_num(row["n_competitive"])
            # Track max resolution date for incomplete quarter detection
            if row["max_resolution_date"]:
                existing = quarters_map[q]["maxResolutionDate"]
                date_str = str(row["max_resolution_date"])
                if existing is None or date_str > existing:
                    quarters_map[q]["maxResolutionDate"] = date_str

    categories = sorted(cat_map.values(), key=lambda x: (x["multiN"] or 0) + (x["binaryN"] or 0), reverse=True)
    quarters = sorted(quarters_map.values(), key=lambda x: x["quarter"])
    return categories, quarters


def transform_sub_daily(rows: list[dict]) -> list[dict]:
    """Query 03 -> sub_daily.json."""
    return [
        {
            "horizon": row["horizon"],
            "marketType": row["market_type"],
            "nTokens": to_num(row["n_tokens"]),
            "accuracyPct": to_num(row["accuracy_pct"]),
            "brierScore": to_num(row["brier_score"]),
        }
        for row in rows
    ]


def compute_market_structure(rows01: list[dict]) -> dict:
    """Derive market structure totals from query 01 aggregates."""
    binary_tokens = 0
    multi_tokens = 0

    for row in rows01:
        if row["market_type"] == "binary":
            binary_tokens += to_num(row["n_tokens"])
        elif row["market_type"] == "multi_outcome":
            multi_tokens += to_num(row["n_tokens"])

    # n_questions from calibration buckets aren't additive (a question can appear in
    # multiple buckets). Use the sum of tokens as the analysis token count, and keep
    # the known structural numbers from the full dataset.
    return {
        "binary": {"tokens": 13108, "questions": 13108, "tokensPerQ": 1.0},
        "multi": {"tokens": 93876, "questions": 13160, "tokensPerQ": 7.1},
        "unknown": {"tokens": 1877, "questions": 1877},
        "total": {"tokens": 108861, "questions": 28145},
        "analysisTokens": {
            "binary": binary_tokens,
            "multi": multi_tokens,
            "total": binary_tokens + multi_tokens,
        },
    }


def write_json(filename: str, data) -> None:
    path = os.path.join(OUTPUT_DIR, filename)
    with open(path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"  Wrote {path}")


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Run queries sequentially with rate-limit pause
    print("Running query 01...")
    rows01 = run_sql_file("queries/01_accuracy_and_calibration.sql")
    time.sleep(2)

    print("Running query 02...")
    rows02 = run_sql_file("queries/02_by_category_and_quarter.sql")
    time.sleep(2)

    print("Running query 03...")
    rows03 = run_sql_file("queries/03_sub_daily_accuracy.sql")

    # Transform and write
    print("Transforming results...")
    calibration = transform_calibration(rows01)
    write_json("calibration.json", calibration)

    categories, quarters = transform_query02(rows02)
    write_json("categories.json", categories)
    write_json("quarters.json", quarters)

    write_json("sub_daily.json", transform_sub_daily(rows03))
    write_json("market_structure.json", compute_market_structure(rows01))

    metadata = {
        "refreshedAt": datetime.now(timezone.utc).isoformat(),
        "queries": [
            "queries/01_accuracy_and_calibration.sql",
            "queries/02_by_category_and_quarter.sql",
            "queries/03_sub_daily_accuracy.sql",
        ],
    }
    write_json("_metadata.json", metadata)

    print("Done!")


if __name__ == "__main__":
    main()
