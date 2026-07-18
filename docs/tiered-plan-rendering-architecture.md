# Tiered Plan Rendering Architecture (Tier 1 → Tier 3)

## Goal
Create a deterministic, agentic rendering pipeline where Tier 1 remains the **semantic truth**, and Tiers 2–3 are **pure transformations** of Tier 1 (visual + tonal, never new content). This preserves the current Tier-1 PDF and scroll-only viewer while enabling the card-based visual layout shown in your mock. 

## Core Principle
- **Tier 1 decides what is true.**
- **Tier 2 decides how it is shown.**
- **Tier 3 decides how it is defended.**

Tier 2 and Tier 3 must **not** introduce new plans or assumptions. They only re-render Tier 1 content.

---

## System Overview (4 Agent Layers)

### Layer 1 — Content Authority (Existing)
**Input:** User data + business context
**Output:** Tier-1 canonical plan (text + tables)

Responsibilities:
- Generates the actual business plan content
- Owns the numbers, sections, and wording
- Stays unchanged across all tiers

### Layer 2 — Semantic Tagging Agent (Add)
**Input:** Tier-1 output
**Output:** Tier-1 output **plus tags**

Responsibilities:
- Adds semantic labels (no content edits)
- Identifies visualization candidates
- Marks key metrics, assumptions, comparisons, risks

Example tag payload:
```json
{
  "section": "Market",
  "type": "analysis",
  "confidence": "medium",
  "visual_candidate": ["bar_chart", "donut"],
  "key_metrics": ["market_size", "growth_rate"]
}
```

Suggested tags:
- `narrative`
- `decision`
- `metric`
- `comparison`
- `risk`
- `assumption`
- `constraint`

**Why this layer is mandatory:** Without semantic tags, visuals become decorative instead of meaningful.

### Layer 3 — Visual Composition Agent (Tier-Driven)
**Input:** Tier-1 content + tags
**Output:** Layout/structure directives (no wording changes)

Responsibilities:
- Converts tags into visual structures
- Applies tier-specific formatting rules
- Decides card grouping, chart usage, and emphasis

**Tier 1 behavior**
- Linear text
- Tables only
- Grayscale
- No cards or charts

**Tier 2 behavior**
- Convert tagged sections into visual blocks
- Replace tables with charts (bar, donut, stacked)
- Group content into cards
- Use brand-neutral, muted palette

**Tier 3 behavior**
- Everything in Tier 2
- Visual emphasis for risk/assumption/constraint tags
- Add callout boxes, footnotes, appendix boundaries

### Layer 4 — Rendering Agent (UI / PDF / Web)
**Input:** Layout directives + tokens
**Output:** Final UI (scroll cards), PDF, or other render target

Responsibilities:
- Maps card types to actual components
- Applies color tokens + typography
- Renders chart components and layout grids

---

## Concrete Transformation Example
### Tier-1 Source (Current)
From **Exploitatiebegroting** section:
- Revenue table
- Cost table
- EBITDA line
- Break-even paragraph

### Tier-2 Transformation
- **Revenue** → bar chart card
- **Cost structure** → stacked bar
- **EBITDA** → KPI tile highlight
- **Break-even** → donut chart
- Text shortened to captions (no new content)

### Tier-3 Transformation
- **Break-even** card gains:
  - “Key assumption” badge
  - Sensitivity note
- **EBITDA** card adds downside annotation
- Ratios grouped into a **“Bank metrics” panel**

No new assumptions. No new numbers. Only framing and emphasis.

---

## Visual Eligibility Rules (Deterministic)
Define rules once, then apply mechanically:

- If section contains **≥ 2 numeric series** → chart candidate
- If text includes comparison words ("meer dan", "lager dan") → comparison card
- If SWOT → 4-card grid
- If financial ratio → KPI tile
- If assumption/risk → callout box (Tier 3 only)

These rules prevent random visual invention.

---

## Color & Style Logic
Do **not** let the model choose colors freely.

### Fixed Semantic Palette
- **Green** → positive / strength
- **Orange** → attention / assumption
- **Red** → risk (Tier 3 only)
- **Gray** → neutral context

### Tier Mapping
- **Tier 1** → grayscale only
- **Tier 2** → muted palette
- **Tier 3** → restrained emphasis

---

## Operational Benefits
- **Tier 1 compute**: cheap, text-only
- **Tier 2 compute**: layout + chart transforms
- **Tier 3 compute**: same visuals + extra tagging

You never regenerate intelligence, only render it.

---

## Anti-Patterns to Avoid
- ❌ Letting design agents rewrite content
- ❌ Letting visuals invent insights
- ❌ Stock images (credibility loss)
- ❌ Tier drift from Tier 1 semantics

---

## One-Sentence Summary
**Tier 1 decides what is true. Tier 2 decides how it is shown. Tier 3 decides how it is defended.**
