import fitz  # PyMuPDF
import re
from typing import Tuple, Optional
import io

def clean_text(text: str) -> str:
    """Clean extracted text."""
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove common PDF artifacts
    text = re.sub(r'-\n', '', text)  # Handle hyphenated line breaks
    text = re.sub(r'\n', ' ', text)  # Replace newlines with spaces
    # Remove page numbers and headers/footers (simple pattern)
    text = re.sub(r'\b\d+\b\s*$', '', text, flags=re.MULTILINE)
    # Remove special characters but keep basic punctuation
    text = re.sub(r'[^\w\s.,;:!?()-]', '', text)
    return text.strip()

def extract_text_from_pdf(file_content: bytes) -> Tuple[str, int]:
    """
    Extract text from PDF bytes.
    
    Args:
        file_content: PDF file bytes
        
    Returns:
        Tuple of (extracted_text, page_count)
    """
    try:
        # Open PDF from bytes
        doc = fitz.open(stream=file_content, filetype="pdf")
        page_count = doc.page_count
        full_text = ""
        
        print(f"📄 Processing {page_count} pages...")
        
        for page_num in range(page_count):
            page = doc[page_num]
            page_text = page.get_text("text").strip()
            if page_text:
                full_text += page_text + " "
        
        doc.close()
        
        # Clean the text
        full_text = clean_text(full_text)
        
        if len(full_text.strip()) < 50:
            return "This document contains minimal text. Please try a document with more content.", page_count
        
        print(f"✅ Extracted {len(full_text)} characters from {page_count} pages")
        return full_text.strip(), page_count
        
    except Exception as e:
        print(f"❌ PDF processing error: {e}")
        return f"Error processing PDF: {str(e)}", 0