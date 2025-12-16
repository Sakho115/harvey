from google import genai
from google.genai import types

# ⚠️ Best practice: load from env in real deployments
GEMINI_API_KEY = "AIzaSyApAetpxCREO_QGK-w8B4CI_Q-dIMnmLSc"

# Initialize 2025 Gemini client
client = genai.Client(api_key=GEMINI_API_KEY)


def call_gemini(prompt: str) -> str:
    """
    Gemini call for Harvey Supervisor Agent.
    - No chain-of-thought exposure
    - JSON-safe output
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,           # Low creativity for governance
                max_output_tokens=1024,
                # ❌ DO NOT include thinking for compliance systems
            )
        )

        if not response or not response.text:
            raise RuntimeError("Gemini returned empty response")

        return response.text.strip()

    except Exception as e:
        raise RuntimeError(f"Gemini API error: {e}") from e

