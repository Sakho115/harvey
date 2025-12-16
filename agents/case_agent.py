"""
Case Agent
----------
Role:
- Create, update, and manage compliance cases
- Persist system findings over time
- Maintain case lifecycle and audit history

This agent is STATEFUL and AUTHORITATIVE.
"""

import json
import os
from datetime import datetime
from typing import Dict, List

# -----------------------------
# Storage configuration
# -----------------------------
CASE_DB_PATH = "cases"
CASE_INDEX_FILE = os.path.join(CASE_DB_PATH, "index.json")


# -----------------------------
# Utility functions
# -----------------------------
def _now() -> str:
    """Return current UTC timestamp"""
    return datetime.utcnow().isoformat() + "Z"


def _ensure_db():
    """Ensure case storage exists"""
    os.makedirs(CASE_DB_PATH, exist_ok=True)
    if not os.path.exists(CASE_INDEX_FILE):
        with open(CASE_INDEX_FILE, "w") as f:
            json.dump(
                {"last_case_number": 0, "cases": []},
                f,
                indent=2
            )


def _load_index() -> Dict:
    with open(CASE_INDEX_FILE, "r") as f:
        return json.load(f)


def _save_index(index: Dict):
    with open(CASE_INDEX_FILE, "w") as f:
        json.dump(index, f, indent=2)


# -----------------------------
# Case ID generation
# -----------------------------
def _generate_case_id() -> str:
    _ensure_db()
    index = _load_index()
    index["last_case_number"] += 1
    case_id = f"CASE-2025-{index['last_case_number']:04d}"
    _save_index(index)
    return case_id


# -----------------------------
# Case creation
# -----------------------------
def create_case(
    data_result: Dict,
    risk_result: Dict,
    compliance_result: Dict
) -> Dict:
    """
    Create a new compliance case
    """

    _ensure_db()

    case_id = _generate_case_id()
    case_file = os.path.join(CASE_DB_PATH, f"{case_id}.json")

    case = {
        "case_id": case_id,
        "case_type": "PROPERTY_REGISTRATION_COMPLIANCE",
        "status": "OPEN",
        "priority": compliance_result.get("severity", "LOW"),
        "created_at": _now(),
        "last_updated": _now(),

        # Deterministic outputs
        "compliance_status": compliance_result.get("compliance_status"),
        "violated_rules": compliance_result.get("violated_rules", []),
        "risk_level": risk_result.get("risk_level"),
        "risk_flags": risk_result.get("risk_flags", []),

        # Evidence
        "summary_metrics": data_result.get("derived_metrics", {}),
        "non_compliant_transactions": compliance_result.get(
            "non_compliant_transactions", []
        ),

        # Case history (audit trail)
        "history": [
            {
                "timestamp": _now(),
                "event": "CASE_CREATED",
                "details": "Automated compliance violation detected"
            }
        ]
    }

    # Persist case file
    with open(case_file, "w") as f:
        json.dump(case, f, indent=2)

    # Register case in index
    index = _load_index()
    index["cases"].append({
        "case_id": case_id,
        "status": case["status"],
        "priority": case["priority"],
        "risk_level": case["risk_level"],
        "created_at": case["created_at"]
    })
    _save_index(index)

    return case


# -----------------------------
# Case update
# -----------------------------
def update_case(
    case_id: str,
    new_status: str,
    update_reason: str,
    updates: Dict = None
) -> Dict:
    """
    Update case status or metadata
    """

    case_file = os.path.join(CASE_DB_PATH, f"{case_id}.json")

    if not os.path.exists(case_file):
        raise FileNotFoundError(f"Case {case_id} not found")

    with open(case_file, "r") as f:
        case = json.load(f)

    # Apply updates
    if updates:
        case.update(updates)

    case["status"] = new_status
    case["last_updated"] = _now()

    case["history"].append({
        "timestamp": _now(),
        "event": "CASE_UPDATED",
        "details": update_reason
    })

    with open(case_file, "w") as f:
        json.dump(case, f, indent=2)

    return case


# -----------------------------
# Case retrieval
# -----------------------------
def get_case(case_id: str) -> Dict:
    case_file = os.path.join(CASE_DB_PATH, f"{case_id}.json")

    if not os.path.exists(case_file):
        raise FileNotFoundError(f"Case {case_id} not found")

    with open(case_file, "r") as f:
        return json.load(f)


def list_cases() -> List[Dict]:
    _ensure_db()
    index = _load_index()
    return index.get("cases", [])


# -----------------------------
# Case Agent entry point
# -----------------------------
def run_case_agent(
    data_result: Dict,
    risk_result: Dict,
    compliance_result: Dict
) -> Dict:
    """
    Main entry point for the Case Agent.
    Converts agent outputs into a tracked compliance case.
    """
    return create_case(
        data_result=data_result,
        risk_result=risk_result,
        compliance_result=compliance_result
    )

