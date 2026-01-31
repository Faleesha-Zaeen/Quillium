import logging
import os
import json
import re
from typing import List, Dict, Optional

import google.generativeai as genai

shorts_logger = logging.getLogger("quillium.shorts")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


def init_translator():
    """Dummy function to maintain compatibility with existing imports."""
    print("✅ Translator initialized (using Gemini for translations)")
    return None


def make_mcqs(text: str, language: str = "English", max_questions: int = 20) -> List[Dict]:
    """Generate MCQs in English first, then translate to target language."""

    print(f"\n{'='*70}")
    print(f"🔧 MAKE_MCQS: Starting with language='{language}', max_questions={max_questions}")
    print(f"{'='*70}")

    # Clean text
    text = text.strip()
    if len(text) < 50:
        print("❌ Text too short (< 50 chars)")
        return []

    # If text is too long, truncate it
    if len(text) > 6000:
        print(f"⚠️ Text too long ({len(text)} chars), truncating to 6000")
        text = text[:6000] + "... [text truncated]"

    # Get API key
    api_key = GEMINI_API_KEY
    if not api_key:
        print("❌ GEMINI_API_KEY not found in environment variables!")
        print("   Please set GEMINI_API_KEY in your .env file")
        return generate_fallback_mcqs(text, max_questions)

    print(f"✓ API key loaded: {api_key[:20]}...")

    try:
        # Step 1: ALWAYS generate in English first
        print("📝 Step 1: Generating MCQs in English...")
        english_mcqs = generate_english_mcqs(text, max_questions, api_key)

        if not english_mcqs:
            print("❌ Failed to generate English MCQs")
            return generate_fallback_mcqs(text, max_questions)

        print(f"✅ Step 1 Complete: Generated {len(english_mcqs)} English MCQs")

        # Log first English question as reference
        if english_mcqs:
            print(f"   First Q (EN): {english_mcqs[0]['question'][:60]}...")

        # Step 2: If language is English, return as is
        if language.lower() == "english":
            print(f"✅ Language is English, returning MCQs as-is")
            return english_mcqs[:max_questions]

        # Step 3: Translate to target language
        print(f"🌍 Step 2: Translating {len(english_mcqs)} MCQs to {language}...")
        translated_mcqs = translate_mcqs_to_language(english_mcqs, language, api_key)

        if translated_mcqs and len(translated_mcqs) > 0:
            print(f"✅ Step 2 Complete: Translated to {language}")

            # Verify translation actually happened
            if translated_mcqs[0]['question'] != english_mcqs[0]['question']:
                print(f"   ✓ Confirmed: Question was translated")
                print(f"   First Q ({language}): {translated_mcqs[0]['question'][:60]}...")
            else:
                print(f"   ⚠️ Warning: Question appears unchanged after translation")

            return translated_mcqs[:max_questions]
        else:
            print(f"⚠️ Translation returned empty, using English MCQs")
            return english_mcqs[:max_questions]

    except Exception as e:
        print(f"❌ Error in make_mcqs: {e}")
        import traceback
        traceback.print_exc()
        return generate_fallback_mcqs(text, max_questions)


def generate_english_mcqs(text: str, max_questions: int, api_key: str) -> List[Dict]:
    """Generate MCQs in English using Gemini."""
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash-lite')

        prompt = f"""
Generate exactly {max_questions} multiple choice questions (MCQs) from the following text.
Each question MUST have exactly 4 options, with ONE correct answer.

IMPORTANT RULES:
1. Make questions MEANINGFUL - test real understanding
2. Make ALL options PLAUSIBLE and SPECIFIC
3. NEVER use vague options like: "wrong answer", "incorrect concept", "different perspective"
4. For "Who" questions: Use SPECIFIC PERSON NAMES as distractors
5. For other questions: Use SPECIFIC facts/terms/concepts as distractors

FORMAT STRICTLY AS JSON:
[
  {{
    "question": "Question here?",
    "answer": "Correct answer",
    "options": ["Correct", "Distractor 1", "Distractor 2", "Distractor 3"],
    "difficulty": "easy|medium|hard"
  }}
]

EXAMPLES OF GOOD DISTRACTORS:
Question: "Who coined the term 'Artificial Intelligence'?"
Good distractors: ["Alan Turing", "Marvin Minsky", "Herbert Simon"]
BAD distractors: ["A different scientist", "Not John McCarthy", "Someone else"]

TEXT:
{text}

Return ONLY the JSON array. No explanations.
"""

        print("🤖 Generating English MCQs with Gemini...")

        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.3,
                "max_output_tokens": 4000,
            }
        )

        raw_output = response.text.strip()
        print(f"✅ Received Gemini response")

        # Clean JSON
        raw_output = clean_json_response(raw_output)

        # Parse JSON
        try:
            mcqs = json.loads(raw_output)
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse JSON: {e}")
            print(f"Raw output preview: {raw_output[:500]}")
            return []

        # Validate each MCQ
        validated_mcqs = []
        for mcq in mcqs[:max_questions]:
            validated = validate_mcq(mcq)
            if validated:
                validated_mcqs.append(validated)

        print(f"✅ Validated {len(validated_mcqs)} English MCQs")
        return validated_mcqs

    except Exception as e:
        print(f"❌ Error generating English MCQs: {e}")
        return []


