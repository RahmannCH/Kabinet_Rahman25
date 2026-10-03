# Product Requirements Document — Kabinet Rahman 25

**Status:** Draft specification for public-site evolution  
**Product:** Kabinet Rahman 25, HIMAKOM FMIPA Universitas Lambung Mangkurat  
**Current release:** Static public website, editorial-owned content  
**Out of scope:** Public admin, authentication, CMS, CRUD, database, and aspiration-processing backend

## Problem Statement

Mahasiswa dan mitra kampus memerlukan satu sumber publik yang jelas untuk mengenali Kabinet Rahman 25, memahami struktur dan kegiatan, serta menemukan kanal resmi untuk berpartisipasi. Website sebelumnya mencampur dashboard internal, konten contoh, data personal, dan interaksi yang tidak benar-benar mengirim pesan. Hal itu berisiko membuat informasi palsu tampak resmi dan menciptakan ekspektasi layanan yang tidak dipenuhi.

## Solution

Sediakan situs publik responsif yang menyajikan identitas, profil, struktur, program, kabar, dan kontak berdasarkan konten yang disetujui organisasi. Fase saat ini tetap statis: konten dikelola melalui source, tidak ada akun visitor, tidak ada pemrosesan aspirasi, dan tidak ada admin publik. Konten yang belum disahkan ditahan atau diberi status belum tersedia.

## Product Goals and Non-goals

### Goals

- Jadi sumber informasi publik yang akurat dan mudah dipindai.
- Membuat pengunjung cepat menemukan organisasi, program, kabar, dan kanal resmi.
- Berfungsi konsisten pada ponsel, tablet, desktop, keyboard, dan pembaca layar.
- Memuat cepat dengan dependency dan transfer data minimum.
- Membuat pemilik konten paham data apa yang perlu disediakan sebelum publikasi.

### Non-goals

- Login, registrasi, role-based admin, CRUD, LocalStorage sebagai database.
- CMS, API konten, database, analitik visitor, newsletter, atau notifikasi.
- Pengumpulan aspirasi sebelum ada endpoint, penerima, kebijakan privasi, dan ekspektasi tindak lanjut.
- PWA/offline install, dark-mode toggle, pencarian, filter, carousel, statistik count-up tanpa kebutuhan/data.
- Menggunakan ulang aset atau salinan konten dari situs referensi tanpa izin.

## Domain Glossary

| Term | Meaning |
|---|---|
| Cabinet / Kabinet | Kepengurusan HIMAKOM dengan identitas dan periode tertentu. Periode harus dikonfirmasi. |
| Public visitor | Orang yang mengakses situs tanpa login atau hak istimewa. |
| Organizational unit | BPH, departemen, atau divisi yang menjadi bagian struktur. Nama/unit final perlu persetujuan organisasi. |
| Program | Kegiatan resmi yang memiliki pemilik, status, ringkasan, tanggal atau periode, dan CTA bila tersedia. |
| Update / Kabar | Konten editorial resmi dengan tanggal publikasi, penulis/unit, dan sumber media. |
| Official channel | Email, form, nomor, alamat, atau akun media sosial yang dikendalikan/diakui organisasi. |
| Approved content | Informasi yang ditinjau dan disetujui pemilik organisasi untuk publikasi. |
| Aspirasi | Pesan/masukan pengunjung. Pesan hanya dianggap terkirim bila endpoint resmi mengonfirmasi penerimaan. |
| Provisional content | Narasi atau daftar yang ditemukan pada source lama namun belum disahkan untuk publik. Tidak boleh diberi label sebagai fakta resmi. |

## Product Invariants

