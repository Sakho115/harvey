"""
Document Agent
--------------
Deterministic document ingestion for Harvey
"""

import os
import re
import json
import tempfile
from typing import Dict, Optional

try:
    import pdfplumber
except ImportError:
    pdfplumber = None

try:
    from llm.gemini_client import call_gemini
except ImportError:
    call_gemini = None


SUPPORTED_EXTENSIONS = {".pdf", ".txt"}

DOCUMENT_TYPES = [
    "SALE_DEED",
    "STAMP_DUTY_RECEIPT",
    "REGISTRATION_EXTRACT",
    "UNKNOWN",
]


# -------------------------------------------------
# Utilities
# -------------------------------------------------
def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def read_text_from_file(path: str) -> str:
    ext = os.path.splitext(path)[1].lower()

    if ext == ".txt":
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()

    if ext == ".pdf":
        if not pdfplumber:
            return ""  # ⬅️ NEVER crash pipeline

        text = ""
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                text += (page.extract_text() or "") + "\n"

        return text

    return ""


# -------------------------------------------------
# Deterministic extractors
# -------------------------------------------------
def extract_number(patterns, text) -> Optional[float]:
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            try:
                return float(m.group(1).replace(",", ""))
            except Exception:
                return None
    return None


def extract_property_value(text: str) -> Optional[float]:
    return extract_number(
        [
            r"sale consideration[:\s₹]*([\d,]+)",
            r"property value[:\s₹]*([\d,]+)",
            r"consideration amount[:\s₹]*([\d,]+)",
        ],
        text,
    )


def extract_stamp_duty(text: str) -> Optional[float]:
    return extract_number(
        [
            r"stamp duty[:\s₹]*([\d,]+)",
            r"stamp paid[:\s₹]*([\d,]+)",
        ],
        text,
    )


def extract_registration_id(text: str) -> Optional[str]:
    m = re.search(
        r"registration\s*(no|number)[:\s]*([A-Z0-9/-]+)",
        text,
        re.IGNORECASE,
    )
    return m.group(2) if m else None


# -------------------------------------------------
# Classification (safe)
# -------------------------------------------------
def classify_document_type(text: str) -> Dict:
    if not call_gemini or not text.strip():
        return {
            "document_type": "UNKNOWN",
            "confidence": 0.0,
            "method": "RULE_FALLBACK",
        }

    prompt = f"""
Classify the following document into one of these types ONLY:
{DOCUMENT_TYPES}

Respond strictly in JSON:
{{
  "document_type": "<TYPE>",
  "confidence": number between 0 and 1
}}

DOCUMENT:
{text[:3000]}
""".strip()

    try:
        response = call_gemini(prompt)
        parsed = json.loads(response)
        return {
            "document_type": parsed.get("document_type", "UNKNOWN"),
            "confidence": float(parsed.get("confidence", 0.5)),
            "method": "LLM",
        }
    except Exception:
        return {
            "document_type": "UNKNOWN",
            "confidence": 0.0,
            "method": "LLM_FAILED",
        }


# -------------------------------------------------
# Core processor
# -------------------------------------------------
def _process_document(path: str, source_name: str) -> Dict:
    raw_text = read_text_from_file(path)
    clean_text = normalize_text(raw_text)

    property_value = extract_property_value(clean_text) or 0.0
    stamp_paid = extract_stamp_duty(clean_text) or 0.0
    registration_id = extract_registration_id(clean_text)

    classification = classify_document_type(clean_text)

    extracted_fields = {
        "property_value": property_value,
        "stamp_paid": stamp_paid,
        "registration_id": registration_id,
    }

    return {
        "source_file": source_name,
        "document_type": classification["document_type"],
        "document_type_confidence": classification["confidence"],
        "extraction_method": classification["method"],
        "extracted_fields": extracted_fields,
        "raw_text_preview": clean_text[:500],
    }


# -------------------------------------------------
# Public Entry
# -------------------------------------------------
def run_document_agent(
    *,
    file_bytes: Optional[bytes] = None,
    filename: Optional[str] = None,
    file_path: Optional[str] = None,
) -> Dict:

    if file_bytes is not None and filename is not None:
        ext = os.path.splitext(filename)[1].lower()
        if ext not in SUPPORTED_EXTENSIONS:
            raise ValueError(f"Unsupported file extension: {ext}")

        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(file_bytes)
            temp_path = tmp.name

        try:
            return _process_document(temp_path, filename)
        finally:
            os.remove(temp_path)

    if file_path is not None:
        return _process_document(
            file_path, os.path.basename(file_path)
        )

    raise ValueError("No document input provided")