def translate_mcqs_to_language(english_mcqs: List[Dict], target_lang: str, api_key: str) -> List[Dict]:
    """Translate English MCQs to target language using a simpler, more reliable approach."""
    if target_lang.lower() == "english" or not english_mcqs:
        print(f"⏭️ [TRANSLATE] Skipping translation - target is English or no MCQs")
        return english_mcqs

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash-lite')

        print(f"\n{'='*70}")
        print(f"[TRANSLATE] Starting translation of {len(english_mcqs)} MCQs to {target_lang}")
        print(f"{'='*70}\n")

        # Translate each MCQ individually for better reliability
        translated_mcqs = []

        for idx, mcq in enumerate(english_mcqs):
            try:
                print(f"[TRANSLATE] MCQ {idx + 1}/{len(english_mcqs)}")
                print(f"  EN Question: {mcq['question'][:60]}...")

                # Build individual translation prompt - ULTRA EXPLICIT
                prompt = f"""You MUST translate this MCQ to {target_lang}. Output ONLY JSON.

English question: {mcq['question']}

STRICT INSTRUCTIONS:
- Translate the ENTIRE question to {target_lang}
- Translate the ENTIRE answer to {target_lang}  
- Translate EVERY option to {target_lang}
- Make sure the translated answer matches one of the translated options
- Keep "difficulty" as-is
- ONLY return valid JSON, no explanations

Here is the English MCQ to translate:
{json.dumps(mcq, ensure_ascii=False)}

Return ONLY this JSON format with translations in {target_lang}:
{{
  "question": "[TRANSLATE TO {target_lang}]",
  "answer": "[TRANSLATE TO {target_lang}]",
  "options": ["[TRANSLATE]", "[TRANSLATE]", "[TRANSLATE]", "[TRANSLATE]"],
  "difficulty": "[KEEP SAME]"
}}"""

                response = model.generate_content(
                    prompt,
                    generation_config={
                        "temperature": 0.2,
                        "max_output_tokens": 1000,
                    }
                )

                raw_output = response.text.strip()
                print(f"  Raw response: {raw_output[:100]}...")

                # Clean JSON
                raw_output = clean_json_response(raw_output)

                # Parse
                try:
                    translated_mcq = json.loads(raw_output)

                    # Validate
                    if all(k in translated_mcq for k in ['question', 'answer', 'options']):
                        # Double check it's actually translated
                        orig_q = mcq['question'].lower()
                        trans_q = translated_mcq['question'].lower()

                        if orig_q != trans_q:
                            print(f"  ✅ Translated: {translated_mcq['question'][:60]}...")
                            translated_mcqs.append(translated_mcq)
                        else:
                            print(f"  ⚠️ Not actually translated, using English")
                            translated_mcqs.append(mcq)
                    else:
                        print(f"  ❌ Missing fields in response")
                        translated_mcqs.append(mcq)

                except json.JSONDecodeError as e:
                    print(f"  ❌ JSON parse error: {e}")
                    print(f"     Response was: {raw_output[:200]}")
                    translated_mcqs.append(mcq)

            except Exception as e:
                print(f"  ❌ Error: {e}")
                translated_mcqs.append(mcq)

        print(f"\n{'='*70}")
        print(f"✅ [TRANSLATE] Complete: {len(translated_mcqs)} MCQs processed for {target_lang}")
        print(f"{'='*70}\n")

        # Verify at least some translations happened
        orig_first = english_mcqs[0]['question']
        trans_first = translated_mcqs[0]['question']

        if orig_first.lower() == trans_first.lower():
            print(f"⚠️ [TRANSLATE] WARNING: First question unchanged!")
            print(f"   EN: {orig_first}")
            print(f"   TR: {trans_first}")
        else:
            print(f"✓ [TRANSLATE] Confirmed translation happened")
            print(f"   EN: {orig_first[:60]}...")
            print(f"   {target_lang}: {trans_first[:60]}...")

        return translated_mcqs

    except Exception as e:
        print(f"❌ [TRANSLATE] Fatal error: {e}")
        import traceback
        traceback.print_exc()
        print(f"⚠️ [TRANSLATE] Returning English MCQs as fallback")
        return english_mcqs