1. Tidak ada konten provisional yang dipresentasikan sebagai kebijakan/fakta resmi.
2. Tidak ada angka, jumlah, tanggal, nama, NIM, peran, kontak, atau program yang dibuat-buat.
3. Tidak ada pesan sukses kecuali penerima/endpoint mengonfirmasi penerimaan.
4. Tidak ada CTA atau ikon sosial tanpa destination yang valid.
5. Tidak mengumpulkan atau menyimpan data personal visitor pada fase statis.
6. NIM tidak dipublikasikan secara default. Nama/foto anggota perlu otorisasi dan consent yang sesuai.
7. Konten media pihak ketiga memerlukan hak penggunaan, kredit bila diwajibkan, dan metadata pemilik.
8. Tampilan organisasi memiliki representasi semantik/linear yang dapat dibaca tanpa mengandalkan diagram visual.
9. Essential public content tetap tersedia bila font eksternal atau JavaScript gagal.
10. Semua keputusan visual harus sesuai `DESIGN.md`; warna status tidak dipakai sebagai aksen dekoratif.

## User Stories

1. Sebagai mahasiswa HIMAKOM, saya ingin tahu identitas kabinet agar dapat memastikan bahwa saya membaca sumber resmi.
2. Sebagai mahasiswa baru, saya ingin memahami peran organisasi agar tahu apakah situs ini relevan bagi saya.
3. Sebagai pengunjung, saya ingin membaca visi-misi yang disahkan agar tidak keliru mengira copy promosi sebagai kebijakan.
4. Sebagai mahasiswa, saya ingin melihat struktur unit agar tahu bidang organisasi yang dapat saya hubungi.
5. Sebagai pembaca screen reader, saya ingin struktur organisasi tersaji dalam urutan semantik agar hubungan peran tetap terbaca.
6. Sebagai calon peserta, saya ingin menemukan program yang masih aktif agar tidak membuka pendaftaran kedaluwarsa.
7. Sebagai pengunjung, saya ingin melihat tanggal, status, dan lokasi kegiatan agar dapat menilai relevansinya.
8. Sebagai mitra, saya ingin menemukan kontak resmi agar dapat mengajukan kolaborasi.
9. Sebagai mahasiswa, saya ingin menyampaikan aspirasi melalui kanal yang jelas agar pesan sampai kepada penerima yang bertanggung jawab.
10. Sebagai pengunjung, saya ingin tahu jika kanal aspirasi belum tersedia agar tidak mengira pesan saya terkirim.
11. Sebagai pengguna ponsel, saya ingin navigasi mudah dibuka dan ditutup agar dapat berpindah bagian dengan satu tangan.
12. Sebagai pengguna keyboard, saya ingin semua link dan kontrol dapat difokuskan serta dioperasikan tanpa pointer.
13. Sebagai pengguna low vision, saya ingin teks dan kontrol memiliki kontras yang cukup agar konten terbaca.
14. Sebagai pengguna reduced-motion, saya ingin gerak non-esensial dimatikan agar halaman nyaman digunakan.
15. Sebagai pengguna koneksi lambat, saya ingin gambar disajikan sesuai ukuran layar agar halaman cepat terbuka.
16. Sebagai pengguna dengan JavaScript gagal, saya ingin konten utama tetap terbaca agar informasi tidak hilang.
17. Sebagai pengunjung saat kabar kosong, saya ingin empty state yang jujur agar tidak mengira ada gangguan.
18. Sebagai pengunjung yang mengikuti tautan lama, saya ingin halaman 404 yang memberi jalan kembali agar tidak menemui dead end.
19. Sebagai pemilik konten, saya ingin checklist publikasi agar tanggal, kontak, foto, dan fakta sudah diverifikasi.
20. Sebagai editor, saya ingin program berstatus draft tidak tampil publik agar informasi internal tidak bocor.
21. Sebagai editor, saya ingin materi yang kadaluarsa bisa diarsipkan atau diberi status selesai agar link registrasi tidak menyesatkan.
22. Sebagai pemilik kabinet, saya ingin perubahan konten bisa dirilis melalui review agar publikasi tidak bergantung pada edit langsung tanpa pemeriksaan.
23. Sebagai pengguna, saya ingin ukuran layar dan orientasi tidak merusak layout agar situs dapat digunakan di perangkat beragam.
24. Sebagai pengelola situs, saya ingin tahu bila aset/link lokal rusak sebelum deploy agar kerusakan tidak terlihat pengunjung.
25. Sebagai pengunjung, saya ingin tahu apakah tautan membuka situs eksternal agar perpindahan konteks tidak mengejutkan.

