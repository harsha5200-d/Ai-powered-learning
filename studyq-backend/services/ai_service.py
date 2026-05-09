import json
import re
from google import genai
from flask import current_app


def _get_client():
    api_key = current_app.config.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured.")
    return genai.Client(api_key=api_key)


MODEL = "models/gemini-2.5-flash"

MCQ_PROMPT_TEMPLATE = """
You are an expert academic quiz generator.

Given the following study material, generate exactly 10 multiple-choice questions (MCQs).

Rules:
- Each question must have exactly 4 options: A, B, C, D
- Only one correct answer per question
- Academic tone, no trivial questions
- Output ONLY valid JSON — no markdown, no explanations, no extra text
- Use this exact JSON structure:

{{
  "questions": [
    {{
      "question_text": "...",
      "option_a": "...",
      "option_b": "...",
      "option_c": "...",
      "option_d": "...",
      "correct_answer": "A"
    }}
  ]
}}

Study Material:
\"\"\"
{text}
\"\"\"
"""

NOTES_PROMPT_TEMPLATE = """
You are an expert academic note-taker.

Given the following study material, generate concise, well-structured study notes.

Rules:
- Use clear headings and bullet points
- Highlight key concepts, definitions, and important facts
- Keep notes academically rigorous but easy to understand
- Aim for 300-500 words
- Output plain text only (no markdown code blocks)

Study Material:
\"\"\"
{text}
\"\"\"
"""

FLASHCARDS_PROMPT_TEMPLATE = """
You are an expert academic flashcard creator.

Given the following study material, generate exactly 10 flashcards.

Rules:
- Each flashcard has a "front" (a question or key term) and a "back" (the answer or definition)
- Keep fronts concise (max 15 words), backs informative (max 50 words)
- Cover the most important concepts from the material
- Output ONLY valid JSON — no markdown, no explanations, no extra text
- Use this exact JSON structure:

{{
  "flashcards": [
    {{
      "front": "...",
      "back": "..."
    }}
  ]
}}

Study Material:
\"\"\"
{text}
\"\"\"
"""


def _extract_json(raw: str) -> dict:
    """Strip markdown code fences if present and parse JSON."""
    cleaned = re.sub(r"```(?:json)?", "", raw).strip()
    # Remove trailing backticks too
    cleaned = cleaned.rstrip("`").strip()
    return json.loads(cleaned)


def _generate(prompt: str) -> str:
    """Call Gemini and return the response text."""
    client = _get_client()
    response = client.models.generate_content(model=MODEL, contents=prompt)
    return response.text.strip()


def generate_mcqs(text: str) -> list[dict]:
    """
    Call Gemini to generate 10 MCQs from extracted PDF text.
    Returns a list of question dicts.
    Raises ValueError if response cannot be parsed.
    """
    prompt = MCQ_PROMPT_TEMPLATE.format(text=text[:12000])
    raw = _generate(prompt)

    try:
        data = _extract_json(raw)
        questions = data.get("questions", [])
        if not questions:
            raise ValueError("Empty questions list in AI response.")
        required_keys = {
            "question_text", "option_a", "option_b",
            "option_c", "option_d", "correct_answer"
        }
        for q in questions:
            missing = required_keys - q.keys()
            if missing:
                raise ValueError(f"Question missing keys: {missing}")
            if q["correct_answer"].upper() not in {"A", "B", "C", "D"}:
                raise ValueError(f"Invalid correct_answer: {q['correct_answer']}")
        return questions
    except (json.JSONDecodeError, KeyError) as e:
        raise ValueError(f"Failed to parse AI response: {e}") from e


def generate_notes(text: str) -> str:
    """
    Call Gemini to generate summarized study notes.
    Returns a plain-text string.
    """
    prompt = NOTES_PROMPT_TEMPLATE.format(text=text[:12000])
    return _generate(prompt)


def generate_flashcards(text: str) -> list[dict]:
    """
    Call Gemini to generate 10 flashcards from extracted PDF text.
    Returns a list of {front, back} dicts.
    Raises ValueError if response cannot be parsed.
    """
    prompt = FLASHCARDS_PROMPT_TEMPLATE.format(text=text[:12000])
    raw = _generate(prompt)

    try:
        data = _extract_json(raw)
        cards = data.get("flashcards", [])
        if not cards:
            raise ValueError("Empty flashcards list in AI response.")
        for card in cards:
            if "front" not in card or "back" not in card:
                raise ValueError("Flashcard missing 'front' or 'back' key.")
        return cards
    except (json.JSONDecodeError, KeyError) as e:
        raise ValueError(f"Failed to parse AI response: {e}") from e
