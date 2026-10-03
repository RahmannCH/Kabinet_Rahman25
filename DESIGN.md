---
version: 1.0
name: Kabinet Rahman 25 Public Website
description: Design system for an accessible, bright institutional website for HIMAKOM FMIPA ULM.
colors:
  canvas: '#FFFFFF'
  canvas-subtle: '#F5F7F5'
  ink: '#15243A'
  muted: '#637181'
  accent: '#087C78'
  accent-dark: '#075C5A'
  accent-soft: '#E7F3F1'
  border: '#DCE3E2'
typography:
  display: Plus Jakarta Sans
  body: DM Sans
---

# Design System: Kabinet Rahman 25

## 1. Visual Theme & Atmosphere

Bright, institutional, student-centered. Feel like a well-run university organization: open, credible, energetic but not promotional. White canvas, deep navy text, muted teal accent. Use real, approved campus imagery and clear hierarchy rather than decorative effects. Density 4/10, variance 5/10, motion 2/10.

Visual reference synthesis:
- BEM UAG contributes visible public navigation, editorial news/program surfaces, and clear public participation routes.
- BEM Polmed contributes strong cabinet identity and scannable organization/profile structures.
- BEM FKUB contributes photo-led identity and a clear organizational profile route.
- Do not replicate any reference site's exact composition, logos, copy, or imagery.

## 2. Color Palette & Roles

| Name | Value | Role |
|---|---|---|
| White Canvas | `#FFFFFF` | Main surface and header |
| Soft Canvas | `#F5F7F5` | Quiet alternating section surface |
| Navy Ink | `#15243A` | Headings and primary copy |
| Slate Copy | `#637181` | Supporting text; check contrast per size/surface |
| Muted Teal | `#087C78` | Single brand accent: links, markers, focus-adjacent cues |
| Deep Teal | `#075C5A` | Primary CTA and rare high-emphasis section |
| Pale Teal | `#E7F3F1` | Restrained tag/tint; never sole status cue |
| Structural Line | `#DCE3E2` | Dividers, boundaries and field edges |
| Error | `#B42318` | Error status with text/icon, not color alone |
| Warning | `#805600` | Warning status with text/icon, not color alone |
| Success | `#176B45` | Successful status with text/icon |
| Information | `#245A83` | Informational status with text/icon |

The teal is the only decorative accent. Error/success/warning/information colors are semantic states only. No cyan neon, purple gradients, glow, or full-page dark theme. Optional plum labels require separate brand approval and must not compete with teal.

## 3. Typography Rules

- **Display:** Plus Jakarta Sans, semibold/bold; controlled scale and tight but readable tracking.
- **Body/UI:** DM Sans; 16 px nominal body size, line-height 1.55–1.75.
- **Fallback:** system sans stack; the page remains legible if web fonts fail.
- **Paragraph measure:** target 60–70 characters per line.
- **Responsive scale:** H1 `clamp(2.75rem, 6vw, 5.5rem)`; section headings `clamp(2rem, 4vw, 3.5rem)`.
- Do not use uppercase tracking for every section; reserve it for occasional short labels.
- Never use text size/color alone to communicate status.

## 4. Component Stylings

### Header and navigation

- White, 64–80 px desktop, subtle structural bottom line; no detached floating glass pill.
- Cabinet mark and name are a home link. Show primary navigation inline on desktop.
- On mobile, use a 44×44 px minimum menu trigger with accessible name, `aria-expanded`, and `aria-controls`; expanded links remain visible, operable, and in logical focus order.
- Avoid hover-only menus and obscure nested dropdowns.

### Hero

- Asymmetric split: left-aligned identity/copy/one primary CTA; right side uses an approved local portrait or group image.
- Use a short headline and plain-language supporting copy. One primary CTA; secondary action is a simple text link only when it adds distinct intent.
- No fabricated metrics, generic feature chips, decorative scroll arrow, or unverified position/term claims.
- Keep text and image in separate spatial zones; no overlaps.

