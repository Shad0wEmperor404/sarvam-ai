"""
Heritage Storytelling Agent — 100% Sarvam AI Platform Service
============================================================
All capabilities are exclusively powered by Sarvam AI:
1. Speech-to-Text: Saaras v4 / Saaras v3 models for oral archives
2. Document Intelligence (OCR): Sarvam Vision & Doc AI for handwritten manuscripts
3. Translation: Mayura v1 model for 22+ Indian languages & English
4. Story & Script Transformation: Sarvam-105b & Sarvam-105b-conversations LLM
5. Multilingual Voice Narration: Bulbul v4-flash & Bulbul v3 TTS models
"""

import os
import io
import time
import json
import base64
import requests
from typing import Dict, Any, Optional, List
from sarvamai import SarvamAI

SARVAM_BASE_URL = "https://api.sarvam.ai"

# ─────────────────────────────────────────────────────────────
# 22 Scheduled Indian Languages + English
# ─────────────────────────────────────────────────────────────
SARVAM_LANGUAGES = [
    {"code": "hi-IN", "name": "Hindi (हिन्दी)", "short": "hi"},
    {"code": "sa-IN", "name": "Sanskrit (संस्कृतम्)", "short": "sa"},
    {"code": "ta-IN", "name": "Tamil (தமிழ்)", "short": "ta"},
    {"code": "te-IN", "name": "Telugu (తెలుగు)", "short": "te"},
    {"code": "kn-IN", "name": "Kannada (ಕನ್ನಡ)", "short": "kn"},
    {"code": "ml-IN", "name": "Malayalam (മലയാളം)", "short": "ml"},
    {"code": "mr-IN", "name": "Marathi (मराठी)", "short": "mr"},
    {"code": "bn-IN", "name": "Bengali (বাংলা)", "short": "bn"},
    {"code": "gu-IN", "name": "Gujarati (ગુજરાતી)", "short": "gu"},
    {"code": "pa-IN", "name": "Punjabi (ਪੰਜਾਬੀ)", "short": "pa"},
    {"code": "od-IN", "name": "Odia (ଓଡ଼ିଆ)", "short": "od"},
    {"code": "ur-IN", "name": "Urdu (اردو)", "short": "ur"},
    {"code": "as-IN", "name": "Assamese (অসমীয়া)", "short": "as"},
    {"code": "ne-IN", "name": "Nepali (नेपाली)", "short": "ne"},
    {"code": "en-IN", "name": "Indian English", "short": "en"},
]

# Language code resolver
LANG_MAP = {
    "hi": "hi-IN", "hindi": "hi-IN",
    "sa": "sa-IN", "sanskrit": "sa-IN",
    "ta": "ta-IN", "tamil": "ta-IN",
    "te": "te-IN", "telugu": "te-IN",
    "kn": "kn-IN", "kannada": "kn-IN",
    "ml": "ml-IN", "malayalam": "ml-IN",
    "mr": "mr-IN", "marathi": "mr-IN",
    "bn": "bn-IN", "bengali": "bn-IN",
    "gu": "gu-IN", "gujarati": "gu-IN",
    "pa": "pa-IN", "punjabi": "pa-IN",
    "od": "od-IN", "or": "od-IN", "odia": "od-IN",
    "ur": "ur-IN", "urdu": "ur-IN",
    "as": "as-IN", "assamese": "as-IN",
    "ne": "ne-IN", "nepali": "ne-IN",
    "en": "en-IN", "english": "en-IN",
    "auto": "auto"
}

