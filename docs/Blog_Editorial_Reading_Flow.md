# Blog editorial reading flow

Implemented by Codex on 2026-10-24 after founder approval of the Znews-inspired Longform direction.

## Scope

- `/blog`: editorial discovery page, responsive grid, optional topic filters, accent-insensitive search and query-string state.
- `/blog/:slug`: continuous longform reading layout, explicit typography, responsive contents, reading-time estimate, wide images, native image dialog and a contextual closing action using the existing contact form.
- The Ô Tô Hợp Nhất static case is the first enhanced article: four chapters, process explainer, scope facts and a six-image evidence gallery. Its URL and SEO title remain stable.
- Main homepage remains V1. No database migration, CMS schema change or hosting change is required.

## Sources and truth labels

Layout references supplied by founder:

- https://znews.vn/phu-quoc-chay-dua-voi-thoi-gian-don-dau-su-kien-apec-2027-post1691071.html
- https://znews.vn/loat-dai-du-an-apec-phu-quoc-tang-toc-ve-dich-post1689639.html

No Znews text, photographs or source code was copied. Mindtransform uses its own content and existing evidence assets.

The case is labeled **Case thiết kế / dữ liệu demo**. The 9 tables, 7 views and 5 forms describe the verified demo build, not measured business outcomes. Gallery captions explain that the images were rendered from Lark API demo data and are not live Lark UI screenshots. There is no asserted KiotViet/Bizfly integration.

## Authoring and reuse — updated 2026-10-25

The founder requested CMS authoring after reviewing the first release. New articles now store a versioned block document in `posts.content`; no per-slug code configuration is needed. The pilot was migrated to the same document format. See [CMS_Editorial_Authoring.md](CMS_Editorial_Authoring.md) for the author workflow, schema, validation, preview and reuse controls.

## Historical first-release authoring (superseded)

Ordinary published Markdown and TinyMCE HTML records use the new reading frame automatically. Source headings get unique Vietnamese-friendly anchor IDs. Authored HTML IDs are retained and de-duplicated, including footnote targets.

The initial release used profiles keyed by slug and Markdown markers. This is no longer the authoring workflow; the following is retained only to explain the old Markdown reference:

```md
<!-- mind:statement -->
<!-- mind:workflow -->
<!-- mind:facts -->
<!-- mind:gallery -->
```

Use CMS blocks for new work. The current `articleProfile` derives presentation from the saved document and has no slug registry.

Use `ArticleImage`, `WorkflowExplainer`, `EvidenceGallery` and `EditorialBlock` from `src/components/blog/`. Typography is scoped in `src/styles/editorial.css`; it does not rely on the unconfigured Tailwind `prose` plugin and does not alter other product pages.

## HTML compatibility

CMS HTML is parsed in an inert template and rendered as allowed React elements. Lists, tables, emphasis, headings, images, captions, links and disclosures remain readable. Inline author styles and event handlers are discarded so they cannot override the reading surface. Unsafe URLs and active embeds are removed; iframe content becomes an ordinary safe link. Custom interactive HTML, scripts and embedded forms are not supported in article content.

## Verification

- API/data suite plus article helpers: 17 tests.
- Component suite: 11 tests, including the existing six MindAI/contact/404 checks.
- Blog checks cover actual anchor targets, HTML/Markdown rendering, demo disclosures, workflow selection, gallery navigation, image-dialog controls, checklist, existing consultation action, filtered list round trip and recovery from a missing article on slug navigation.
- Tests use an offline in-memory DOM and mocked CMS reads/writes. They do not send leads or contact external providers.
- Production build and `git diff --check` are required before release. The existing shared bundle size advisory remains a separate performance follow-up.
- Browser pixel layout, native Escape/focus behavior, real device scrolling and live CMS entries still require direct browser verification. The computer-use browser tool currently fails during initialization; no screenshot verification is claimed.

## Publication

Founder authorized applying the approved design to the website. Publication follows the previously authorized GitHub main → Vercel Production integration. The final receipt is recorded in the workspace `11_Website/Website_V1_Audit.md` after the deployment status confirms success.
