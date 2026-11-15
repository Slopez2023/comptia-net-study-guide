<img src="assets/icon.svg" width="64" height="64" alt="">

# CompTIA Network+ (N10-009) Study Guide

A set of linked HTML pages for passing Network+ by **Mon Nov 30, 2026**. One hub links to a 16-day plan, 7 chapters (one per exam domain, plus Start Here and Final Review) and 4 practice tools. Every lesson has the matching Professor Messer video embedded.

## Open it

Double-click **`Start Study Guide.command`** in Finder, or run:

```sh
./serve.sh          # → http://localhost:8742
```

YouTube's embedded player won't run on pages opened straight from a `file://` path, so use the local server. Everything except the embedded videos also works when you open `index.html` directly.

## How it's organized

```
index.html            Hub: "Do this next", countdown, today's checklist, chapters, weak spots
plan.html             16-day plan, Nov 14 → Nov 30 (exam date is editable)
chapters/00–06        One page per chapter. Each lesson follows the same 7 steps:
                      Goal → Watch → Learn → See it → Exam traps → Quick check → Finish
practice/             quiz · flashcards · subnetting · ports
assets/css/guide.css  The one stylesheet (Atkinson Hyperlegible fonts, light/dark themes)
assets/js/guide.js    Course map, plan, progress tracking, videos, quick checks
assets/js/practice.js Practice tools
assets/js/data.js     Generated bundle of questions, cards, ports and videos
data/videos.json      YouTube video map (IDs verified via oEmbed, 2026-11-14)
scripts/build_data.py Rebuilds data.js
```

Progress (lessons done, 1–5 confidence ratings, quiz answers) is saved in your browser's localStorage. Use **Export progress** on the hub to back it up.

## Data

Questions, flashcards, ports, acronyms and objectives come from `~/Study/Comptia Network+/data/`. That's the same data the `quiz.py` CLI uses. After you add cards or questions there, rebuild:

```sh
python3 scripts/build_data.py
```

## Sources

- [CompTIA Network+ N10-009](https://www.comptia.org/en-us/certifications/network/): official objectives v4.0
- [Professor Messer N10-009 course](https://www.professormesser.com/network-plus/n10-009/n10-009-video/n10-009-training-course/): all 87 free videos
- [Practical Networking: Subnetting Mastery](https://www.practicalnetworking.net/stand-alone/subnetting-mastery/) and Jeremy's IT Lab: alternate subnetting explanations
