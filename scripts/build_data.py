#!/usr/bin/env python3
"""Bundle the study data into assets/js/data.js so every page works offline.

Sources:
  ~/Study/Comptia Network+/data/*   objectives, flashcards, questions, ports, acronyms
  data/videos.json                  curated YouTube video map (this repo)
  data/images.json                  openly licensed photos in assets/img (this repo)
  data/dictionary.txt               hand-written terms and definitions (this repo)
  data/dictionary-extras.txt        pronunciations and look-alike comparisons for the dictionary (this repo)

Re-run after editing any of those files:
  python3 scripts/build_data.py [--study PATH]
"""
import argparse
import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_STUDY = Path.home() / "Study" / "Comptia Network+"


def read_csv(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def read_dictionary(path, acronyms):
    """Parse data/dictionary.txt: term | spelled out | objective | meaning | exam tip (optional)."""
    official = {a["acronym"].lower() for a in acronyms}
    entries, seen = [], set()
    for n, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip() or line.startswith("#"):
            continue
        f = [x.strip() for x in line.split("|")]
        if len(f) not in (4, 5) or not f[0] or not f[3]:
            raise SystemExit(f"{path.name}:{n}: expected 4 or 5 fields separated by |")
        key = (f[0].lower(), f[1].lower())
        if key in seen:
            raise SystemExit(f"{path.name}:{n}: duplicate term {f[0]!r} ({f[1]!r})")
        seen.add(key)
        e = {"t": f[0], "f": f[1], "o": f[2], "d": f[3]}
        if len(f) == 5 and f[4]:
            e["x"] = f[4]
        if f[1] and f[0].lower() in official:
            e["a"] = 1  # on the official CompTIA acronym list
        entries.append(e)
    entries.sort(key=lambda e: (e["t"].lower(), e["f"].lower()))
    return entries


def read_extras(path, entries):
    """Attach pronunciations and look-alike groups from data/dictionary-extras.txt to the entries."""
    by_term = {}
    for e in entries:
        by_term.setdefault(e["t"].lower(), []).append(e)

    def find(ref, n):
        term, _, full = ref.partition("@")
        hits = by_term.get(term.strip().lower(), [])
        if full:
            hits = [e for e in hits if e["f"].lower() == full.strip().lower()]
        if len(hits) > 1:  # ARP the protocol vs arp the command: an exact-case match wins
            hits = [e for e in hits if e["t"] == term.strip()] or hits
        if len(hits) != 1:
            raise SystemExit(f"{path.name}:{n}: {ref!r} matches {len(hits)} dictionary terms (use TERM@Spelled out)")
        return hits[0]

    mixups, section = [], None
    for n, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("["):
            section = line.strip("[]")
            continue
        f = [x.strip() for x in line.split("|")]
        if section == "say":
            if len(f) != 3:
                raise SystemExit(f"{path.name}:{n}: expected term | respelling | spoken")
            find(f[0], n)["s"] = [f[1], f[2]]
        elif section == "mixups":
            if len(f) != 3:
                raise SystemExit(f"{path.name}:{n}: expected title | rule | TERM = note ; TERM = note")
            items = []
            for part in f[2].split(" ; "):
                ref, _, note = part.partition(" = ")
                e = find(ref, n)
                items.append({"r": e["t"] + "|" + e["f"], "n": note.strip()})
            for it in items:
                find(it["r"].split("|")[0] + ("@" + it["r"].split("|")[1] if it["r"].split("|")[1] else ""), n).setdefault("m", []).append(len(mixups))
            mixups.append({"title": f[0], "rule": f[1], "items": items})
    return mixups


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--study", type=Path, default=DEFAULT_STUDY)
    args = ap.parse_args()
    data_dir = args.study / "data"

    objectives = {}
    for row in read_csv(data_dir / "objectives.csv"):
        o = objectives.setdefault(row["objective_id"], {
            "id": row["objective_id"],
            "domain": int(row["objective_id"].split(".")[0]),
            "title": row["objective_title"],
            "topics": {},
        })
        o["topics"].setdefault(row["topic"], [])
        if row["subtopic"]:
            o["topics"][row["topic"]].append(row["subtopic"])

    cards = [
        {"obj": r["objective_id"], "front": r["front"], "back": r["back"], "set": "concepts"}
        for r in read_csv(data_dir / "flashcards.csv")
    ]
    ports = read_csv(data_dir / "ports.csv")
    for p in ports:
        cards.append({
            "obj": "1.4",
            "front": f"Port {p['port']} ({p['transport']})" if not p["port"].startswith("IP") else p["port"],
            "back": f"{p['acronym']} — {p['protocol']}" + (f". {p['notes']}" if p["notes"] else ""),
            "set": "ports",
        })
    acronyms = read_csv(data_dir / "acronyms.csv")
    for a in acronyms:
        cards.append({"obj": "", "front": a["acronym"], "back": a["spelled_out"], "set": "acronyms"})

    questions = json.loads((data_dir / "practice_questions.json").read_text(encoding="utf-8"))
    videos = json.loads((ROOT / "data" / "videos.json").read_text(encoding="utf-8"))["videos"]
    images = json.loads((ROOT / "data" / "images.json").read_text(encoding="utf-8"))

    dictionary = read_dictionary(ROOT / "data" / "dictionary.txt", acronyms)
    mixups = read_extras(ROOT / "data" / "dictionary-extras.txt", dictionary)

    bundle = {
        "objectives": list(objectives.values()),
        "cards": cards,
        "questions": questions,
        "ports": ports,
        "acronyms": acronyms,
        "videos": videos,
        "images": images,
        "dictionary": dictionary,
        "mixups": mixups,
    }
    out = ROOT / "assets" / "js" / "data.js"
    out.write_text(
        "// Generated by scripts/build_data.py. Do not edit by hand.\n"
        "window.NP_DATA = " + json.dumps(bundle, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )
    print(f"wrote {out.relative_to(ROOT)}: {len(objectives)} objectives, {len(cards)} cards, "
          f"{len(questions)} questions, {len(videos)} videos, {len(images)} images, {len(dictionary)} dictionary terms, {len(mixups)} look-alike groups")


if __name__ == "__main__":
    main()
