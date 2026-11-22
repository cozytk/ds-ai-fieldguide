"""Run in the practice directory after opening handover.xlsx in desktop Excel."""
from pathlib import Path

import xlwings as xw

target = (Path(__file__).resolve().parent / "handover.xlsx").resolve()
matches = [
    book
    for app in xw.apps
    for book in app.books
    if Path(book.fullname).resolve() == target
]
if len(matches) != 1:
    raise SystemExit("Open this folder's handover.xlsx once in desktop Excel and retry.")
print("교대!B2 =", matches[0].sheets["교대"].range("B2").value)