def clean_json_response(raw_output: str) -> str:
    """Clean and extract JSON from Gemini response."""
    # Remove markdown code blocks
    if raw_output.startswith("```json"):
        raw_output = raw_output[7:]
    elif raw_output.startswith("```"):
        raw_output = raw_output[3:]

    if raw_output.endswith("```"):
        raw_output = raw_output[:-3]

    raw_output = raw_output.strip()

    # Extract JSON array if wrapped in text
    json_match = re.search(r'\[\s*\{.*?\}\s*\]', raw_output, re.DOTALL)
    if json_match:
        raw_output = json_match.group(0)

    return raw_output


def validate_mcq(mcq: Dict) -> Optional[Dict]:
    """Validate and clean a single MCQ."""
    if not mcq or not isinstance(mcq, dict):
        return None

    question = mcq.get("question", "").strip()
    answer = mcq.get("answer", "").strip()
    options = mcq.get("options", [])
    difficulty = mcq.get("difficulty", "medium").strip().lower()

    # Basic validation
    if not question or not answer or not options:
        return None

    # Ensure we have 4 options
    if len(options) < 4:
        return None

    # Ensure answer is in options
    if answer not in options:
        # Check case-insensitive match
        answer_lower = answer.lower()
        for opt in options:
            if opt.lower() == answer_lower:
                answer = opt  # Update to match case
                break
        else:
            # If still not found, use first option
            answer = options[0]

    # Clean options - remove vague ones
    cleaned_options = []
    seen = set()

    vague_terms = [
        "wrong", "incorrect", "not correct", "false", "invalid",
        "different concept", "alternative perspective", "common misconception",
        "broader interpretation", "related but different", "someone else",
        "not this", "other answer", "another option"
    ]

    for opt in options:
        opt_str = str(opt).strip()
        if not opt_str:
            continue

        opt_lower = opt_str.lower()

        # Skip if too vague
        if any(term in opt_lower for term in vague_terms):
            continue

        # Skip duplicates
        if opt_lower in seen:
            continue

        seen.add(opt_lower)
        cleaned_options.append(opt_str)

    # Ensure we have 4 quality options
    while len(cleaned_options) < 4:
        filler = generate_meaningful_filler(question, answer, len(cleaned_options))
        filler_lower = filler.lower()
        if filler_lower not in seen:
            seen.add(filler_lower)
            cleaned_options.append(filler)

    # Ensure answer is in cleaned options
    if answer not in cleaned_options:
        answer = cleaned_options[0]

    # Validate difficulty
    if difficulty not in ["easy", "medium", "hard"]:
        total_words = len(question.split()) + len(answer.split())
        if total_words < 20:
            difficulty = "easy"
        elif total_words < 40:
            difficulty = "medium"
        else:
            difficulty = "hard"

    return {
        "question": question,
        "answer": answer,
        "options": cleaned_options[:4],
        "difficulty": difficulty
    }


def generate_meaningful_filler(question: str, answer: str, index: int) -> str:
    """Generate a meaningful filler option."""
    question_lower = question.lower()

    if question_lower.startswith("who"):
        people = ["Alan Turing", "Isaac Newton", "Marie Curie", "Charles Darwin"]
        return people[index % len(people)]

    elif "capital" in question_lower:
        capitals = ["London", "Berlin", "Tokyo", "Beijing"]
        return capitals[index % len(capitals)]

    elif any(term in question_lower for term in ["year", "when", "date"]):
        years = ["1945", "1969", "1776", "2001"]
        return years[index % len(years)]

    else:
        generic = [
            "A related concept from the same field",
            "An important but different aspect",
            "A frequently confused alternative",
            "A similar but distinct element"
        ]
        return generic[index % len(generic)]