### Organization and program content

- Use list rows, section dividers, or small number of purposeful cards. Do not force every content unit into a card.
- Organization chart must have equivalent linear reading order and not rely on visual connectors alone.
- Program/news cards appear only for approved content with real destination, date and owner.
- Empty states explain what is unavailable and avoid promises about publication timing.

### Buttons and links

- Primary: deep-teal fill, white label after contrast verification, clear rectangular/small-radius form.
- Secondary: text or outline style. Do not duplicate same-intent CTAs with different labels.
- Hover changes color/border; active state gives subtle `translateY(1px)` or `scale(.98)` feedback. No glow.
- External destination is clear; do not use `href="#"` as a placeholder.

### Forms, alerts and overlays

- No form until a real endpoint/receiver and privacy policy exist.
- Future forms use visible label above each field, helper/error text adjacent, preserved values on failure, and explicit required/optional wording.
- Modal only for a task that cannot be represented inline. Label dialog, manage focus, close on Escape where safe, restore focus, prevent background interaction.
- Toast only for transient non-critical status; durable submission outcomes remain in page content.

## 5. Layout Principles

- Center content in a 1200–1280 px max-width; body text stays 60–70ch.
- 4 px base spacing scale; common tokens 4, 8, 12, 16, 24, 32, 48, 64, 80, 96.
- Hero uses a desktop asymmetric two-column layout. All multi-column content collapses to one column below 768 px.
- Keep primary nav on one row at desktop. Condense secondary labels before hiding essential navigation.
- On mobile, content order becomes identity → message → CTA → image; avoid side-by-side text/image squeeze.
- No horizontal overflow at 320 CSS px. Long organization names wrap; images preserve aspect ratio and focal point.
- Alternate white/off-white sections only within same light theme. Deep teal is allowed for one deliberate emphasis section, not random section inversion.
- Avoid three equal feature columns, empty bento cells, arbitrary sidebar, nested card-inside-card, and excessive rounded-card framing.

## 6. Motion & Interaction

- Motion intensity 2/10. Native smooth anchor navigation only where reduced-motion preference allows.
- Use short 150–250 ms color/opacity/transform transitions for controls; animate only transform and opacity.
- No scroll hijack, parallax, count-up stats, perpetual loops, auto-rotating carousel, or scroll-reveal dependency.
- Honor `prefers-reduced-motion: reduce`; use immediate state changes and non-smooth anchor movement.
- Focus remains visible and is never obscured by sticky header/menu.
- Loading/error/success states must represent real work; never simulate network delivery.

## 7. Anti-Patterns (Banned)

- Dark cyan/tech dashboard language, neon cyan, purple/blue gradients or glow.
- Glassmorphism applied across the page, heavy blur, volumetric/neumorphic shadows.
- Invented mission, leadership roster, counts, program titles, date, contact details, or testimonials.
- Fake submission success, inert CTA, dead social icon, unverified registration link.
- Three equal generic feature cards repeated across sections.
- Hidden desktop navigation, hover-only controls, non-semantic clickable `div`.
- Text/image overlap, autoplay carousel, perpetual motion, unrequested dark-mode toggle.
- NIM or personal data publication without purpose and explicit approval.
- Reference-site asset/copy reuse without rights.

## 8. Agent Prompt Guide

Build or revise the public Kabinet Rahman 25 site using this file as visual source of truth. Keep the tone institutional, bright, restrained, and student-centered. Reuse only approved local assets. Use the white/navy/muted-teal palette and preserve semantic content hierarchy. Do not add facts that are not in approved content. Keep the page usable at 320 px, keyboard-operable, WCAG 2.2 AA-targeted, and resilient when external fonts fail. Prefer native HTML/CSS over new dependencies. Before release, check contrast, focus, reduced motion, local assets, internal links, and stale/dummy content.