## Information Architecture and User Flow

### Primary navigation

Beranda, Tentang, Organisasi, Program, Kabar, Kontak. Pada fase satu halaman, item menuju anchor valid. Jika konten berkembang, Program/Kabar dapat menjadi route mandiri. Jangan menambah sidebar pada website publik.

### Page structure

```text
Home
├── Header and primary navigation
├── Hero: cabinet identity, concise purpose, approved CTA, approved photo
├── About: cabinet overview, approved vision/mission
├── Current direction: approved focus/principles if available
├── Organization: BPH and approved divisions
├── Programs: current featured items → listing/detail when justified
├── News: recent updates → archive/detail in Phase 1
├── Aspiration/contact: verified official channel only
└── Footer: identity, key routes, official contacts, privacy notice if needed

Future routes, only if content volume warrants:
├── /organisasi and /organisasi/{unit}
├── /program and /program/{slug}
├── /kabar and /kabar/{slug}
└── /kontak
```

### Key journeys

- Discover cabinet: Home → About → Organization → verified contact.
- Find program: Home → Program preview → detail/official registration → listing.
- Read update: Home → latest update → article → related program/contact.
- Submit aspiration: Home → purpose/privacy/expectations → verified endpoint → server-confirmed receipt.
- Unknown/expired route: contextual 404 or expired state → home/current program.

No flow ends in an inert CTA, false success, or hidden required contact.

## UI/UX Design System and Layout Architecture

Detailed visual source of truth: [`DESIGN.md`](DESIGN.md). Product-specific behavior follows.

### Color tokens

| Token | Value | Use |
|---|---|---|
| Canvas | `#FFFFFF` | Main surface and header |
| Canvas subtle | `#F5F7F5` | Alternating section surface |
| Ink | `#15243A` | Main headings and copy |
| Supporting copy | `#637181` | Secondary text; contrast checked per pairing |
| Accent | `#087C78` | Single brand accent for links and highlights |
| Accent dark | `#075C5A` | Primary CTA and one deliberate emphasis surface |
| Accent pale | `#E7F3F1` | Subtle tag backgrounds |
| Border | `#DCE3E2` | Structural separators and field outlines |
| Success | `#176B45` | Semantic success only, with text/icon |
| Warning | `#805600` | Semantic warning only, with text/icon |
| Error | `#B42318` | Semantic error only, with text/icon |
| Info | `#245A83` | Semantic information only, with text/icon |

White/navy/muted teal direction follows user-selected benchmark synthesis. Teal is only decorative accent. Semantic feedback colors do not become additional brand accents. No cyan-tech dark theme, glow, gradient, or full-page glassmorphism.

### Typography

- Display: Plus Jakarta Sans, fallback system sans.
- Body/UI: DM Sans, fallback system sans.
- H1: `clamp(2.75rem, 6vw, 5.5rem)`, line height 1.0–1.15.
- H2: `clamp(2rem, 4vw, 3.5rem)`.
- Body: minimum 16px target, line-height 1.55–1.75; measure 60–70ch.
- Font request failure must not hide content or cause material layout shift.

### Layout and responsive behavior

| Viewport | Header | Content |
|---|---|---|
| ≥1200px | Visible one-line horizontal navigation | Max-width 1200–1280px; asymmetric two-column hero; spacious content |
| 768–1199px | Keep visible if it fits; shorten nonessential labels | Reduce column count/gap; preserve readable line measure |
| <768px | Accessible menu button, vertical expanded navigation | One-column flow; image follows introductory copy; controls target 44×44px |
| 320–390px | Compact brand and menu | No horizontal scrolling; long names wrap; images crop intentionally |