def generate_fallback_mcqs(text: str, max_questions: int) -> List[Dict]:
    """Generate simple fallback MCQs."""
    print("⚠️ Using fallback MCQ generation")

    sentences = [s.strip() for s in re.split(r'[.!?]', text) if len(s.strip()) > 20]

    mcqs = []
    for i in range(min(max_questions, len(sentences))):
        sentence = sentences[i]
        if len(sentence) > 100:
            sentence = sentence[:100] + "..."

        mcqs.append({
            "question": f"What is the main idea of: '{sentence}'?",
            "answer": sentences[i],
            "options": [
                sentences[i],
                "A different concept from the text",
                "An alternative interpretation",
                "Related information"
            ],
            "difficulty": "medium"
        })

    return mcqs[:max_questions]


def make_flashcards(text: str, lang: str = "English", max_cards: int = 20) -> List[Dict]:
    """Generate flashcards from text."""
    print(f"📚 Generating flashcards in {lang}...")

    # Generate MCQs (this will handle translation if needed)
    mcqs = make_mcqs(text, language=lang, max_questions=max_cards)

    # Convert to flashcards
    flashcards = []
    for mcq in mcqs:
        flashcards.append({
            "question": mcq["question"],
            "answer": mcq["answer"]
        })

    print(f"✅ Generated {len(flashcards)} flashcards in {lang}")
    return flashcards[:max_cards]


def translate_text(text: str, target_lang: str) -> str:
    """Simple translation function for compatibility."""
    if target_lang == "English":
        return text

    api_key = GEMINI_API_KEY
    if not api_key:
        return text

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash-lite')

        prompt = f"Translate this to {target_lang}: {text}"
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception:
        return text


def generate_short_form_script(topic: str) -> str:
    """Generate a simple, topic-specific Quillium Shorts narration."""
    normalized_topic = topic.strip() if topic else ""
    if not normalized_topic:
        return "Let's learn something new today. Choose a topic to explore."

    # If no API key, return a simple script
    api_key = GEMINI_API_KEY
    if not api_key:
        print("⚠️ GEMINI_API_KEY missing, returning simple short script")
        return _build_simple_short_script(normalized_topic)

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash-lite')

        # SIMPLE, RELAXED PROMPT - No strict sentence counts or word limits
        prompt = f"""Create a short educational explanation about "{normalized_topic}" for a video.

Please write about 100-150 words that:
1. Briefly explain what {normalized_topic} is
2. Give a simple example of how {normalized_topic} works
3. Mention one practical use of {normalized_topic}

Write it as plain text that can be read aloud in about 45-60 seconds.
Use simple, clear language suitable for beginners.
Focus on factual information, not motivational language."""

        print(f"🤖 Generating short script for: {normalized_topic}")

        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.8,
                "max_output_tokens": 800,
                "top_p": 0.95,
            }
        )

        script = response.text.strip()

        # Clean up the script
        script = _cleanup_script(script)

        print(f"✅ Generated script: {len(script.split())} words")
        return script

    except Exception as e:
        print(f"❌ Short script generation failed: {e}")
        import traceback
        traceback.print_exc()
        return _build_simple_short_script(normalized_topic)


def _cleanup_script(script: str) -> str:
    """Clean and format the script."""
    if not script:
        return ""

    # Remove markdown code blocks
    if script.startswith("```"):
        script = re.sub(r"^```[a-zA-Z]*", "", script).strip()
        if script.endswith("```"):
            script = script[:-3].strip()

    # Remove quotes if present
    if script.startswith('"') and script.endswith('"') and len(script) > 1:
        script = script[1:-1]

    # Normalize whitespace
    script = re.sub(r"\s+", " ", script)

    # Ensure it ends with proper punctuation
    if not script.endswith((".", "!", "?")):
        script = script.rstrip('.!? ') + '.'

    return script.strip()


def _enhance_script(script: str, topic: str) -> str:
    """Enhance a too-short script."""
    enhancements = [
        f" Let me explain {topic} in more detail.",
        f" Understanding {topic} can help in many real-world situations.",
        f" This is just the beginning of exploring {topic}.",
        f" Practice and application will deepen your understanding of {topic}."
    ]

    enhanced = script
    for enhancement in enhancements:
        if len(enhanced.split()) < 80:
            enhanced += enhancement

    return enhanced


