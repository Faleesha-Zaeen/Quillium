import os
from uuid import uuid4
from dotenv import load_dotenv
from openai import OpenAI
import google.generativeai as genai

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(BASE_DIR, ".env")
load_dotenv(ENV_PATH)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_KEY_PRESENT = bool(GEMINI_API_KEY)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
print("✅ GEMINI_API_KEY loaded:", GEMINI_API_KEY_PRESENT)
print("✅ OPENAI_API_KEY loaded:", bool(OPENAI_API_KEY))

AUDIO_DIR = os.path.join(BASE_DIR, "audio")
os.makedirs(AUDIO_DIR, exist_ok=True)

import logging
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from .models import (
    ProcessRequest,
    ProcessResponse,
    HealthResponse,
    ShortScriptRequest,
    ShortScriptResponse,
    ShortAudioRequest,
    ShortAudioResponse,
    AskQuillRequest,
    AskQuillResponse,
)
from .pdf_processor import extract_text_from_pdf
from .mcq_generator import make_mcqs, make_flashcards, init_translator, generate_short_form_script

openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

logger = logging.getLogger("quillium")
logging.basicConfig(level=logging.INFO)

# Global state
translator_loaded = False

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global translator_loaded
    try:
        # Initialize translator (now just a dummy function in the new code)
        init_translator()
        translator_loaded = True
        print("✅ Translator initialized")
    except Exception as e:
        print(f"⚠️ Translator initialization note: {e}")
        translator_loaded = False
    yield
    # Shutdown
    print("👋 Shutting down Quillium backend")

app = FastAPI(
    title="Quillium API",
    description="AI-powered quiz and flashcard generator from PDF documents",
    version="1.0.0",
    lifespan=lifespan
)

app.mount("/audio", StaticFiles(directory=AUDIO_DIR), name="audio")

# CORS configuration
default_dev_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://quillium.vercel.app",
]
env_origins = os.getenv("ALLOWED_ORIGINS", "")
allowed_origins = env_origins.split(",") if env_origins else default_dev_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Quillium API is running!",
        "version": "1.0.0",
        "endpoints": {
            "POST /process-pdf": "Process PDF and generate questions",
            "GET /health": "Check API health",
            "GET /languages": "Get supported languages"
        }
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        translator_loaded=translator_loaded,
        model_cache_exists=False  # No longer using local model cache
    )

@app.get("/debug-env")
async def debug_env():
    return {"gemini": bool(os.getenv("GEMINI_API_KEY"))}

@app.get("/languages")
async def get_languages():
    languages = {
        "English": ["English"],
        "European Languages": [
            "Spanish", "French", "German", "Italian", "Portuguese",
            "Russian", "Dutch", "Polish", "Ukrainian", "Romanian",
            "Greek", "Czech", "Swedish", "Norwegian", "Danish",
            "Finnish", "Hungarian", "Bulgarian"
        ],
        "Asian Languages": [
            "Chinese", "Japanese", "Korean", "Arabic", "Hebrew",
            "Turkish", "Thai", "Vietnamese", "Indonesian", "Malay",
            "Filipino", "Persian", "Hindi", "Tamil", "Telugu",
            "Kannada", "Malayalam", "Bengali", "Marathi", "Gujarati",
            "Punjabi", "Urdu"
        ],
        "Other Languages": [
            "Swahili", "Zulu", "Afrikaans", "Catalan", "Croatian",
            "Serbian", "Slovak", "Slovenian", "Lithuanian", "Latvian",
            "Estonian", "Maltese", "Icelandic"
        ]
    }
    return languages

@app.post("/ask-quill", response_model=AskQuillResponse)
async def ask_quill(payload: AskQuillRequest):
    message = (payload.message or "").strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message is required")

    if not GEMINI_API_KEY:
        logger.error("/ask-quill attempted without GEMINI_API_KEY")
        return AskQuillResponse(reply="I'm having trouble answering right now. Please try again.")

    prompt = (
        "You are Quill, an AI tutor. Answer this student question clearly and concisely:\n\n"
        f"{message}"
    )

    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.5-flash-lite')
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.4,
                "max_output_tokens": 512,
            }
        )
        reply_text = (response.text or "").strip()
        if not reply_text:
            logger.warning("/ask-quill returned empty response from Gemini")
            return AskQuillResponse(reply="I'm having trouble answering right now. Please try again.")
        return AskQuillResponse(reply=reply_text)
    except Exception as exc:
        logger.error("/ask-quill failed: %s", exc)
        return AskQuillResponse(reply="I'm having trouble answering right now. Please try again.")