Spacing uses 4px base, with common values 4, 8, 12, 16, 24, 32, 48, 64, 80, 96px. Main sections use 64–104px vertical spacing desktop and 48–72px mobile. Cards only where elevation communicates hierarchy. No public sidebar.

### Component architecture

- Header: sticky only if focus/anchor targets are never obscured; white background, one structural divider.
- Hero: one concise value statement, approved image, one primary CTA and optional distinct secondary text link.
- Section: semantic heading and plain explanatory text; do not repeat an eyebrow label on every section.
- Organization: accessible list/hierarchy with linear reading order.
- Program/news card: approved item only, real date/status, relevant link, image alt and credit.
- Empty state: clear missing-content statement and truthful next step; no indefinite promise.
- Footer: identity and valid destinations only.
- Modal: not used for ordinary informational details. If needed for a task, labelled dialog, focus management, Escape behavior, and return-focus behavior required.
- Dark mode: out of current scope; add only with user evidence, complete semantic tokens, and light/dark accessibility review.

### Motion and feedback

Motion intensity 2/10. Use short 150–250ms transitions for color/opacity/transform. Honor `prefers-reduced-motion`. No autoplay, parallax, scroll-jacking, count-up metrics, infinite loops, or unnecessary reveal animations.

## Comprehensive Feature Breakdown

### Phase 0 — Current public static site

1. Serve home page and metadata: title, description, social preview, favicon.
2. Show approved cabinet and institution identity.
3. Show profile and approved mission/vision only when content supplied.
4. Show provisional/confirmed organizational structure according to editorial approval status.
5. Show program/news empty state until real approved entries exist.
6. Show contact/aspiration availability state; no fake form.
7. Provide keyboard-accessible mobile menu and internal anchor navigation.
8. Keep informational content readable without JavaScript.
9. Provide deployment 404 or fallback path to home.

### Phase 1 — Approved content and publishing

- Add data model for program/event and news/update.
- Add index/detail pages if corpus length justifies route-based reading.
- Add program/event status, date/timezone, venue, owner unit, registration close/route.
- Add update author/date, summary, body, image credit/alt, related link.
- Add verified contact and aspiration path with explicit service/privacy policy.
- Consider managed CMS only if multiple editors and publishing cadence justify it.

### Micro-interactions and feedback

| User action | Feedback |
|---|---|
| Open/close mobile navigation | `aria-expanded` update, icon morph optional, focus remains predictable |
| Select internal link | Native anchor navigation; sticky header does not obscure heading |
| Follow external link | Link purpose clear; new tab disclosed if used |
| Open program registration | Destination checked and active; expired/cancelled status removes/updates CTA |
| Submit form (future) | Inline validation, pending state only during real request, server-confirmed success, retryable failure |
| Load images | Aspect ratio reserved; below-fold images lazy; hero not lazy-loaded |
| Visit empty programs/news | Honest no-content message, no fake skeleton or sample cards |

Toasts are not used for persistent or critical results. Skeletons apply only to actual asynchronous data fetching. Current static site has no loading state requirement.

### Edge cases and failsafes

- **Offline:** Static page may show browser/network failure; do not claim content is current or a message delivered. Do not add service worker until offline user job justifies cache freshness complexity.
- **Font/CDN failure:** System font fallback; essential labels remain. Consider self-hosted licensed fonts for production/privacy.
- **Icon CDN failure:** Critical meaning remains in text; prefer local CSS/SVG for essential controls.
- **Image missing:** Reserve dimensions, show alt/fallback, preserve reading order.
- **Missing official content:** Hide it or show an explicitly marked unavailable state. Never use generated mission/program/member examples.
- **Broken outbound route:** Build/CI link check; no placeholder destinations. 404 has recovery route.
- **Expired event:** Mark completed/cancelled/rescheduled and remove stale registration CTA.
- **API timeout (future):** Preserve input, show retry guidance, no success state, prevent/communicate duplicate submission.
- **Repeated submit (future):** Disable while in-flight; backend idempotency where available; do not lose entered content on error.
- **Malicious form input (future):** Server-side allowlist validation, length bounds, output encoding, rate limit, moderation; client validation is UX only.
- **External scripts unavailable:** Core content and navigation still work.
- **320px reflow:** No 2D scrolling except genuinely essential media/table content with accessible alternative.

