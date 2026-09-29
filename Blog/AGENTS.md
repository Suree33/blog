# Project context

This is the Elyx design project for sur33.com, Daiki Sato's blog. `../` is the
Astro + Tailwind v4 implementation the design mirrors. `.elyx` files contain the
designs, and `elyx.json` contains project settings.

## About this project

The design is a port of the live site, not a redesign: every value comes from
the implementation at the desktop (`lg:`) breakpoint on a 1440px board. Before
changing a design, read the matching source:

- `../src/components/*.astro`, `../src/layouts/BaseLayout.astro`, and
  `../src/pages/index.astro` for structure and classes
- `../src/styles/global.css` plus Tailwind v4 `theme.css` for colors, spacing,
  and type
- post frontmatter in `../src/pages/posts/*.md` for list content

Start at `screens/blog-top.elyx` (light `blogTop`, dark `blogTopDark`).

## Structure

    tokens/  controls/  blocks/  screens/  resources/icons/  resources/images/
    flows/   (create when the first flow is added)

- 'tokens' contains type-specific token files: colors (+ the dark context file),
  lengths, numbers (font sizes and line-height multipliers), fonts (family and
  weight style names).
- 'controls' contains buttons, toggles, text fields, and other small interface elements.
- 'blocks' contains larger reusable pieces such as dialogs, popovers, navigation bars, and panels.
- 'screens' contains the complete windows or pages that make up the product:
  one page per `screens/<page>.elyx`, holding a light board and its dark copy.
  `screens/*.png` are `elyx_render` snapshots of those boards (2x), not site captures.
- 'flows' brings screens together to explain a journey or product behavior.
- 'resources/icons' contains the site's Iconify glyphs exported from
  `../node_modules/@iconify-json/{fa6-brands,fa6-solid,lucide}`, and
  'resources/images' contains images.

## Conventions

- Text mirrors the site's font stack: Latin glyphs in SF Pro, Japanese in
  Hiragino Sans. Every `text` layer sets `font-family`, `font-style`, and
  `line-height` from tokens; the default font renders Japanese as tofu, and an
  unknown style name falls back to the thinnest weight.
  - Text that can hold Japanese sets the `japanese` family and style, plus one
    whole-text subrange `{range: [0, 100000], font-family: latin-…,
    font-style: latin-…, letter-spacing: …}`. Glyphs SF Pro lacks fall back to
    the base font, as in the CSS stack, so contents can change freely.
  - The subrange lives on the declaring layer only: normalize strips a
    `subrange` written on an instance or variant. Latin-only labels (nav items,
    site name) therefore set the `latin-…` family directly, which lets a variant
    override `font-style`.
  - Below 20px use `latin-text` with `tracking-text`; at 20px use
    `latin-display` with `tracking-display` (both in `tokens/numbers.elyx`).
- Dark mode is the `theme` context. `tokens/colors.elyx` is the light fallback;
  `tokens/colors-dark.elyx` overrides the same keys, so add every new color to
  both. Screens import only `colors.elyx`: Elyx discovers the dark file, and
  normalize strips an explicit import of it as unused. Full diagnostics
  therefore reports `unknown context axis 'theme'` on each dark board; that
  warning is expected.
- A dark board is `@with-context(theme="dark")` on a `frame : <lightBoard>`
  placed beside the light one. Parts that differ beyond color come in through a
  variant, e.g. `@use-variant(headerBlock.darkThemeSiteHeader)` swaps the theme
  toggle to the moon glyph.
- Toggle optional children with `display: .none` / `.visible`. The post-item
  base hides `thumb`; `postItemWithThumb` shows it. A row without a description
  hides `postDescription` and sets `postContent { padding-bottom: title-gap }`
  to keep the title's `my-1`.
- `blog-top.elyx` holds one row per non-draft post, newest `pubDate` first, and
  every row sets its tags, date, title, and description explicitly (first two
  tags, `2026年7月5日` date format). A description longer than one line is cut
  where the site's `line-clamp-1` cuts it and ends with `…`.
- Override descendants with sub-blocks nested from the instance root down the
  tree; a layer declared in another file takes that file's import alias:
  `headerBar { headerActions { actionTheme { headerIcons.headerGlyph { … } } } }`.
- Every root layer declares both `left` and `top`, variants included: a variant
  does not inherit its base's position, and an omitted coordinate lands off the
  board. Roots in the same file get distinct offsets.

## Working in this project

- Normalize rewrites values into canonical form (colors to `rgb(%)`, lengths
  without `px`, a `%` token value to a fraction) and silently drops invalid
  ones; after `elyx_normalize`, check the diff for properties that disappeared
  or changed.
- A change is done when full `elyx_diagnostics` reports only the expected
  context warning; `elyx_render` of each edited file's board and of both boards
  in every screen that instantiates it matches the live site apart from the
  known gaps below; and those screen boards are re-rendered at scale 2 into
  `screens/<page>-{light,dark}.png`.
- Known gaps against the live site:
  - The theme toggle shows the explicitly chosen theme (sun / moon); a fresh
    browser without `localStorage.theme` shows `lucide:sun-moon`.
  - Text lines differ by a few px (about 3px on average for titles and
    descriptions): Chrome sizes SF Pro optically and tracks only the SF glyphs,
    while the design approximates both per size.
- To capture the live site, run `pnpm dev` in `../` and screenshot with headless
  Chrome, forcing the scheme since the browser follows the OS:
  `--headless=new --window-size=1440,2400 --blink-settings=preferredColorScheme=1`
  (`=0` for dark) `--screenshot=<out.png> <url>`.
- Keep this file current as the project evolves.