# ─────────────────────────────────────────────────────────────
# Sarvam Bulbul Voice Catalog for Heritage Narration
# ─────────────────────────────────────────────────────────────
SARVAM_HERITAGE_VOICES = [
    {
        "id": "shubh_enhi_ads",
        "name": "Shubh — Royal Bard (Hindi / English)",
        "language": "hi-IN",
        "gender": "Male",
        "style": "Deep, solemn, epic chronicle narration",
        "model": "bulbul:v4-flash"
    },
    {
        "id": "shubh_hi_stories_dramatic",
        "name": "Shubh — Dramatic Storyteller",
        "language": "hi-IN",
        "gender": "Male",
        "style": "Intense & gripping historical tales",
        "model": "bulbul:v4-flash"
    },
    {
        "id": "shubh_hi_devotional",
        "name": "Shubh — Sacred Chant & Temple Voice",
        "language": "hi-IN",
        "gender": "Male",
        "style": "Vedic recitations and spiritual manuscripts",
        "model": "bulbul:v4-flash"
    },
    {
        "id": "aditya_hi_conversational",
        "name": "Aditya — Classical Heritage Scholar",
        "language": "hi-IN",
        "gender": "Male",
        "style": "Knowledgeable museum docent",
        "model": "bulbul:v4-flash"
    },
    {
        "id": "anand_hi_documentary",
        "name": "Anand — Historical Documentary Host",
        "language": "hi-IN",
        "gender": "Male",
        "style": "Authoritative documentary voice",
        "model": "bulbul:v4-flash"
    },
    {
        "id": "mahesh_hi_documentary",
        "name": "Mahesh — Ancient Chronicles Narrator",
        "language": "hi-IN",
        "gender": "Male",
        "style": "Grave, measured historical account",
        "model": "bulbul:v4-flash"
    },
    {
        "id": "ratan_hi_documentary",
        "name": "Ratan — Elder Oral Archivist",
        "language": "hi-IN",
        "gender": "Male",
        "style": "Traditional village elder oral history",
        "model": "bulbul:v4-flash"
    },
    {
        "id": "priya_hi_recovery",
        "name": "Priya — Folk Legend Narrator",
        "language": "hi-IN",
        "gender": "Female",
        "style": "Warm, engaging traditional oral tales",
        "model": "bulbul:v4-flash"
    },
    {
        "id": "roopa_hi_narration",
        "name": "Roopa — Melodic Chronicle Reciter",
        "language": "hi-IN",
        "gender": "Female",
        "style": "Graceful storytelling for courtly history",
        "model": "bulbul:v4-flash"
    },
    {
        "id": "ritu_hi_conversation",
        "name": "Ritu — Cultural Dialogue Guide",
        "language": "hi-IN",
        "gender": "Female",
        "style": "Lively dialogue and guided tour lead",
        "model": "bulbul:v4-flash"
    },
    {
        "id": "simran_hi_narration",
        "name": "Simran — Expressive Heritage Host",
        "language": "hi-IN",
        "gender": "Female",
        "style": "Vibrant and articulate heritage podcast host",
        "model": "bulbul:v4-flash"
    },
    {
        "id": "girish_hi_devotional",
        "name": "Girish — Mystic Hymn Reciter",
        "language": "hi-IN",
        "gender": "Male",
        "style": "Philosophical and contemplative narratives",
        "model": "bulbul:v4-flash"
    },
    {
        "id": "gokul_ta_narration",
        "name": "Gokul — Tamil Sangam Narrator",
        "language": "ta-IN",
        "gender": "Male",
        "style": "Classical Tamil epics (Silappadikaram)",
        "model": "bulbul:v4-flash"
    },
    {
        "id": "vijay_ta_narration",
        "name": "Vijay — Tamil Heritage Guide",
        "language": "ta-IN",
        "gender": "Male",
        "style": "Temple architecture & Chola history",
        "model": "bulbul:v4-flash"
    },
    {
        "id": "kavitha_te_narration",
        "name": "Kavitha — Telugu Dynasty Storyteller",
        "language": "te-IN",
        "gender": "Female",
        "style": "Kakatiya & Vijayanagara historical chronicles",
        "model": "bulbul:v4-flash"
    },
    {
        "id": "chaitra_kn_narration",
        "name": "Chaitra — Kannada Sacred Grove Keeper",
        "language": "kn-IN",
        "gender": "Female",
        "style": "Hoysala & folklore oral narratives",
        "model": "bulbul:v4-flash"
    },
    {
        "id": "mrunal_mr_narration",
        "name": "Mrunal — Marathi Forts & Saga Narrator",
        "language": "mr-IN",
        "gender": "Female",
        "style": "Maratha history & Sahyadri oral tales",
        "model": "bulbul:v4-flash"
    },
    {
        "id": "harpreet_pa_narration",
        "name": "Harpreet — Punjab Heritage Chronicler",
        "language": "pa-IN",
        "gender": "Male",
        "style": "Grand Trunk Road & Punjab oral archives",
        "model": "bulbul:v4-flash"
    },
    {
        "id": "aditi_en_stories",
        "name": "Aditi — Global Heritage Storyteller (English)",
        "language": "en-IN",
        "gender": "Female",
        "style": "Engaging international museum presentation",
        "model": "bulbul:v4-flash"
    },
    {
        "id": "shubh_en_audiobook",
        "name": "Shubh — Archival Audiobook Narrator (English)",
        "language": "en-IN",
        "gender": "Male",
        "style": "Rich, resonant English historical narration",
        "model": "bulbul:v4-flash"
    }
]

