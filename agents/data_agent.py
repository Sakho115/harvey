# agents/data_agent.py

import pandas as pd


def run_data_agent(input_payload: dict) -> dict:
    """
    Data Intelligence Agent

    Responsibilities:
    - Validate and normalize transaction data
    - Handle partial / missing document extractions safely
    - Compute statistics and derived metrics
    - NEVER crash on real-world imperfect data
    """

    # --------------------------------------------------
    # Extract inputs safely
    # --------------------------------------------------
    transactions = input_payload.get("data", [])
    circle_rate = input_payload.get("circle_rate")

    if not transactions:
        return {
            "error": "No transaction data provided",
            "derived_metrics": {},
            "transaction_metrics": [],
            "summary_extremes": {}
        }

    df = pd.DataFrame(transactions)

    # --------------------------------------------------
    # Required transaction-level columns
    # --------------------------------------------------
    required_columns = ["property_value", "stamp_paid"]
    missing_columns = [col for col in required_columns if col not in df.columns]

    # --------------------------------------------------
    # Missing value audit
    # --------------------------------------------------
    missing_values = {}
    for col in required_columns:
        if col in df.columns:
            missing_values[col] = int(df[col].isnull().sum())

    # --------------------------------------------------
    # Drop rows that cannot be used for valuation math
    # (CRITICAL: prevents NoneType crashes)
    # --------------------------------------------------
    usable_df = df.dropna(subset=["property_value"])

    if usable_df.empty:
        # No usable valuation data → return safely
        return {
            "missing_columns": missing_columns,
            "missing_values": missing_values,
            "stats": {},
            "outliers": {},
            "derived_metrics": {
                "avg_property_value": None,
                "avg_circle_rate": float(circle_rate) if circle_rate else None,
                "aggregate_undervaluation_ratio": None,
            },
            "transaction_metrics": [],
            "summary_extremes": {
                "max_undervaluation_ratio": None,
                "transactions_above_30_percent": 0,
                "transactions_above_50_percent": 0,
            },
        }

    # --------------------------------------------------
    # Basic statistics (only on usable data)
    # --------------------------------------------------
    stats = usable_df.describe().to_dict()

    # --------------------------------------------------
    # Outlier detection (IQR method)
    # --------------------------------------------------
    outliers = {}
    for col in ["property_value"]:
        q1 = usable_df[col].quantile(0.25)
        q3 = usable_df[col].quantile(0.75)
        iqr = q3 - q1
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        outliers[col] = int(((usable_df[col] < lower) | (usable_df[col] > upper)).sum())

    # --------------------------------------------------
    # Derived metrics
    # --------------------------------------------------
    avg_property_value = float(usable_df["property_value"].mean())
    avg_circle_rate = float(circle_rate) if circle_rate is not None else None

    transaction_metrics = []
    undervaluation_ratios = []

    if circle_rate:
        for idx, row in usable_df.iterrows():
            property_value = row["property_value"]

            # Defensive guard (extra safety)
            if property_value is None:
                continue

            undervaluation_ratio = (circle_rate - property_value) / circle_rate
            undervaluation_ratios.append(undervaluation_ratio)

            transaction_metrics.append({
                "transaction_index": int(idx),
                "property_value": float(property_value),
                "undervaluation_ratio": round(float(undervaluation_ratio), 3),
            })

        aggregate_undervaluation_ratio = round(
            sum(undervaluation_ratios) / len(undervaluation_ratios), 3
        )

        summary_extremes = {
            "max_undervaluation_ratio": round(max(undervaluation_ratios), 3),
            "transactions_above_30_percent": sum(r > 0.3 for r in undervaluation_ratios),
            "transactions_above_50_percent": sum(r > 0.5 for r in undervaluation_ratios),
        }

    else:
        aggregate_undervaluation_ratio = None
        summary_extremes = {
            "max_undervaluation_ratio": None,
            "transactions_above_30_percent": 0,
            "transactions_above_50_percent": 0,
        }

    # --------------------------------------------------
    # Final output
    # --------------------------------------------------
    return {
        "missing_columns": missing_columns,
        "missing_values": missing_values,
        "stats": stats,
        "outliers": outliers,
        "derived_metrics": {
            "avg_property_value": avg_property_value,
            "avg_circle_rate": avg_circle_rate,
            "aggregate_undervaluation_ratio": aggregate_undervaluation_ratio,
        },
        "transaction_metrics": transaction_metrics,
        "summary_extremes": summary_extremes,
    }

