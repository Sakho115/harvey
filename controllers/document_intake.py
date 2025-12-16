import os
from typing import Dict

from agents.document_agent import run_document_agent


def ingest_document(file_path: str) -> Dict:
    """
    Document Intake Controller
    --------------------------
    - Accepts a document path
    - Runs Document Intelligence Agent
    - Returns structured payload for Harvey core
    """

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    print(f"\n📄 Ingesting document: {os.path.basename(file_path)}")

    doc_result = run_document_agent(file_path)

    extracted = doc_result.get("extracted_data", {})

    if not extracted:
        raise RuntimeError("Document Agent failed to extract any data")

    return {
        "structured_data": extracted,
        "document_confidence": doc_result["document_confidence"],
        "missing_fields": doc_result["missing_fields"],
        "source_file": doc_result["source_file"],
    }