def get_sarvam_client(custom_key: Optional[str] = None) -> SarvamAI:
    """Instantiate SarvamAI client with configured API key."""
    key = custom_key or os.getenv("SARVAM_API_KEY")
    if not key or key == "your_sarvam_api_key_here":
        raise ValueError(
            "SARVAM_API_KEY is not configured. Please add your Sarvam AI API Key in .env or the UI."
        )
    return SarvamAI(api_subscription_key=key)


def get_headers(custom_key: Optional[str] = None) -> Dict[str, str]:
    """Return HTTP headers for Sarvam AI REST requests."""
    key = custom_key or os.getenv("SARVAM_API_KEY")
    if not key or key == "your_sarvam_api_key_here":
        raise ValueError(
            "SARVAM_API_KEY is not configured. Please add your Sarvam AI API Key in .env or the UI."
        )
    return {
        "api-subscription-key": key,
        "Content-Type": "application/json"
    }


def to_sarvam_lang(code: str) -> str:
    """Normalize any language string to Sarvam BCP-47 code."""
    if not code:
        return "hi-IN"
    cleaned = code.strip().lower()
    return LANG_MAP.get(cleaned, cleaned if "-" in cleaned else f"{cleaned}-IN")


# ─────────────────────────────────────────────────────────────
# 1. Speech-to-Text: Saaras v4 / v3
# ─────────────────────────────────────────────────────────────
def transcribe_audio_sarvam(
    file_path: str,
    language_code: str = "hi-IN",
    model: str = "saaras:v4",
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Transcribe speech oral archives using Sarvam AI Saaras model.
    Supports 22+ Indian languages + code-mixed audio.
    """
    key = api_key or os.getenv("SARVAM_API_KEY")
    lang = to_sarvam_lang(language_code)

    # Use direct REST call with multipart upload
    url = f"{SARVAM_BASE_URL}/speech-to-text"
    headers = {"api-subscription-key": key}

    with open(file_path, "rb") as f:
        files = {"file": (os.path.basename(file_path), f, "audio/wav")}
        data = {
            "model": model,
            "mode": "transcribe"
        }
        if lang and lang != "auto":
            data["language_code"] = lang

        resp = requests.post(url, headers=headers, files=files, data=data, timeout=90)

    if resp.status_code != 200:
        _handle_sarvam_error(resp, "Speech-to-Text (Saaras)")

    res_json = resp.json()
    transcript = res_json.get("transcript", "")
    return {
        "transcription": transcript,
        "language_code": res_json.get("language_code", lang),
        "timestamps": res_json.get("timestamps"),
        "provider": "Sarvam AI",
        "model": model
    }


# ─────────────────────────────────────────────────────────────
# 2. Document Intelligence / Manuscript Digitisation: Sarvam Vision
# ─────────────────────────────────────────────────────────────
def digitise_manuscript_sarvam(
    file_path: str,
    language_code: str = "hi-IN",
    output_format: str = "md",
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Digitise and transcribe ancient manuscripts, inscriptions, and historical documents
    using Sarvam AI Document Intelligence (Doc AI / Sarvam Vision).
    """
    key = api_key or os.getenv("SARVAM_API_KEY")
    client = get_sarvam_client(key)

    try:
        # Submit digitisation job with handwritten & printed document intelligence
        job = client.doc_ai.digitise(
            file=[file_path],
            language=to_sarvam_lang(language_code),
            output_format=output_format,
            content_type="handwritten"  # Optimized for historic manuscripts
        )
        job_id = getattr(job, "job_id", None) or getattr(job, "id", None) or str(job)

        # Poll status up to 20 seconds
        for _ in range(10):
            time.sleep(2)
            try:
                status_res = client.doc_ai.get_status(job_id)
                state = getattr(status_res, "state", "") or getattr(status_res, "status", "")
                if state.lower() == "completed":
                    results = client.doc_ai.get_results(job_id)
                    return {
                        "transcription": str(results),
                        "provider": "Sarvam AI (Doc AI / Sarvam Vision)",
                        "model": "sarvam-vision-doc-ai"
                    }
                elif state.lower() in ("failed", "error"):
                    break
            except Exception:
                pass

        return {
            "transcription": f"[Document submitted to Sarvam Doc AI. Job ID: {job_id}]",
            "provider": "Sarvam AI",
            "model": "sarvam-vision-doc-ai"
        }
    except Exception as e:
        # If Doc AI job fails or account lacks enterprise Doc AI permissions,
        # provide clear explanation
        _handle_exception(e, "Document Intelligence (Sarvam Vision)")


# ─────────────────────────────────────────────────────────────
# 3. Translation: Mayura v1
# ─────────────────────────────────────────────────────────────
def translate_text_sarvam(
    text: str,
    source_lang: str = "auto",
    target_lang: str = "hi-IN",
    mode: str = "formal",
    model: str = "mayura:v1",
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Translate historical texts across 22+ Indian languages using Sarvam Mayura.
    Preserves heritage tone, classical phrasing, and cultural context.
    """
    url = f"{SARVAM_BASE_URL}/translate"
    headers = get_headers(api_key)

    src = to_sarvam_lang(source_lang)
    tgt = to_sarvam_lang(target_lang)

    payload = {
        "input": text,
        "source_language_code": src,
        "target_language_code": tgt,
        "speaker_gender": "Female",
        "mode": mode,
        "model": model,
        "enable_preprocessing": False
    }

    resp = requests.post(url, headers=headers, json=payload, timeout=45)
    if resp.status_code != 200:
        _handle_sarvam_error(resp, "Translation (Mayura)")

    data = resp.json()
    return {
        "translation": data.get("translated_text", ""),
        "source_lang": src,
        "target_lang": tgt,
        "provider": "Sarvam AI",
        "model": model
    }


# ─────────────────────────────────────────────────────────────
# 4. Text-to-Speech: Bulbul v4-flash / Bulbul v3
# ─────────────────────────────────────────────────────────────
def text_to_speech_sarvam(
    text: str,
    language_code: str = "hi-IN",
    speaker: str = "shubh_enhi_ads",
    pace: float = 1.0,
    model: str = "bulbul:v4-flash",
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Synthesize natural multilingual voice narration using Sarvam Bulbul.
    Returns base64 encoded audio string ready for browser HTML5 audio playback.
    """
    url = f"{SARVAM_BASE_URL}/text-to-speech"
    headers = get_headers(api_key)

    lang = to_sarvam_lang(language_code)

    payload = {
        "text": text[:2500],  # Bulbul supports up to 2500 characters
        "language_code": lang,
        "model": model,
        "speaker": speaker,
        "pace": max(0.5, min(2.0, float(pace)))
    }

    resp = requests.post(url, headers=headers, json=payload, timeout=60)
    if resp.status_code != 200:
        _handle_sarvam_error(resp, "Text-to-Speech (Bulbul)")

    data = resp.json()
    audios = data.get("audios", [])
    if not audios:
        raise RuntimeError("Sarvam Bulbul TTS returned empty audio list.")

    return {
        "audio": audios[0],
        "mime_type": "audio/wav",
        "provider": "Sarvam AI",
        "model": model,
        "speaker": speaker,
        "language_code": lang
    }


# ─────────────────────────────────────────────────────────────
# 5. Story Transformation: Sarvam-105b LLM
# ─────────────────────────────────────────────────────────────
def generate_story_sarvam(
    text: str,
    format_type: str = "interactive_story",
    style: str = "heritage",
    language: str = "en",
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Transform historical content into interactive stories, podcast scripts,
    or guided tours using Sarvam AI's flagship Sarvam-105b language model.
    """
    url = f"{SARVAM_BASE_URL}/v1/chat/completions"
    headers = get_headers(api_key)

    system_instruction = (
        "You are the Sarvam Heritage Storyteller, an expert cultural AI. "
        "You bring ancient manuscripts, forgotten legends, and oral archives to life. "
        "You must respond ONLY with raw JSON matching the requested schema. No code fences."
    )

    if format_type == "interactive_story":
        user_prompt = (
            f"Transform this historical content into an interactive branching story in {language}. "
            f"Style: {style}.\n"
            "Return JSON matching:\n"
            "{\n"
            '  "title": "Story Title",\n'
            '  "introduction": "Opening narrative...",\n'
            '  "scenes": [\n'
            '    {"id": "scene_1", "narrative": "Scene text...", "choices": [{"text": "Choice A", "next_scene": "scene_2"}]},\n'
            '    {"id": "scene_2", "narrative": "Scene text...", "choices": []}\n'
            "  ]\n"
            "}\n\n"
            f"Historical Source:\n{text}"
        )
    elif format_type == "podcast_script":
        user_prompt = (
            f"Create a 2-speaker podcast dialogue in {language} between a Host and a Heritage Historian. "
            f"Style: {style}.\n"
            "Return JSON matching:\n"
            "{\n"
            '  "title": "Podcast Episode Title",\n'
            '  "description": "Episode overview",\n'
            '  "script": [\n'
            '    {"speaker": "Host", "text": "Welcome to...", "style": "engaging"},\n'
            '    {"speaker": "Expert", "text": "In this archive...", "style": "reflective"}\n'
            "  ]\n"
            "}\n\n"
            f"Historical Source:\n{text}"
        )
    else:  # guided_tour
        user_prompt = (
            f"Create an architectural guided tour in {language}. Style: {style}.\n"
            "Return JSON matching:\n"
            "{\n"
            '  "title": "Historic Tour Title",\n'
            '  "overview": "Tour overview",\n'
            '  "stops": [\n'
            '    {"stop_number": 1, "name": "Stop Name", "description": "...", "narration": "...", "historical_context": "..."}\n'
            "  ]\n"
            "}\n\n"
            f"Historical Source:\n{text}"
        )

    payload = {
        "model": "sarvam-105b",
        "messages": [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.7
    }

    resp = requests.post(url, headers=headers, json=payload, timeout=75)
    if resp.status_code != 200:
        _handle_sarvam_error(resp, "Story Generation (Sarvam-105b)")

    raw_content = resp.json()["choices"][0]["message"]["content"].strip()
    clean_json = raw_content
    if clean_json.startswith("```"):
        clean_json = clean_json.split("\n", 1)[1]
    if clean_json.endswith("```"):
        clean_json = clean_json[:-3]

    try:
        story_obj = json.loads(clean_json.strip())
    except Exception:
        story_obj = {"raw_content": raw_content}

    return {
        "story": story_obj,
        "format": format_type,
        "provider": "Sarvam AI (Sarvam-105b)",
        "model": "sarvam-105b"
    }


# ─────────────────────────────────────────────────────────────
# Error Handling Helper
# ─────────────────────────────────────────────────────────────
def _handle_sarvam_error(resp: requests.Response, service_name: str):
    """Parse Sarvam AI error response and raise human-readable message."""
    try:
        err_data = resp.json().get("error", {})
        err_msg = err_data.get("message", resp.text)
        err_code = err_data.get("code", "")
    except Exception:
        err_msg = resp.text
        err_code = ""

    if resp.status_code == 402 or "insufficient_quota" in err_code or "No credits" in err_msg:
        raise RuntimeError(
            f"Sarvam AI ({service_name}): No credits available in your account. "
            "Please visit https://dashboard.sarvam.ai to add credits to your wallet."
        )
    elif resp.status_code == 401:
        raise RuntimeError(
            f"Sarvam AI ({service_name}): Unauthorized. Please verify your API key at dashboard.sarvam.ai."
        )
    else:
        raise RuntimeError(f"Sarvam AI {service_name} error ({resp.status_code}): {err_msg}")


def _handle_exception(exc: Exception, service_name: str):
    """Normalize SDK exceptions to readable errors."""
    msg = str(exc)
    if "402" in msg or "insufficient_quota" in msg or "No credits" in msg:
        raise RuntimeError(
            f"Sarvam AI ({service_name}): No credits available in your account. "
            "Please recharge at https://dashboard.sarvam.ai."
        )
    raise RuntimeError(f"Sarvam AI {service_name} error: {msg}")