def _build_simple_short_script(topic: str) -> str:
    """Create a simple fallback script."""
    return (
        f"{topic} is an important concept worth understanding. "
        f"At its core, {topic} involves fundamental principles that can be applied in various contexts. "
        f"The key idea is to grasp the basic mechanics before moving to advanced applications. "
        f"For example, when working with {topic}, you'll often encounter common patterns and best practices. "
        f"Mastering these basics provides a solid foundation for more complex scenarios. "
        f"Remember that learning {topic} is a gradual process. Start with simple examples, practice regularly, "
        f"and gradually tackle more challenging aspects. With consistent effort, you'll develop a strong understanding "
        f"of {topic} and its applications."
    )


def _construct_shorts_prompt(topic: str, strict: bool = False) -> str:
    """Build the Gemini prompt for Quillium Shorts."""
    prompt = (
        f"You are a tutor. Explain the topic \"{topic}\" clearly to a beginner. "
        f"Define what \"{topic}\" is in the first two sentences. "
        f"Describe how \"{topic}\" works in simple language over the next four sentences. "
        f"Provide one concrete example of \"{topic}\" in sentences seven through ten. "
        f"Conclude with an important fact or rule about \"{topic}\" in sentences eleven through fourteen. "
        f"Keep the narration between 70 and 90 words, single paragraph, plain instructional text. "
        "Do NOT write motivational, reflective, calming, or meta language. "
        "Do NOT say 'imagine', 'picture', 'remember', 'calm', 'reminder', 'why it matters', or similar phrases. "
        "Do not use lists, headings, emojis, or rhetorical questions. "
        f"Keep mentioning \"{topic}\" so listeners stay anchored to \"{topic}\"."
    )

    if strict:
        prompt += (
            f" Repeat the exact phrase \"{topic}\" in at least three separate sentences and state its definition twice. "
            "Use shorter sentences and focus on verifiable facts only."
        )

    return prompt


def _sanitize_plain_text_script(raw_text: Optional[str]) -> str:
    """Remove code fences, quotes, and normalize whitespace for narration text."""
    if not raw_text:
        return ""
    text = raw_text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z]*", "", text).strip()
        if text.endswith("```"):
            text = text[:-3].strip()
    if text.startswith('"') and text.endswith('"') and len(text) > 1:
        text = text[1:-1].strip()
    text = re.sub(r"\s+", " ", text)
    return text


def _build_fallback_short_script(topic: str) -> str:
    """Return a clear error string when Gemini is unavailable."""
    safe_topic = topic if topic else "this topic"
    return (
        f"Error: Unable to generate a Quillium Shorts narration for '{safe_topic}' right now."
        " Please try again in a moment."
    )


if __name__ == "__main__":
    # Test with sample text
    sample_text = """
    Artificial Intelligence (AI) was coined by John McCarthy in 1956.
    McCarthy defined AI as "the science of making intelligent machines."
    Machine learning is a subset of AI that focuses on algorithms.
    """

    print("\n" + "="*60)
    print("TEST 1: Short Script Generation")
    print("="*60)

    test_topics = ["Binary Search", "OS Scheduling", "Machine Learning"]
    for topic in test_topics:
        print(f"\nTopic: {topic}")
        script = generate_short_form_script(topic)
        print(f"Script ({len(script.split())} words):")
        print(f"  {script[:150]}...")

    print("\n" + "="*60)
    print("TEST 2: Fallback Script (No API Key)")
    print("="*60)

    # Temporarily remove API key to test fallback
    original_key = os.environ.get("GEMINI_API_KEY")
    if "GEMINI_API_KEY" in os.environ:
        del os.environ["GEMINI_API_KEY"]

    fallback_script = generate_short_form_script("Test Topic")
    print(f"\nFallback script:")
    print(f"  {fallback_script[:200]}...")

    # Restore API key if it existed
    if original_key:
        os.environ["GEMINI_API_KEY"] = original_key

    print("\n" + "="*60)
    print("TEST 3: English MCQs")
    print("="*60)

    # Set a dummy API key for testing MCQ generation
    os.environ["GEMINI_API_KEY"] = "test-key-123"

    english_mcqs = make_mcqs(sample_text, language="English", max_questions=2)
    if english_mcqs:
        for i, mcq in enumerate(english_mcqs):
            print(f"\n{i+1}. {mcq['question']}")
            print(f"   ✓ Answer: {mcq['answer']}")
            print(f"   Options: {mcq['options']}")
            print(f"   Difficulty: {mcq['difficulty']}")
    else:
        print("No MCQs generated - API key issue or text too short")