## Assets, Media, and Resource Management

### Required assets

- Cabinet/HIMAKOM/ULM logos with approved variants.
- Authorized leader/group/program photos; explicit publication permission and source/credit.
- Favicon and social-sharing graphic.
- Optional local SVG icons from one consistent set; all important controls also have text labels.
- Properly licensed WOFF2 fonts or system fallback.

### Optimization

- Export photos as AVIF/WebP with suitable fallback; use responsive `srcset`/`sizes`/`picture` when variants exist.
- Set explicit width/height or `aspect-ratio` to prevent CLS.
- Hero/LCP image loads eagerly with suitable priority; below-fold content uses native lazy loading.
- Do not hotlink benchmark site assets, bundle huge originals, or inline large images as base64.
- Sanitize trusted SVGs, use fixed `viewBox`, dimensions, and no scripts/external references.
- Keep rights/consent/credit with editorial metadata.

### Suggested structure

```text
porto3.0/
├── index.html
├── css/style.css
├── js/main.js
├── assets/
│   ├── brand/
│   ├── people/       # approved only
│   ├── programs/     # approved only
│   ├── icons/
│   └── social/
├── DESIGN.md
└── PRD_KabinetRahman25.md
```

Create category directories as assets arrive; do not scaffold empty directories unnecessarily.

## Technical Feasibility and Benchmarking

### Similar platforms: patterns and cautions

| Platform | What works | Weakness/risk to avoid |
|---|---|---|
| BEM UAG | Clear institutional positioning, thematic pillars, public updates and aspiration/contact affordance | A form is only useful if delivery and privacy expectations are real; avoid copied copy or remote assets |
| BEM Polmed | Cabinet identity, profile/vision-mission, clear organization tree and navigational grouping | Current live fetch unavailable during research; screenshots/extracted text are partial. Avoid building nested menus/tree before content volume warrants |
| BEM FKUB | Strong cabinet identity, image-led hero, organization profile and organogram routes | Metrics may be meaningless without definitions/source; do not clone their visual system or surface unsupported counts |

### Technical recommendation

- Current one-page site: semantic HTML, CSS custom properties, small vanilla JavaScript. No framework/dependency required.
- Hosting: existing static hosting (current repo deployment provider) or GitHub Pages/Cloudflare Pages/Netlify/Vercel based on domain and preview needs.
- Add simple CI checks: HTML validity, broken local links/assets, `node --check`, dummy-data/secret scan, output artifact review.
- Consider static site generator only when articles/programs need routes, templating, search, and structured editorial workflow.
- Consider managed CMS only when multi-editor preview/approval/permissions/audit needs outweigh static maintenance.
- Do not migrate to React/Next.js or add a UI kit for this static public site without a concrete need.

### Performance targets

At p75 of real-user page loads, target Core Web Vitals good: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1. Before field data exists, run lab audits and treat as provisional. Focus on image size, stable layout, font fallback, and minimal JavaScript.

## Security, Privacy, and Data Handling

- No visitor data collection or analytics by default.
- No passwords, tokens, or credentials in public repository/client code.
- Legacy source README contained a plaintext credential; exclude legacy dashboard/auth files from public deployment and rotate/remove any active credential through approved process.
- Do not rely on client validation for trust boundaries.
- Future form requires server-side validation, HTML/context output encoding, length limits, rate limiting, spam policy, transport security, retention/access policy and privacy notice.
- Anonymous claims are allowed only if pipeline genuinely avoids collecting identity/metadata.
- NIM is not required for public profiles or aspirasi unless purpose is documented and explicit authorization is obtained.

