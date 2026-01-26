from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class MCQ(BaseModel):
    question: str
    answer: str
    options: List[str]
    difficulty: Difficulty

class Flashcard(BaseModel):
    question: str
    answer: str

class ProcessRequest(BaseModel):
    language: str = "English"
    question_count: int = 20

class ProcessResponse(BaseModel):
    text: str
    page_count: int
    mcqs: List[MCQ]
    flashcards: List[Flashcard]

class ShortScriptRequest(BaseModel):
    topic: str

class ShortScriptResponse(BaseModel):
    script: str

class ShortAudioRequest(BaseModel):
    script: str

class ShortAudioResponse(BaseModel):
    audio_url: str

class ProgressData(BaseModel):
    total_questions: int = 0
    correct_answers: int = 0
    incorrect_answers: int = 0
    quizzes_taken: int = 0
    flashcards_studied: int = 0

class HealthResponse(BaseModel):
    status: str
    translator_loaded: bool
    model_cache_exists: bool