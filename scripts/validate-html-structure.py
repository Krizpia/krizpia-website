#!/usr/bin/env python3
"""Validate that static HTML pages contain exactly one document shell.

This catches accidental whole-page paste duplication, such as multiple
DOCTYPE, html, head, body, or closing html tags in a single file.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IGNORED_DIRS = {".git", "node_modules", "dist", "build"}
PATTERNS = {
    "<!DOCTYPE html>": re.compile(r"<!doctype\s+html\s*>", re.IGNORECASE),
    "<html>": re.compile(r"<html\b", re.IGNORECASE),
    "<head>": re.compile(r"<head\b", re.IGNORECASE),
    "</head>": re.compile(r"</head\s*>", re.IGNORECASE),
    "<body>": re.compile(r"<body\b", re.IGNORECASE),
    "</body>": re.compile(r"</body\s*>", re.IGNORECASE),
    "</html>": re.compile(r"</html\s*>", re.IGNORECASE),
}


def html_files() -> list[Path]:
    return sorted(
        path
        for path in ROOT.rglob("*.html")
        if not any(part in IGNORED_DIRS for part in path.relative_to(ROOT).parts)
    )


def main() -> int:
    failures: list[str] = []

    for path in html_files():
        text = path.read_text(encoding="utf-8", errors="ignore")
        rel = path.relative_to(ROOT)
        for label, pattern in PATTERNS.items():
            count = len(pattern.findall(text))
            if count != 1:
                failures.append(f"{rel}: expected exactly 1 {label}, found {count}")

    if failures:
        print("HTML structure validation failed:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        return 1

    print(f"HTML structure validation passed for {len(html_files())} file(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