## Implementation Decisions and Public Seams

### Public seams

1. **Page/content seam:** approved editorial content → semantic public page. Current change point is static HTML/assets.
2. **Navigation seam:** visible links/menu state → native anchor destination. Current interaction is isolated to mobile navigation.
3. **Media seam:** approved asset metadata → responsive image rendering with fallback/alt.
4. **External channel seam:** verified destination → clearly labelled handoff. No internal submission pipeline in Phase 0.

Prefer testing at the highest seam: public visitor-visible page output and flows, rather than internal implementation details.

### Decisions

- Keep static vanilla stack for current scope.
- One-page layout until real content volume calls for separate routes.
- White/off-white, navy, muted teal approved direction, per `DESIGN.md`.
- Keep “Arah gerak” copy editorially labelled; not official vision/mission without approval.
- Treat legacy division list as provisional pending owner verification.
- Keep fake metrics/member data/programs/contact data out of public site.
- Do not ship admin or old authentication pages from legacy repo.
- No service worker, analytics, carousel, animation library, or form backend in Phase 0.

## Testing Decisions and Acceptance Criteria

### External behavior tests

Good tests assert what public users can observe: route/anchor resolves, menu toggles with accessible state, image/links load, content is truthful, no overflow, failures recover. Avoid tests tied to internal class names unless necessary to locate behavior.

### Test matrix

| Area | Test | Pass |
|---|---|---|
| Content integrity | Scan built artifact for sample names/NIMs/passwords/placeholder contacts/statistics | None exposed |
| Navigation | Activate all header/footer links and browser back/forward | Valid destination, no dead end |
| Mobile menu | Keyboard/pointer toggle, Escape, resize | State, focus and accessible name correct |
| Reflow | 320, 360, 390, 768, 1024, 1440 px | No unintended horizontal scroll; content order usable |
| Keyboard | Tab, Shift+Tab, Enter, Space, Escape | Controls reachable, visible focus, logical order |
| Screen reader | Headings, landmarks, image names, menu state | Meaningful and nonduplicated semantics |
| Contrast | Every text/control token pairing | WCAG 2.2 AA applicable criteria pass |
| Reduced motion | OS preference enabled | Nonessential smooth/transition motion removed |
| Asset failure | Disable remote fonts and one image | Text remains readable, layout stable |
| Empty content | No programs/news/contacts configured | Honest empty/availability state; no fake CTA |
| Build/deploy | Inspect deploy artifact | Only public pages/approved assets; no legacy admin/auth |
| Performance | Lighthouse + field metrics when available | Meet agreed p75 targets; no unjustified requests |

### Prior art / sources

- Browser-native anchors and HTML semantics are the preferred baseline; project is vanilla static site.
- `node scripts/smoke.mjs` menjalankan smoke/E2E browser test lewat Playwright Chromium untuk desktop 1440px, tablet 768px, mobile 390px, dan narrow 320px; cek stylesheet, internal anchors, gambar, link tujuan, overflow horizontal, console/page error, serta menu mobile via keyboard.
- Script memakai `playwright-core` yang sudah ada di sibling `agent-orchestrator/node_modules`; set `PLAYWRIGHT_BROWSER` atau `BASE_URL` bila executable/server berbeda. Tidak menambah dependency ke website statis.
- Screenshot hasil tersimpan pada `test-results/` dan di-ignore Git.
- Automated browser checks bukan bukti konformansi aksesibilitas; tetap lengkapi keyboard/screen-reader dan contrast review.
- W3C WCAG 2.2 quick reference dan Understanding docs menjadi dasar kriteria.

## Research and Benchmark Findings

Research reviewed 2026-10-02. Public site content/appearance can change; verify during final release.

### Supplied references

