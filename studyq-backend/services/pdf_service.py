import fitz  # PyMuPDF


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extract all text from a PDF file given its raw bytes.
    Returns the combined text from all pages.
    """
    text_parts = []
    try:
        with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
            for page in doc:
                text_parts.append(page.get_text("text"))
    except Exception as e:
        print(f"Error reading PDF with PyMuPDF: {e}")
        return "" # Return empty string on failure, handled by routes
        
    return "\n".join(text_parts).strip()
