# 🏛️ Heritage Storytelling Agent (100% Sarvam AI Platform)

> **Bringing History to Life through Indigenous Indian AI**  
> Exclusively powered by **Sarvam AI**: Saaras, Sarvam Vision, Mayura, Sarvam-105b, and Bulbul.

---

## 🌟 Overview

The **Heritage Storytelling Agent** transforms historical manuscripts, ancient inscriptions, and oral history archives into immersive, interactive cultural storytelling experiences. It is built natively on top of the **Sarvam AI** platform and optimized for 22 Indian scheduled languages and English.

---

## 🚀 Core Capabilities

| Feature | Sarvam AI Model | Description |
| :--- | :--- | :--- |
| **Oral Archive Transcription** | `saaras:v4` / `saaras:v3` | Transcribes spoken folklore, eyewitness accounts, and oral history recordings in 22+ Indian languages with timestamps. |
| **Manuscript Digitisation (OCR)** | `Sarvam Vision / Doc AI` | Digitises ancient handwritten and printed manuscripts, palm-leaf codices, and stone inscriptions. |
| **Heritage Translation** | `mayura:v1` | Context-aware translation preserving cultural nuances, archaic vocabulary, and devotional or royal phrasing. |
| **Story Transformation** | `sarvam-105b` | Transforms raw historical logs into **Interactive Branching Stories**, **2-Speaker Podcast Scripts**, and **Architectural Guided Tours**. |
| **Multilingual Voice Narration** | `bulbul:v4-flash` | Natural, expressive speech synthesis featuring 20+ persona voices with authentic Indian accents (Hindi, Sanskrit, Tamil, Telugu, Kannada, Malayalam, Marathi, Punjabi, Bengali, Gujarati). |

---

## 📦 Project Structure

```
c:\Users\Aditya Rajbhar\Desktop\sarvan\
├── app.py                  # Flask web backend with Sarvam AI REST endpoints
├── sarvam_service.py       # Native Sarvam AI service layer (Saaras, Mayura, Bulbul, Sarvam-105b)
├── requirements.txt        # Python dependencies (flask, sarvamai, requests, etc.)
├── .env                    # Configured with user's SARVAM_API_KEY
├── .env.example            # Environment template
├── static/
│   ├── css/
│   │   └── style.css       # Museum-quality parchment & antique gold design system
│   └── js/
│       └── app.js          # Interactive SPA with audio player, samples & tabs
└── templates/
    └── index.html          # Responsive single-page application
```

---

## ⚙️ Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure API Key
Your Sarvam AI API Key is already configured in `.env`:
```env
SARVAM_API_KEY=your_sarvam_api_key_here
PORT=5000
```
*(To add credits or manage your wallet, visit [dashboard.sarvam.ai](https://dashboard.sarvam.ai))*

### 3. Run the Application
```bash
python app.py
```
Open your browser at: **`http://localhost:5000`**

---

## 🎙️ Voices Catalog (Sarvam Bulbul)

- **Shubh** — Royal Bard (Solemn & Epic Chronicles)
- **Shubh** — Dramatic Storyteller
- **Shubh** — Sacred Chant & Temple Voice
- **Aditya** — Classical Heritage Scholar (Conversational)
- **Anand** — Historical Documentary Host
- **Mahesh** — Ancient Chronicles Narrator
- **Ratan** — Elder Oral Archivist (Grandfather oral tradition)
- **Priya** — Folk Legend Narrator
- **Roopa** — Melodic Courtly Chronicle Reciter
- **Ritu** — Cultural Dialogue Guide
- **Simran** — Heritage Podcast Host
- **Girish** — Mystic Hymn Reciter
- **Gokul / Vijay** — Tamil Sangam & Temple Chronicles
- **Kavitha** — Telugu Dynasty Storyteller
- **Chaitra** — Kannada Sacred Grove Keeper
- **Mrunal** — Marathi Forts & Sahyadri Saga Narrator
- **Harpreet** — Punjab Heritage Chronicler
- **Aditi / Shubh** — Global English Heritage Storytellers

