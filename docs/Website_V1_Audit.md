# Website V1 audit and repairs

Updated: 2026-10-24, Asia/Bangkok
Actor: Codex
Status: Tested website repair release. Founder authorized publishing to GitHub main and Vercel on 2026-10-24. Deployment outcome is tracked by the Vercel commit status; browser visual verification remains unclaimed.

## Scope and evidence

- Canonical source: `11_Website/mind_transform/`.
- Baseline Git commit: `e38b276`.
- Main homepage remains V1. `/v2` and `/mind-framework` remain available source routes; V2 was not promoted.
- No production data, Lark resources, database policies or public posts were changed.
- The browser declined access to both the production origin and localhost. No alternative browser or direct production request was used to bypass that decision.

## Repairs

| Area | Confirmed issue | Implemented repair |
|---|---|---|
| Git | Missing index plus stale lock from June made all 397 tracked files appear deleted | Preserved stale lock as `.git/index.lock.recovered-20261022`, reconstructed index from HEAD, verified a clean baseline before code edits |
| MindAI conversation | First message was never saved; later replies were paired with the preceding assistant question and repeated in requests | Store each successful user/assistant pair once, send only previous turns, retain failed input for retry |
| Chat quota | API rejected request 5 despite offering five turns | Permit turns 1–5; reject turn 6; derive the turn number from validated history |
| MindAI contact | Email field disappeared after the first character | Keep a controlled, labelled contact form mounted throughout typing |
| Lead storage | Chat completion wrote to `research`, which is absent from the checked schema | Save contact, intake and complete successful transcript to existing `leads` fields; transcript is JSON in `need`; no schema migration required |
| Save/error states | Errors used blocking alerts; requests could appear to promise an immediate proposal | Inline errors, retain user input, disable submission while chat is pending, confirm only that the request was saved |
| Session limit | Restart was the only obvious alternative to Zalo, discarding the transcript | Add “Xem lại & gửi yêu cầu” and explicitly label restart as deleting the conversation |
| Chat API | Loose origin matching allowed lookalike domains; malformed history and missing env could throw | Exact origin allowlist, configured preview origin support, input limits, controlled failure responses, request timeouts, server-only configuration |
| Chat resources | Query selected nonexistent `posts.excerpt` | Use `summary`; retain industry and department skill matching without interpolating filter expressions |
| Templates | UI expected `thumbnail/template_link` while the documented schema uses `image/lark_link` | Normalize both record shapes at the CMS service boundary |
| Article/template navigation | Old errors/data could survive a slug change or a slower previous request | Clear state on navigation and ignore obsolete responses |
| Unknown URLs | Unmatched paths produced an empty layout | Add a 404 view with recovery links and noindex |
| Contact dialog | Form could overflow short/mobile screens; controls lacked accessible names | Scrollable viewport-bounded dialog, responsive field layout, labels, keyboard focus loop, Escape and inline errors |
| Loading | Public entry eagerly included administrative/editor routes | Lazy-load non-home routes and show a loading state |
| Local setup | Vite did not serve `/api/chat`; README suggested exposing a Groq key through `VITE_` | Local API middleware, `.env.example`, corrected setup instructions; secret values stay server-side |
| Repository hygiene | `.gitignore` contained a UTF-16 fragment with NUL bytes | Normalize to UTF-8 and explicitly ignore local credential/test-output files |

## Verification

- `npm test`: 14 API/data tests plus 6 offline component interaction tests passed.
- Component tests use an in-memory DOM, mocked model responses and mocked Supabase writes. They do not open a browser or send customer data anywhere.
- Covered: five successful turns, ordered history, first/final message persistence, email typing, save failure/retry, AI failure/retry, contact modal controls and 404 recovery links.
- `npm run build`: production build passed after route splitting. A shared entry chunk remains above Vite's 500 kB advisory threshold; this is a performance follow-up, not a failed build.
- `git diff --check`: passed.
- The existing Drive-synced `node_modules` contains corrupt package files. Checks ran against a clean local source mirror with installed lockfile dependencies, not that damaged dependency directory.
- Browser screenshots, real layout at device widths, live Groq, production Supabase RLS and real lead delivery have **not** been verified in this pass.

## Next actions

1. Automated tests were rerun on 2026-10-24; all 20 passed and the production build passed in a clean local checkout using Node 24.
2. Publish through the existing authenticated Git main branch; the GitHub Vercel integration is connected. No Vercel CLI or token is needed for this path.
3. Verify configured public Supabase variables and server-only Supabase/Groq variables in the deployment environment. Do not put secrets in `VITE_` variables.
4. Once browser access is authorized, verify desktop/mobile pages, template downloads and one explicitly marked test lead on the deployed version.
5. Preserve the V2 homepage deferral until the founder reopens it.

## Remaining product work

The full persistent consultant system is still a separate follow-up: per-turn durable sessions, qualification records, context snapshots and Agent OS handoff. This repair saves the full successful consultation when the visitor submits contact details; it does not claim per-turn server persistence or automated email/proposal delivery.
