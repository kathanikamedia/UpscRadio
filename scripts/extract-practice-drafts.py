"""Extract review-only MCQ candidates; never publishes questions or answers."""
import json
import re
from pathlib import Path
from pypdf import PdfReader

source = Path(r"C:\Users\shrav\Downloads")
target = Path("private/practice-review")
books = {
    "economy-1": ("Economy_Part1_174_MCQs_APPSCExamEdge.pdf", 174),
    "economy-2": ("Economy_Part2_160_MCQs_APPSCExamEdge.pdf", 160),
    "economy-3": ("Economy_Part3_160_MCQs_APPSCExamEdge.pdf", 160),
    "economy-4": ("Economy_Part4_159_MCQs_APPSCExamEdge.pdf", 159),
    "environment-1": ("1 (1).pdf", 178),
    "environment-2": ("2.pdf", 175),
    "environment-3": ("3.pdf", 177),
}

target.mkdir(parents=True, exist_ok=True)
for slug, (filename, expected) in books.items():
    pages = [page.extract_text() or "" for page in PdfReader(source / filename).pages]
    key_page = next((i for i, page in enumerate(pages) if i > 3 and re.search(r"\bAnswer Key\b", page, re.I)), None)
    if key_page is None:
        print(f"{slug}: answer key not found; skipped")
        continue
    question_text = "\n".join(pages[2:key_page])
    question_text = re.sub(r"(?m)^.*@APPSCExamEdge.*$|^Join t\.me/APPSCExamEdge.*$", "", question_text)
    starts = list(re.finditer(r"(?m)^(\d{1,3})\.\s{2,}(?=\S)", question_text))
    candidates = []
    for index, match in enumerate(starts):
        number = int(match.group(1))
        text = question_text[match.end():starts[index + 1].start() if index + 1 < len(starts) else len(question_text)].strip()
        text = re.split(r"(?m)^SECTION\s+\d+\s*$", text, maxsplit=1)[0].strip()
        labels = list(re.finditer(r"\(([a-d])\)\s+", text))
        if [x.group(1) for x in labels] != list("abcd"):
            continue
        options = [re.sub(r"\s+", " ", text[item.end():labels[i + 1].start() if i + 1 < 4 else len(text)]).strip() for i, item in enumerate(labels)]
        stem = text[:labels[0].start()].strip()
        if not stem or any(not value for value in options):
            continue
        candidates.append({"number": number, "question": stem, "options": options})
    key_text = "\n".join(pages[key_page:])
    answers = {}
    for number, answer in re.findall(r"\b(\d{1,3})\.\s*\(([a-d])\)", key_text):
        answers.setdefault(int(number), set()).add(answer)
    counts = {}
    for item in candidates:
        counts[item["number"]] = counts.get(item["number"], 0) + 1
    verified = []
    for item in candidates:
        number = item["number"]
        if number <= expected and counts[number] == 1 and len(answers.get(number, set())) == 1:
            item["answer"] = next(iter(answers[number]))
            verified.append(item)
    missing = [number for number in range(1, expected + 1) if number not in {item["number"] for item in verified}]
    (target / f"{slug}.json").write_text(json.dumps({"source": filename, "review_required": True, "expected": expected, "candidates": verified, "missing": missing}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{slug}: {len(verified)}/{expected} structurally matched; {len(missing)} missing. All candidates require content review.")
