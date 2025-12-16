"""
Supervisor Agent
----------------
Role:
- Explains and recommends actions based on an authoritative CASE FILE
- Does NOT calculate risk or legality
- Acts as the final decision explainer for government officers
"""

import json
from typing import Dict
from llm.gemini_client import call_gemini


# -----------------------------
# Prompt Builder
# -----------------------------
def build_supervisor_prompt(case_result: Dict) -> str:
    """
    Build the prompt for the Supervisor LLM.
    Uses ONLY the case file.
    Deterministic. No LLM calls here.
    """

    return f"""
You are Harvey, an AI governance supervisor assisting a government officer.

STRICT RULES:
- You do NOT calculate risk, legality, or compliance.
- You ONLY explain and recommend actions using the provided case file.
- Do NOT add new facts.
- Do NOT speculate.
- Do NOT repeat the input verbatim.

--- CASE DETAILS ---
Case ID: {case_result["case_id"]}
Case Type: {case_result["case_type"]}
Status: {case_result["status"]}
Priority: {case_result["priority"]}

--- COMPLIANCE STATUS ---
Compliance Status: {case_result["compliance_status"]}
Violated Rules: {case_result["violated_rules"]}

--- RISK PROFILE ---
Risk Level: {case_result["risk_level"]}
Risk Flags: {case_result["risk_flags"]}

--- EVIDENCE SUMMARY ---
Aggregate Undervaluation Ratio: {case_result["summary_metrics"].get("aggregate_undervaluation_ratio")}
Number of Non-Compliant Transactions: {len(case_result["non_compliant_transactions"])}

--- YOUR TASK ---
1. Summarize why this case was created.
2. Explain the seriousness in clear, non-technical language.
3. Recommend next actions for the officer.
4. Provide a confidence score between 0 and 1.

--- OUTPUT FORMAT ---
Respond with STRICTLY VALID JSON ONLY.
No markdown.
No explanations.
No extra text.

JSON keys:
- case_summary (string)
- decision_rationale (string)
- recommended_next_steps (array of strings)
- confidence (number between 0 and 1)
""".strip()


# -----------------------------
# Post-processing helpers
# -----------------------------
def cap_confidence(confidence: float, priority: str) -> float:
    try:
        confidence = float(confidence)
    except Exception:
        confidence = 0.85

    if priority == "CRITICAL":
        return min(confidence, 0.95)
    if priority == "HIGH":
        return min(confidence, 0.9)
    return min(confidence, 0.85)


def enrich_actions(actions: list, priority: str) -> list:
    base_actions = actions if isinstance(actions, list) else []

    if priority == "CRITICAL":
        extra = [
            "Freeze further registration of the flagged properties",
            "Cross-verify declared property values with official circle rate records",
            "Issue notices to buyers, sellers, and registering officials",
            "Escalate repeated violations to the enforcement wing for prosecution review"
        ]
        return list(dict.fromkeys(base_actions + extra))

    if priority == "HIGH":
        extra = [
            "Initiate detailed audit of flagged transactions",
            "Seek clarification from registering authority",
            "Monitor related registrations for similar patterns"
        ]
        return list(dict.fromkeys(base_actions + extra))

    return base_actions


def generate_officer_summary(case_result: Dict) -> str:
    if case_result["compliance_status"] == "COMPLIANT":
        return (
            "The reviewed property transactions comply with valuation and "
            "stamp duty requirements. No enforcement action is required."
        )

    return (
        "The case indicates valuation irregularities and stamp duty issues "
        "that require review by the concerned authority."
    )


# -----------------------------
# Supervisor Agent Executor
# -----------------------------
def run_supervisor_agent(case_result: Dict) -> Dict:
    """
    Executes the Supervisor Agent:
    - Builds the prompt from the case file
    - Calls Gemini
    - Cleans & parses JSON safely
    - Applies governance-safe post-processing
    """

    prompt = build_supervisor_prompt(case_result)
    raw_response = call_gemini(prompt)

    if not raw_response or not raw_response.strip():
        raise RuntimeError("Supervisor Agent returned an empty response")

    # -----------------------------
    # HARDENED JSON CLEANING (FINAL)
    # -----------------------------
    cleaned = raw_response.strip()

    # Handle markdown-wrapped JSON from LLMs
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`").strip()

        # Remove optional 'json' language hint
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:].strip()

    try:
        supervisor_output = json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"Supervisor Agent returned invalid JSON:\n{raw_response}"
        ) from e

    # -----------------------------
    # Schema validation
    # -----------------------------
    required_keys = {
        "case_summary",
        "decision_rationale",
        "recommended_next_steps",
        "confidence",
    }

    missing_keys = required_keys - supervisor_output.keys()
    if missing_keys:
        raise ValueError(
            f"Supervisor Agent response missing keys: {missing_keys}"
        )

    # -----------------------------
    # Governance-safe post-processing
    # -----------------------------
    priority = case_result.get("priority", "UNKNOWN")

    supervisor_output["confidence"] = cap_confidence(
        supervisor_output.get("confidence"),
        priority
    )

    supervisor_output["recommended_next_steps"] = enrich_actions(
        supervisor_output.get("recommended_next_steps"),
        priority
    )

    supervisor_output["officer_summary"] = generate_officer_summary(case_result)
    supervisor_output["case_id"] = case_result["case_id"]

    return supervisor_output

