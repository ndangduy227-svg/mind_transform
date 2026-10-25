# Blog typography repair

Updated: 2026-10-25. Implemented by Codex after the founder reported broken blog fonts.

## Confirmed cause

The article body, italic hero line, statement quotes and workflow notes explicitly selected Georgia. Inspection of the installed Windows `georgia.ttf` and `georgiai.ttf` character maps found 45 missing characters in a Vietnamese headline/body sample, including `ơ`, `ư` and multiple accented letters. A browser must use another font for those characters, producing mixed letter shapes and baselines within a sentence. The blog also depended on a remote Google Fonts stylesheet for the brand sans font and requested only its normal style.

## Repair

- Keep Plus Jakarta Sans for headings, controls and visual blocks. Use Source Serif 4 for continuous reading, italic hero text, statements and workflow notes. Both families include Vietnamese.
- Serve the original Google Fonts WOFF2 files from `public/fonts/`, with matching upstream Unicode ranges and variable weights. Each family has real normal/italic faces and Latin, Latin Extended and Vietnamese subsets: 12 files, 335,936 bytes in total. Browsers download the subsets/styles they use.
- Load the local font stylesheet from `index.html`; preload only the normal Latin/Vietnamese brand faces. Arial and Times New Roman provide Vietnamese-capable sans/serif fallbacks on the checked Windows installation.
- Share font tokens with published articles and CMS preview. The TinyMCE iframe loads the same local font stylesheet and uses the serif reading face plus sans headings.
- Increase hero and blog-intro headline line height to 1.2 and relax negative letter spacing, leaving more room for Vietnamese diacritics. Preserve the editorial layout and content.
- Include the SIL Open Font License texts beside both font families (trailing whitespace normalized). No new application dependency or database change.

## Verification

FontTools inspection verified all 229 required ASCII/Vietnamese codepoints, including the full U+1EA0–U+1EF9 range, for both normal and italic faces of each family. The check also intersects character maps with the CSS Unicode ranges: 229/229 remain reachable in all four cases. Variable weight axes cover 200–800 for Plus Jakarta Sans and 200–900 for Source Serif 4.

All 47 existing automated checks passed (25 API/data/helper and 22 component tests); the clean production build passed. All 12 emitted font files match the source bytes, the local font stylesheet and TinyMCE content skin exist in the build, and the built HTML no longer requests Google's remote stylesheet. The existing shared-chunk size advisory remains unrelated.

Saved browser permissions deny the production origin and localhost; live browser pixels, actual font loading in a user session and TinyMCE iframe appearance remain unverified. No alternative browser, host or HTTP preview was used to bypass that permission.

## Font sources

Original assets were downloaded on 2026-10-25 through the [Google Fonts CSS API](https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Source+Serif+4:ital,wght@0,200..900;1,200..900&display=swap), preserving each face's weight/style/Unicode declarations. Official metadata confirms Vietnamese coverage and the SIL license: [Plus Jakarta Sans](https://github.com/google/fonts/blob/main/ofl/plusjakartasans/METADATA.pb), [Source Serif 4](https://github.com/google/fonts/blob/main/ofl/sourceserif4/METADATA.pb). Their bundled license texts come from those same Google Fonts directories.
