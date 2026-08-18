# Docs Review Coach — Design Specification

## Purpose
Replace the confusing Docs Scoring Wizard spreadsheet and long companion document with one mobile-first, self-contained study/calibration web app plus a printable one-page Axis Atlas.

## Source hierarchy
1. Task or assessment instructions
2. Docs campaign rules
3. General Vault guide

The app distinguishes source-derived Docs definitions from model-derived calibration heuristics. It never represents the issue-count mapping as an official exact Docs formula.

## Privacy and compliance
- No backend, authentication, analytics, external API, network storage, uploads, or AI features.
- User progress is stored only in browser localStorage.
- Persistent notice: do not enter confidential task content; use generic labels only.
- The tool provides fictional examples and rationale structures, never completed official-task answers.

## Information architecture
- Start
- Axis Atlas
- Classify
- Score
- Practice
- Help/Terms drawer
- Printable `/atlas`-style view within the single-page app

## Official Docs taxonomy
### Content
- Instruction Following
- Writing Substance
- Writing Style
- Document Structure
- Citations

### Visual Aesthetics
- Color
- Fonts
- Readability
- Tables
- Charts
- Images

### Editability
Top-level axis only. The supplied guide does not show an official Docs Editability sub-axis list, so none is invented.

## Core interaction principles
- Progressive disclosure: one decision at a time.
- Dependent choices: only valid sub-axes appear for the selected top-level axis.
- No visible database language such as ID, effective tier, or row.
- Plain-language severity questions determine a suggested Minor, Moderate, Major, or Complete failure classification.
- Score calibrator uses a 0–5 decision tree and displays official definition separately from calibration interpretation.
- Overall is never calculated as a mathematical average.

## Classification logic
1. Route to Content, Visual Aesthetics, or Editability.
2. Route to an official sub-axis only when one exists.
3. Ask scope: one place, several places, or throughout.
4. Ask whether a core requirement/use case is affected.
5. Ask whether a professional can use the document without fixing it.
6. Ask repair burden: tiny cleanup, noticeable revision, substantial rewrite/rebuild, unusable.
7. Suggest severity with explanation and one contrasting category.

## Score calibration logic
- 0: axis fundamentally fails.
- 1: multiple Major/pervasive failures or normal use materially blocked.
- 2: one Major/core issue requiring substantial revision.
- 3: repeated/systemic Moderate weakness or several visible Minor issues; still usable.
- 4: a few localized Minor issues; no repeated/systemic weakness or core gap.
- 5: no meaningful defect.

Professional impact overrides arithmetic. Official axis wording decides the final score.

## Practice
Twelve fictional cases teach category boundaries and severity. Each case presents one card, accepts axis/sub-axis/severity choices, and reveals the recommended route, explanation, and a “Not X because…” contrast.

## Visual design
- Dark mode default; optional light mode.
- Mobile-first and optimized for Samsung phone width.
- Large tap targets, high contrast, restrained color system.
- Content, Visual, and Editability have distinct accent families.
- Bottom navigation on mobile; compact top navigation on desktop.
- No horizontal scrolling or dense tables on mobile.
- Printable landscape Axis Atlas fits one page.

## Acceptance criteria
- Content choices never show Visual sub-axes.
- Visual choices never show Content sub-axes.
- Editability never shows invented official sub-axes.
- All score outcomes 0–5 are reachable and correctly explained.
- App persists only generic progress locally and can clear it in one tap.
- Print view fits one landscape page without overflow.
