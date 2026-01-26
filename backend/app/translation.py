import os
import json
import requests
from typing import List, Dict
from .mcq_generator import translate_text

def translate_full_json(data: List[Dict], lang: str) -> List[Dict]:
    """Translate an entire JSON list of MCQs or flashcards."""
    if lang == "English":
        return data

    # Use OpenRouter for better translation if API key is available
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if api_key:
        return translate_with_openrouter(data, lang)
    
    # Fallback to local translator
    return translate_locally(data, lang)

def translate_locally(data: List[Dict], lang: str) -> List[Dict]:
    """Translate using local translator model."""
    translated = []
    for item in data:
        try:
            new_item = {}
            
            # Translate question
            if "question" in item:
                new_item["question"] = translate_text(item["question"], lang)
            
            # Translate answer
            if "answer" in item:
                new_item["answer"] = translate_text(item["answer"], lang)
            
            # Translate options if present
            if "options" in item:
                translated_options = []
                seen_options = set()
                for opt in item["options"]:
                    translated_opt = translate_text(opt, lang)
                    if translated_opt.lower() not in seen_options:
                        seen_options.add(translated_opt.lower())
                        translated_options.append(translated_opt)
                
                # Ensure we have exactly 4 unique options
                while len(translated_options) < 4:
                    translated_options.append(f"Option {len(translated_options) + 1}")
                
                new_item["options"] = translated_options[:4]
            
            # Keep other fields
            for key in item:
                if key not in ["question", "answer", "options"]:
                    new_item[key] = item[key]
            
            translated.append(new_item)
        except Exception as e:
            print(f"⚠️ Translation error for item: {e}")
            translated.append(item)  # Keep original on error
    
    return translated

def translate_with_openrouter(data: List[Dict], lang: str) -> List[Dict]:
    """Translate using OpenRouter API for better quality."""
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        return translate_locally(data, lang)

    prompt = f"""
Translate the following JSON into **{lang}**.
Keep the JSON structure EXACTLY the same.
Do NOT add explanations or modify the format.

JSON:
{json.dumps(data, ensure_ascii=False)}
"""

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    body = {
        "model": "deepseek/deepseek-r1:7b",
        "messages": [
            {"role": "system", "content": "Return STRICT JSON only. No explanations."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.1,
        "max_tokens": 2200,
    }

    try:
        print(f"🌍 Translating to {lang} via OpenRouter...")
        response = requests.post(url, headers=headers, json=body, timeout=60)
        response.raise_for_status()
        result = response.json()["choices"][0]["message"]["content"]
        
        # Clean the response
        result = result.replace("```json", "").replace("```", "").strip()
        
        # Parse the JSON
        translated_data = json.loads(result)
        print(f"✅ Translation complete")
        return translated_data
        
    except Exception as e:
        print(f"⚠️ OpenRouter translation failed: {e}")
        # Fallback to local translation
        return translate_locally(data, lang)