@app.post("/generate-short-script", response_model=ShortScriptResponse)
async def generate_short_script_endpoint(payload: ShortScriptRequest):
    """Generate a short spoken-style script for Quillium Shorts."""
    logger.info("🎬 /generate-short-script called with topic='%s'", payload.topic)
    script = generate_short_form_script(payload.topic)
    return ShortScriptResponse(script=script)

@app.post("/generate-short-audio", response_model=ShortAudioResponse)
async def generate_short_audio(payload: ShortAudioRequest):
    """Convert a short script into narrated audio using OpenAI TTS."""
    script = (payload.script or "").strip()
    if not script:
        raise HTTPException(status_code=400, detail="Script text is required")
    if not openai_client:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is not configured")

    file_name = f"short_{uuid4().hex}.mp3"
    file_path = os.path.join(AUDIO_DIR, file_name)

    try:
        with openai_client.audio.speech.with_streaming_response.create(
            model="gpt-4o-mini-tts",
            voice="alloy",
            input=script,
        ) as response:
            response.stream_to_file(file_path)
    except Exception as exc:
        logger.error("❌ Audio generation failed: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to generate narration audio")

    return ShortAudioResponse(audio_url=f"/audio/{file_name}")

@app.post("/process-pdf", response_model=ProcessResponse)
async def process_pdf(
    file: UploadFile = File(...),
    language: str = Form("English"),
    question_count: int = Form(20)
):
    """
    Process a PDF file and generate MCQs and flashcards.
    
    Args:
        file: PDF file to process
        language: Target language for questions
        question_count: Number of questions to generate (5-20)
    
    Returns:
        ProcessResponse with extracted text, page count, MCQs and flashcards
    """
    try:
        print(f"📥 [ENDPOINT] Received request:")
        print(f"   File: {file.filename}")
        print(f"   Language: {language}")
        print(f"   Question count: {question_count}")
        
        # Validate inputs
        if question_count < 5 or question_count > 20:
            raise HTTPException(
                status_code=400,
                detail="Question count must be between 5 and 20"
            )
        
        # Validate file type
        if not file.filename.endswith('.pdf'):
            raise HTTPException(
                status_code=400,
                detail="File must be a PDF (.pdf)"
            )
        
        # Read file content
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty"
            )
        
        # Limit file size (10MB)
        if len(contents) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="File size must be less than 10MB"
            )
        
        # Process PDF
        text, page_count = extract_text_from_pdf(contents)
        
        # Check if we got meaningful text
        if len(text) < 100:
            raise HTTPException(
                status_code=400,
                detail=f"PDF doesn't contain enough text. Only found {len(text)} characters."
            )
        
        print(f"📄 Generating {question_count} MCQs from {page_count} pages ({len(text)} chars)...")
        print(f"🌐 Processing in language: {language}")
        
        # Generate MCQs directly in the target language
        mcqs = make_mcqs(text, language=language, max_questions=question_count)
        
        print(f"📝 Generated {len(mcqs)} MCQs")
        if mcqs:
            print(f"   First question (preview): {mcqs[0]['question'][:80]}...")
        
        # Build flashcards from the generated MCQs so they match exactly
        print(f"📚 Building {len(mcqs)} flashcards from generated MCQs in {language}...")
        flashcards = []
        for idx, m in enumerate(mcqs):
            try:
                flashcards.append({
                    "question": m.get("question", ""),
                    "answer": m.get("answer", "")
                })
            except Exception as e:
                print(f"⚠️ Error creating flashcard for MCQ {idx}: {e}")
                # Fallback to a simple flashcard
                flashcards.append({
                    "question": m.get("question", ""),
                    "answer": m.get("answer", "")
                })
        
        # Validate we got some results
        if not mcqs:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate questions from the document. Please check if GEMINI_API_KEY is set."
            )
        
        return ProcessResponse(
            text=text[:500] + "..." if len(text) > 500 else text,  # Return preview
            page_count=page_count,
            mcqs=mcqs,
            flashcards=flashcards
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error processing PDF: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.post("/test-mcq")
async def test_mcq_generation(text: str, language: str = "English", question_count: int = 5):
    """
    Test MCQ generation directly from text.
    """
    try:
        print(f"🧪 Testing MCQ generation with {len(text)} chars in {language}...")
        mcqs = make_mcqs(text, language=language, max_questions=question_count)
        
        return {
            "text_preview": text[:200] + "..." if len(text) > 200 else text,
            "language": language,
            "question_count": len(mcqs),
            "mcqs": mcqs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("BACKEND_PORT", 8000))
    host = os.getenv("BACKEND_HOST", "0.0.0.0")
    
    print(f"🚀 Starting Quillium backend on {host}:{port}")
    print(f"🔑 GEMINI_API_KEY set: {'Yes' if os.getenv('GEMINI_API_KEY') else 'No'}")
    uvicorn.run(app, host=host, port=port)
