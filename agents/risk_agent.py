def run_risk_agent(input_payload):
    circle_rate = input_payload.get("circle_rate")
    transactions = input_payload.get("data", [])

    risk_score = 0
    risk_reasons = []
    risk_flags = []

    undervalued_count = 0
    zero_value_count = 0

    # Defensive: no usable data
    if not transactions or not circle_rate:
        return {
            "risk_score": 0,
            "risk_level": "LOW",
            "risk_reasons": [],
            "risk_flags": []
        }

    for idx, tx in enumerate(transactions):
        pv = tx.get("property_value")
        stamp = tx.get("stamp_paid")

        # -----------------------------
        # HARDENING: skip invalid rows
        # -----------------------------
        try:
            pv = float(pv)
        except (TypeError, ValueError):
            continue

        try:
            stamp = float(stamp) if stamp is not None else None
        except (TypeError, ValueError):
            stamp = None

        # --- Rule 0: Zero / Invalid Transaction ---
        if pv <= 0:
            zero_value_count += 1
            risk_score += 4
            risk_reasons.append(
                f"Transaction {idx + 1}: Property value is zero or invalid"
            )
            risk_flags.append("ZERO_VALUE_TRANSACTION")
            continue  # ⬅️ VERY IMPORTANT

        # --- Rule 1: Undervaluation vs Circle Rate ---
        if pv < 0.75 * circle_rate:
            undervalued_count += 1
            risk_score += 3
            risk_reasons.append(
                f"Transaction {idx + 1}: Property value is >25% below circle rate"
            )
            risk_flags.append("UNDERVALUATION")

        # --- Rule 2: Stamp Duty Mismatch (Assume 5%) ---
        if stamp is not None:
            expected_stamp = 0.05 * pv

            if expected_stamp > 0:
                deviation = abs(stamp - expected_stamp) / expected_stamp
                if deviation > 0.10:
                    risk_score += 2
                    risk_reasons.append(
                        f"Transaction {idx + 1}: Stamp duty deviates significantly from expected value"
                    )
                    risk_flags.append("STAMP_DUTY_MISMATCH")

    # --- Rule 3: Pattern Risk ---
    if undervalued_count >= 1:
        risk_score += 1
        risk_reasons.append("Pattern detected: Valuation irregularities")
        risk_flags.append("SYSTEMATIC_RISK")

    if zero_value_count >= 1:
        risk_score += 2
        risk_reasons.append(
            "Presence of zero-value transactions indicates possible evasion"
        )
        risk_flags.append("CRITICAL_DATA_ANOMALY")

    # --- Risk Level Mapping ---
    if risk_score >= 7:
        risk_level = "HIGH"
    elif risk_score >= 3:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "risk_reasons": list(set(risk_reasons)),
        "risk_flags": list(set(risk_flags))
    }

