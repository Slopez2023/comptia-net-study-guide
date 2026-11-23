<img src="assets/icon.svg" width="64" height="64" alt="">

# CompTIA Network+ (N10-009) Study Guide

A set of linked HTML pages for passing Network+ by **Mon Nov 30, 2026**. One hub links to a 16-day plan, 7 chapters (one per exam domain, plus Start Here and Final Review), a Study & Test hub (guided daily session, 306 exam-style questions + 21 PBQs, readiness meter, trap-pairs drill, cram sheet), 5 more practice tools and a dictionary of about 740 terms. Every lesson has the matching Professor Messer video embedded.

## Open it

**Online:** https://slopez2023.github.io/comptia-net-study-guide/ (works on your phone; progress is saved per browser).

**On this Mac:** Double-click **`Start Study Guide.command`** in Finder, or run:

```sh
./serve.sh          # → http://localhost:8742
```

YouTube's embedded player won't run on pages opened straight from a `file://` path, so use the local server. Everything except the embedded videos also works when you open `index.html` directly.

## How it's organized

```
index.html            Hub: "Do this next", countdown, today's checklist, chapters, weak spots
plan.html             16-day plan, Sun Nov 15 → Mon Nov 30 (exam date is editable)
dictionary.html       Dictionary: browse and search every term, 70 look-alike comparisons, a drill, a mastery map
chapters/00–06        One page per chapter. Each lesson follows the same numbered steps:
                      Goal → Watch → Read → See it for real → Learn/See it → Try it
                      → Exam traps → Scenario → Quick check → Say it back → Finish
practice/             exam (Study & Test hub: start here every day) · quiz · flashcards · subnetting · ports · review (spaced, due today)
assets/css/guide.css  The one stylesheet (Atkinson Hyperlegible fonts, light/dark themes)
assets/js/guide.js    Course map, plan, progress tracking, videos, quick checks
assets/js/exam.js     Study & Test hub: session, readiness, MC/PBQ runner, trap pairs, cram sheet
assets/js/exam/       Question bank: d1–d5 + d1b–d5b (twins), pbq + pbq2, legacy.js (why-wrong for the original 90)
assets/js/practice.js Practice tools
assets/js/dictionary.js Dictionary page (search, pronunciation, port chips, look-alikes, drill, know-it marks)
assets/js/glossary.js  Dotted-underline popovers for exam acronyms inside lessons
assets/js/activities.js Try-it activities (protocol step-throughs, PBQs, subnet bits, terminal)
assets/img/           Openly licensed photos (credits in data/images.json, shown in the lightbox)
research/             Research reports and the build plan behind v2
assets/js/data.js     Generated bundle of questions, cards, ports and videos
data/videos.json      YouTube video map (IDs verified via oEmbed, 2026-11-14)
data/dictionary.txt   Dictionary source: term | spelled out | objective | meaning | exam tip
data/dictionary-extras.txt  Pronunciations and look-alike groups (format in its header)
scripts/build_data.py Rebuilds data.js
```

Progress (lessons done, 1–5 confidence ratings, quiz answers) is saved in your browser's localStorage. Use **Export progress** on the hub to back it up.

## Data

Questions, flashcards, ports, acronyms and objectives come from `~/Study/Comptia Network+/data/`. That's the same data the `quiz.py` CLI uses. After you add cards or questions there, rebuild:

```sh
python3 scripts/build_data.py
```

### Adding dictionary terms

Add a line to `data/dictionary.txt` (format is in its header), then run `python3 scripts/build_data.py`. Terms that match the official acronym list get an "Exam list" badge automatically, and protocols pick up their port numbers from the ports table. Pronunciations and look-alike comparisons go in `data/dictionary-extras.txt`; the build fails with the line number if a name there doesn't match a term.

## Sources

- [CompTIA Network+ N10-009](https://www.comptia.org/en-us/certifications/network/): official objectives v4.0
- [Professor Messer N10-009 course](https://www.professormesser.com/network-plus/n10-009/n10-009-video/n10-009-training-course/): all 87 free videos
- [Practical Networking: Subnetting Mastery](https://www.practicalnetworking.net/stand-alone/subnetting-mastery/) and Jeremy's IT Lab: alternate subnetting explanations
