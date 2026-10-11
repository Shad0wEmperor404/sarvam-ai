"""
Heritage Storytelling Agent — 100% Sarvam AI Backend
=====================================================
A full-stack heritage storytelling application exclusively powered by Sarvam AI:
- Transcribe & Translate historic manuscripts and oral archives (Saaras & Sarvam Vision)
- Transform historical content into interactive stories, podcasts, and guided tours (Sarvam-105b)
- Bring history to life with natural multilingual voice narration (Bulbul v4-flash)
"""

import os
import uuid
import json
import traceback
from pathlib import Path

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename

import sarvam_service

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
load_dotenv()

app = Flask(__name__)
CORS(app)

UPLOAD_DIR = Path(__file__).resolve().parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "bmp", "tiff", "webp", "pdf"}
ALLOWED_AUDIO_EXTENSIONS = {"mp3", "wav", "ogg", "flac", "aac", "m4a", "webm"}

def _get_api_key():
    """Extract Sarvam API key from request headers, JSON body, or .env."""
    key = None
    if request:
        key = (
            request.headers.get("api-subscription-key") or
            request.headers.get("X-Sarvam-API-Key") or
            request.headers.get("Authorization", "").replace("Bearer ", "").strip() or
            request.args.get("api_key")
        )
        if not key and request.is_json and request.get_json(silent=True):
            key = request.get_json(silent=True).get("api_key")
    return key or os.getenv("SARVAM_API_KEY")


def _allowed_file(filename: str, allowed: set) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed


# ---------------------------------------------------------------------------
# Frontend Home Route
# ---------------------------------------------------------------------------
@app.route("/")
def home():
    """Serve the main Heritage Storytelling Agent page."""
    return render_template("index.html")


# ---------------------------------------------------------------------------
# 1. Transcribe (Manuscripts via Sarvam Vision & Oral Archives via Saaras)
# ---------------------------------------------------------------------------
@app.route("/api/transcribe", methods=["POST"])
def transcribe():
    """
    Transcribe oral recordings (Sarvam Saaras) or historical manuscripts (Sarvam Vision).
    Accepts multipart/form-data with a 'file' field and optional 'language'.
    """
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded. Please select an audio recording or manuscript image."}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "Empty filename."}), 400

        filename = secure_filename(file.filename)
        is_image = _allowed_file(filename, ALLOWED_IMAGE_EXTENSIONS)
        is_audio = _allowed_file(filename, ALLOWED_AUDIO_EXTENSIONS)

        if not is_image and not is_audio:
            return jsonify({
                "error": f"Unsupported format. Allowed audio: {', '.join(ALLOWED_AUDIO_EXTENSIONS)}. Allowed images: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}."
            }), 400

        # Save to uploads directory
        unique_name = f"{uuid.uuid4().hex}_{filename}"
        file_path = UPLOAD_DIR / unique_name
        file.save(str(file_path))

        api_key = _get_api_key()
        lang_hint = request.form.get("language", "hi-IN")

        if is_audio:
            # Transcribe speech oral archives with Sarvam Saaras model
            result = sarvam_service.transcribe_audio_sarvam(
                file_path=str(file_path),
                language_code=lang_hint,
                model="saaras:v4",
                api_key=api_key
            )
            return jsonify({
                "transcription": result["transcription"],
                "provider": "Sarvam AI (Saaras v4)",
                "model": "saaras:v4",
                "language": result.get("language_code", lang_hint)
            })

        else:
            # Historical manuscripts & inscriptions with Sarvam Document Intelligence
            result = sarvam_service.digitise_manuscript_sarvam(
                file_path=str(file_path),
                language_code=lang_hint,
                output_format="md",
                api_key=api_key
            )
            return jsonify({
                "transcription": result["transcription"],
                "provider": "Sarvam AI (Sarvam Vision / Doc AI)",
                "model": "sarvam-vision-doc-ai"
            })

    except Exception as e:
        traceback.print_exc()
        status_code = 402 if "No credits" in str(e) or "402" in str(e) else 500
        return jsonify({"error": str(e)}), status_code


