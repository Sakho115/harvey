def run_compliance_agent(input_payload):
    """
    Input:
    {
        "circle_rate": number,
        "transactions": [...],
        "risk_flags": [...],
        "risk_level": string
    }
    """

    circle_rate = input_payload["circle_rate"]
    transactions = input_payload["transactions"]
    risk_flags = input_payload.get("risk_flags", [])
    risk_level = input_payload.get("risk_level", "LOW")

    violated_rules = []
    non_compliant_transactions = []

    severe_undervaluation_count = 0

    for idx, tx in enumerate(transactions, start=1):
        pv = tx["property_value"]
        stamp = tx["stamp_paid"]

        # Rule C1 — Zero value registration
        if pv <= 0:
            violated_rules.append("Registration Act §17 — Invalid property valuation")
            non_compliant_transactions.append({
                "transaction": idx,
                "violation": "ZERO_VALUE_REGISTRATION"
            })
            continue

        # Rule C2 — Severe undervaluation (<70%)
        if pv < 0.70 * circle_rate:
            severe_undervaluation_count += 1
            violated_rules.append("Stamp Act §27 — Undervaluation of property")
            non_compliant_transactions.append({
                "transaction": idx,
                "violation": "SEVERE_UNDERVALUATION"
            })

        # Rule C3 — Stamp duty evasion (>10%)
        expected_stamp = 0.05 * pv
        if expected_stamp > 0:
            deviation = abs(stamp - expected_stamp) / expected_stamp
            if deviation > 0.10:
                violated_rules.append("Stamp Act §33 — Improper stamp duty payment")
                non_compliant_transactions.append({
                    "transaction": idx,
                    "violation": "STAMP_DUTY_EVASION"
                })

    # Rule C4 — Systematic evasion
    if severe_undervaluation_count >= 3:
        violated_rules.append("IPC §420 — Systematic financial misrepresentation")

    # Deduplicate rules
    violated_rules = list(set(violated_rules))

    # Compliance severity
    if "IPC §420 — Systematic financial misrepresentation" in violated_rules:
        severity = "CRITICAL"
        compliance_status = "ILLEGAL"
        recommended_action = "IMMEDIATE_INVESTIGATION"

    elif len(violated_rules) >= 2 or risk_level == "HIGH":
        severity = "HIGH"
        compliance_status = "VIOLATION"
        recommended_action = "FIELD_INSPECTION"

    elif len(violated_rules) == 1:
        severity = "MEDIUM"
        compliance_status = "NON_COMPLIANT"
        recommended_action = "NOTICE_ISSUANCE"

    else:
        severity = "LOW"
        compliance_status = "COMPLIANT"
        recommended_action = "NO_ACTION"

    return {
        "compliance_status": compliance_status,
        "severity": severity,
        "violated_rules": violated_rules,
        "non_compliant_transactions": non_compliant_transactions,
        "recommended_action": recommended_action
    }

