import os
import tempfile
from typing import Dict, List

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from agents.data_agent import run_data_agent
from agents.risk_agent import run_risk_agent
from agents.compliance_agent import run_compliance_agent
from agents.case_agent import run_case_agent
from agents.supervisor_agent import run_supervisor_agent
from agents.document_agent import run_document_agent


# =====================================================
# FASTAPI APP
# =====================================================
app = FastAPI(title="Harvey Compliance Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================
# SANITIZATION LAYER (MANDATORY)
# =====================================================
def sanitize_transactions(transactions: List[Dict]) -> List[Dict]:
    """
    Drops unusable rows and normalizes numeric values.
    This layer is NON-NEGOTIABLE in real systems.
    """
    clean = []

    for tx in transactions:
        pv = tx.get("property_value")
        stamp = tx.get("stamp_paid")

        if pv is None:
            continue

        try:
            pv = float(pv)
        except Exception:
            continue

        if pv <= 0:
            continue

        clean.append({
            "property_value": pv,
            "stamp_paid": float(stamp) if stamp is not None else 0.0
        })

    return clean


# =====================================================
# PIPELINE CORE
# =====================================================
def harvey_pipeline(raw_payload: Dict) -> Dict:
    if "data" not in raw_payload or "circle_rate" not in raw_payload:
        raise ValueError("Invalid input payload structure")

    # 1️⃣ Data Intelligence Agent
    data_result = run_data_agent(raw_payload)

    # 2️⃣ Risk Assessment Agent
    risk_payload = {
        "circle_rate": raw_payload["circle_rate"],
        "data": raw_payload["data"],
        "derived_metrics": data_result.get("derived_metrics", {}),
    }

    risk_result = run_risk_agent(risk_payload)
    if not risk_result:
        raise RuntimeError("Risk Agent returned empty output")

    # 3️⃣ Compliance Agent
    compliance_payload = {
        "circle_rate": raw_payload["circle_rate"],
        "transactions": raw_payload["data"],
        "risk_flags": risk_result["risk_flags"],
        "risk_level": risk_result["risk_level"],
    }

    compliance_result = run_compliance_agent(compliance_payload)

    # 4️⃣ Case Agent
    case_result = run_case_agent(
        data_result=data_result,
        risk_result=risk_result,
        compliance_result=compliance_result,
    )

    # 5️⃣ Supervisor Agent
    supervisor_result = run_supervisor_agent(case_result)

    return {
        "case": case_result,
        "supervisor": supervisor_result,
    }


# =====================================================
# API ENDPOINTS
# =====================================================
@app.post("/analyze/json")
def analyze_json(payload: Dict):
    try:
        return harvey_pipeline(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/analyze/document")
async def analyze_document(files: List[UploadFile] = File(None)):
    if not files:
        raise HTTPException(
            status_code=400,
            detail="No files received. Ensure field name is 'files'."
        )

    extracted_transactions = []
    detected_circle_rate = None

    for file in files:
        contents = await file.read()

        doc_result = run_document_agent(
            file_bytes=contents,
            filename=file.filename,
        )

        fields = doc_result.get("extracted_fields", {})

        extracted_transactions.append({
            "property_value": fields.get("property_value", 0.0),
            "stamp_paid": fields.get("stamp_paid", 0.0),
        })

    payload = {
        "circle_rate": detected_circle_rate or 7500000,
        "data": extracted_transactions,
    }

    return harvey_pipeline(payload)

    # ---- SANITIZE BEFORE PIPELINE ----
    clean_transactions = sanitize_transactions(extracted_transactions)

    if not clean_transactions:
        raise HTTPException(
            status_code=400,
            detail="No valid transactions extracted from uploaded documents"
        )

    if detected_circle_rate is None:
        detected_circle_rate = 7_500_000  # fallback circle rate

    payload = {
        "circle_rate": detected_circle_rate,
        "data": clean_transactions,
    }

    return harvey_pipeline(payload)


# =====================================================
# LOCAL RUN
# =====================================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