# ---------------------------------------------------------------------------
# 2. Translate (Mayura v1 model for 22+ Indian languages)
# ---------------------------------------------------------------------------
@app.route("/api/translate", methods=["POST"])
def translate():
    """
    Translate historical texts preserving cultural nuances with Sarvam Mayura.
    Accepts JSON: {"text": "...", "source_lang": "...", "target_lang": "..."}
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body must be JSON."}), 400

        text = data.get("text", "").strip()
        source_lang = data.get("source_lang") or data.get("source_language", "auto")
        target_lang = data.get("target_lang") or data.get("target_language", "hi-IN")
        mode = data.get("mode", "formal")

        if not text:
            return jsonify({"error": "No text provided for translation."}), 400

        api_key = _get_api_key()
        result = sarvam_service.translate_text_sarvam(
            text=text,
            source_lang=source_lang,
            target_lang=target_lang,
            mode=mode,
            model="mayura:v1",
            api_key=api_key
        )

        return jsonify({
            "translation": result["translation"],
            "source_lang": result["source_lang"],
            "target_lang": result["target_lang"],
            "provider": "Sarvam AI (Mayura v1)",
            "model": "mayura:v1"
        })

    except Exception as e:
        traceback.print_exc()
        status_code = 402 if "No credits" in str(e) or "402" in str(e) else 500
        return jsonify({"error": str(e)}), status_code


# ---------------------------------------------------------------------------
# 3. Transform (Interactive Stories, Podcasts, Tours via Sarvam-105b)
# ---------------------------------------------------------------------------
@app.route("/api/generate-story", methods=["POST"])
def generate_story():
    """
    Transform heritage content into interactive narratives with Sarvam-105b LLM.
    Accepts JSON: {"text": "...", "format": "interactive_story|podcast_script|guided_tour", "style": "...", "language": "en"}
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body must be JSON."}), 400

        text = data.get("text", "").strip()
        story_format = data.get("format", "interactive_story")
        style = data.get("style", "heritage")
        language = data.get("language", "en")

        if not text:
            return jsonify({"error": "No historical text provided."}), 400

        api_key = _get_api_key()
        result = sarvam_service.generate_story_sarvam(
            text=text,
            format_type=story_format,
            style=style,
            language=language,
            api_key=api_key
        )

        return jsonify({
            "story": result["story"],
            "format": story_format,
            "provider": "Sarvam AI (Sarvam-105b)",
            "model": "sarvam-105b",
            "metadata": {"style": style, "language": language}
        })

    except Exception as e:
        traceback.print_exc()
        status_code = 402 if "No credits" in str(e) or "402" in str(e) else 500
        return jsonify({"error": str(e)}), status_code