- [BEM UAG](https://bem.uag.ac.id/): extracted homepage presents advocacy, collaboration, innovation, an aspiration form, and public contacts. Supplied screenshot shows a white header and event/news cards with teal surface and magenta event label.
- [BEM Polmed](https://bem-polmed.com/): supplied screenshots show white header, purple identity, profile/department navigation and organization hierarchy. Live fetch failed during the latest research; earlier text extraction contained cabinet period, overview, and mission.
- [BEM FKUB](https://bemfkub.or.id/): homepage extraction shows Kabinet Arsa Laksana/tagline, hero, metrics and YouTube route; organogram has a separate public route. Supplied screenshot shows plum overlay and green accents.

Synthesis: borrow information hierarchy and public affordances, not exact branding. Use one local brand accent, readable surfaces and genuine content.

### Standards and primary guidance

- [W3C — WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/): conformance criteria and implementation guidance; target AA.
- [W3C — Target Size Minimum (2.5.8)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum): minimum target sizing and exceptions. Product target 44px is an ergonomic goal, not the normative minimum in every context.
- [W3C — Focus Appearance (2.4.13)](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance): AAA focus appearance guidance; use strong visible focus as a product quality bar while target conformance is AA.
- [web.dev — Web Vitals](https://web.dev/articles/vitals): LCP/INP/CLS definitions and recommended p75 thresholds.
- [MDN — Responsive images](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images): responsive sources, art direction, bandwidth and image sizing.
- [MDN — Client-side form validation](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation): native constraint validation for user feedback.
- [MDN — Input validation security](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Input_validation): allowlist validation and need for server-side checks.
- [MDN — Offline/background operation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation): service-worker capabilities and offline complexity; no offline feature justified for current static informational scope.
- [Nielsen Norman Group — Menu Design Checklist](https://www.nngroup.com/articles/menu-design/): navigation visibility, expected placement, location and manipulation.
- [Nielsen Norman Group — Mobile Navigation Patterns](https://www.nngroup.com/articles/mobile-navigation-patterns/): mobile menu patterns and discoverability.
- [Nielsen Norman Group — Error Message Guidelines](https://www.nngroup.com/articles/errors-forms-design-guidelines/): error recovery, inline messages, preserving work.
- [Nielsen Norman Group — Website Forms Usability](https://www.nngroup.com/articles/web-form-design/): form labels and usability guidance.

## Open Decisions and Required Inputs

Before finalizing public content:

1. Confirm exact cabinet period and official name/tagline.
2. Provide approved overview and exact vision/mission.
3. Confirm final organizational units and descriptions.
4. Provide public leadership roster, roles and photo consent.
5. Provide real programs, dates/timezone, location, status and CTA.
6. Provide official news/update owner and publication cadence.
7. Provide verified email, social URLs, phone/address and aspiration destination.
8. Define privacy/retention/response expectations before collecting submissions.
9. Confirm canonical domain and hosting behavior for 404/routes.

## Preview Deployment (Vercel)

- Vercel project root directory: `kabinet-rahman25` within repository `RahmannCH/porto3.0`.
- Build command: `npm run build`.
- Output directory: `dist`.
- Preview deployments remain `noindex, nofollow` and carry a visible draft banner until content is approved.
- Connect the GitHub repository in Vercel Dashboard, select the root directory and verify a preview deployment before production.
- Remove `noindex` and draft labels only after final content approval and production review.
- Vercel project connection and actual deployment require account authorization; they are not performed by local build configuration.
- Configuration reference: [Vercel Project Configuration](https://vercel.com/docs/project-configuration).

## Release Checklist

- [ ] Content owner approves each public claim and date.
- [ ] Provisional content clearly labelled or removed.
- [ ] No sample member records, NIM, plaintext credential, fake statistics, or dead links.
- [ ] Photo/logo rights and consent recorded.
- [ ] All images have appropriate alt/dimensions and are optimized.
- [ ] Contrast, keyboard, screen-reader landmarks, reduced motion, and 320px reflow reviewed.
- [ ] Links/assets/JS syntax/build output checked.
- [ ] Preview deployment reviewed before production.
- [ ] Privacy notice included if any personal information is collected.
