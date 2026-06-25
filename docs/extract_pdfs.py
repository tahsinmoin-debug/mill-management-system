import PyPDF2
import sys

for filename in ['Clothing Mill Production & Wage Management System.pdf', 'Tech Stack.pdf']:
    outname = filename.replace('.pdf', '.txt').replace(' ', '_').replace('&', 'and')
    with open(f'f:/mill-management-system/{filename}', 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        with open(f'f:/mill-management-system/{outname}', 'w', encoding='utf-8') as out:
            for i, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    out.write(f"--- Page {i+1} ---\n")
                    out.write(text)
                    out.write("\n\n")
    print(f"Saved {outname}")