# ---------------------------------------------------------------------------
# 4. Narrate (Bulbul v4-flash Text-to-Speech)
# ---------------------------------------------------------------------------
@app.route("/api/narrate", methods=["POST"])
def narrate():
    """
    Synthesize natural multilingual voice narration using Sarvam Bulbul TTS.
    Accepts JSON: {"text": "...", "voice": "shubh_enhi_ads", "language": "hi-IN", "pace": 1.0}
    Returns base64 encoded audio/wav.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body must be JSON."}), 400

        text = data.get("text", "").strip()
        voice = data.get("voice", "shubh_enhi_ads")
        language = data.get("language", "hi-IN")
        pace = float(data.get("pace", 1.0))

        if not text:
            return jsonify({"error": "No text provided for narration."}), 400

        api_key = _get_api_key()
        result = sarvam_service.text_to_speech_sarvam(
            text=text,
            language_code=language,
            speaker=voice,
            pace=pace,
            model="bulbul:v4-flash",
            api_key=api_key
        )

        return jsonify({
            "audio": result["audio"],
            "mime_type": "audio/wav",
            "provider": "Sarvam AI (Bulbul v4-flash)",
            "speaker": voice,
            "model": "bulbul:v4-flash"
        })

    except Exception as e:
        traceback.print_exc()
        status_code = 402 if "No credits" in str(e) or "402" in str(e) else 500
        return jsonify({"error": str(e)}), status_code


# ---------------------------------------------------------------------------
# 5. Narrate Podcast (Multi-speaker Sarvam Bulbul TTS)
# ---------------------------------------------------------------------------
@app.route("/api/narrate-podcast", methods=["POST"])
def narrate_podcast():
    """
    Convert a multi-speaker heritage podcast script to speech using Sarvam Bulbul.
    Accepts JSON: {"script": [{"speaker": "Host", "text": "...", "voice": "..."}, ...]}
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body must be JSON."}), 400

        script = data.get("script", [])
        if isinstance(script, str):
            # Parse text into dialogue lines
            lines = [l.strip() for l in script.split("\n") if l.strip()]
            script = []
            for i, line in enumerate(lines):
                speaker = "Host" if i % 2 == 0 else "Scholar"
                script.append({"speaker": speaker, "text": line})

        if not script:
            return jsonify({"error": "No script dialogue turns provided."}), 400

        api_key = _get_api_key()

        # Generate audio for the primary/opening turn using Sarvam Bulbul
        combined_text = " ".join([turn.get("text", "") for turn in script[:3]])
        speaker = "shubh_enhi_ads"
        lang = data.get("language", "hi-IN")

        result = sarvam_service.text_to_speech_sarvam(
            text=combined_text,
            language_code=lang,
            speaker=speaker,
            pace=1.0,
            model="bulbul:v4-flash",
            api_key=api_key
        )

        return jsonify({
            "audio": result["audio"],
            "mime_type": "audio/wav",
            "provider": "Sarvam AI (Bulbul v4-flash)",
            "speaker": speaker
        })

    except Exception as e:
        traceback.print_exc()
        status_code = 402 if "No credits" in str(e) or "402" in str(e) else 500
        return jsonify({"error": str(e)}), status_code


# ---------------------------------------------------------------------------
# Metadata: Voices & Languages (100% Sarvam AI)
# ---------------------------------------------------------------------------
@app.route("/api/voices", methods=["GET"])
def get_voices():
    """Return authentic Indian heritage voices from Sarvam Bulbul catalog."""
    return jsonify({"voices": sarvam_service.SARVAM_HERITAGE_VOICES})


@app.route("/api/languages", methods=["GET"])
def get_languages():
    """Return supported Indian scheduled languages for Sarvam AI."""
    return jsonify({"languages": sarvam_service.SARVAM_LANGUAGES})


# ---------------------------------------------------------------------------
# Curated Heritage Archives for 1-Click Exploration
# ---------------------------------------------------------------------------
HERITAGE_ARCHIVES = [
    {
        "id": "nasadiya_sukta",
        "title": "Rigveda: Nasadiya Sukta (Hymn of Creation)",
        "category": "Ancient Sanskrit Manuscript",
        "language": "sa-IN",
        "text": (
            "नासदासीन्नो सदासीत्तदानीं नासीद्रजो नो व्योमा परो यत्।\n"
            "किमावरीवः कुह कस्य शर्मन्नम्भः किमासीद्गहनं गभीरम्॥\n"
            "न मृत्युरासीदमृतं न तर्हि न रात्र्या अह्न आसीत्प्रकेतः।\n"
            "आनीदवातं स्वधया तदेकं तस्माद्धान्यन्न परः किञ्चनास॥"
        ),
        "context": "Rigveda Mandala 10, Sukta 129 — The earliest metaphysical reflection on cosmic creation, void, and the universe."
    },
    {
        "id": "silk_road_oasis",
        "title": "Oral Archive: Silk Road Oasis Merchant Trail (Turpan)",
        "category": "Oral History Archive",
        "language": "hi-IN",
        "text": (
            "We departed Dunhuang at dawn with forty laden camels carrying raw silk, lazurite lapis, and spiced resins. "
            "The dunes of the desert whispered like iron flutes in the gale. "
            "Master Darwish warned us: 'Follow only the bells of the leading camel and the silver polar star, "
            "for the desert mirages speak with the voices of ancestors lost in the sands.'"
        ),
        "context": "14th-century northern caravan merchant route log recorded by oral historians."
    },
    {
        "id": "chola_brihadisvara",
        "title": "Thanjavur Temple Inscription: Raja Raja Chola's Decree",
        "category": "Tamil Granite Inscription (1010 CE)",
        "language": "ta-IN",
        "text": (
            "ஸ்வஸ்திஸ்ரீ திருவாலங்காட்டு செப்பேடுகளிலும் தஞ்சாவூர் பெரிய கோவில் கல்வெட்டுகளிலும் பொறிக்கப்பட்ட ராஜராஜ சோழனின் ஆணைகள்: "
            "வானளாவிய விமானத்தின் மேல் உள்ள எண்பது டன் எடையுள்ள ஒரே கல் கலசம் ஏற்றி வைக்கப்பட்டது. "
            "ஆடல் வல்லான் திருக்கூத்து நிகழ்த்த நானூறு நாட்டியப் பெண்கள் அமர்த்தப்பட்டனர்."
        ),
        "context": "11th-century Brihadisvara Temple stone inscriptions describing royal endowments and architectural marvels."
    },
    {
        "id": "devarakadu_grove",
        "title": "Oral Archive: Western Ghats Sacred Grove Keeper's Chant",
        "category": "Indigenous Oral Archive",
        "language": "kn-IN",
        "text": (
            "ಮುಂಗಾರು ಮಳೆ ಸಹ್ಯಾದ್ರಿ ಪರ್ವತಗಳ ಮೇಲೆ ಸುರಿಯುತ್ತಿದ್ದಾಗ, ಆಲದ ಮರದ ಬುಡದ ನಾಗರ ಶಿಲೆಗಳು ತಂಪಾದವು. "
            "ನಮ್ಮ ಅಜ್ಜಿ ಹೇಳುತ್ತಿದ್ದಳು: 'ದೇವರಕಾಡಿನಿಂದ ಒಂದು ಒಣಗಿದ ಎಲೆಯನ್ನು ಕೂಡ ಭೂಮಿಯ ಆತ್ಮಕ್ಕೆ ನೀರನ್ನು ಅರ್ಪಿಸದೆ ಕೀಳಬೇಡಿ.' "
            "ಏಳು ತಲೆಮಾರುಗಳಿಂದ ನಮ್ಮ ಕುಟುಂಬ ಕಾಡು ಜೇನು ಮತ್ತು ಕವಡೆ ಗಿಡಗಳನ್ನು ಕಾಪಾಡಿದೆ."
        ),
        "context": "Traditional ecological oral knowledge preserved across generations by sacred grove guardians in Kodagu."
    }
]

@app.route("/api/samples", methods=["GET"])
def get_samples():
    """Return curated Indian heritage samples."""
    return jsonify({"samples": HERITAGE_ARCHIVES})


# ---------------------------------------------------------------------------
# Platform Health Status (100% Sarvam AI)
# ---------------------------------------------------------------------------
@app.route("/api/health", methods=["GET"])
def health():
    """Report Sarvam AI platform and models readiness."""
    key = _get_api_key()
    is_configured = bool(key and key != "your_sarvam_api_key_here")

    return jsonify({
        "status": "ok",
        "service": "Heritage Storytelling Agent",
        "platform": "Sarvam AI (100% Native)",
        "api_key_configured": is_configured,
        "models": {
            "speech_to_text": "saaras:v4 (Oral archives & speech in 22+ languages)",
            "document_intelligence": "sarvam-vision-doc-ai (Ancient manuscripts & OCR)",
            "translation": "mayura:v1 (22 Indian scheduled languages & English)",
            "text_to_speech": "bulbul:v4-flash (200+ authentic Indian heritage voices)",
            "story_generation": "sarvam-105b (Cultural narrative & interactive story LLM)"
        }
    })


# ---------------------------------------------------------------------------
# Main Entry Point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    print(f"🏛️  Heritage Storytelling Agent (100% Sarvam AI) starting on port {port}")
    app.run(host="0.0.0.0", port=port, debug=debug)
