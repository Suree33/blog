# Project context

This is the Elyx design project for sur33.com — Daiki Sato's blog
(`../` is the Astro + Tailwind v4 implementation). `.elyx` files contain the
designs, and `elyx.json` contains project settings.

## About this project

The design mirrors the real blog's look: white / neutral-950 surfaces,
black / white content, neutral-500/600 muted text, gray divider, Hiragino Sans
type (the system-ui stack's JP font), Tailwind spacing (p-4/p-5 rows, gap-y-4
list, container max 1280) and Feather-style glyph icons.

## Source of truth

Design decisions are taken from the implementation, not invented:
`../src/components/*.astro`, `../src/layouts/BaseLayout.astro`,
`../src/styles/global.css`, `../src/config.json`, Tailwind v4 theme values, and
post frontmatter (`../src/pages/posts/*`). When changing the design, check the
corresponding component first.

## Conventions

- Dark mode is the `theme` context: context-free colors in `tokens/colors.elyx`,
  contextual choice in `tokens/colors-dark.elyx` (`@context(theme=dark)`).
  Screens import both files, and a dark board copy applies `@with-context(theme=dark)`.
- Token groups are type-specific: colors, lengths, numbers, fonts (one file each
  in `tokens/`). fontSize tokens are Tailwind rem sizes; font-style uses
  Hiragino style names (`W3` regular, `W6` semibold, `W8` bold).
- Optional children of `controls/post-item.elyx` (tags, description, thumbnail)
  are toggled via `display: .none` overrides rather than `remove()`.
- Cross-file override labels use the import alias
  (`controls.postContent.controls.postTitle { … }`), nested to mirror the tree
  when the target is deeper than one level.
- Exported library sources get distinct `top`/`left` offsets so the shared board
  does not report overlapping layers.

## Structure

    Blog/
      tokens/     colors.elyx, colors-dark.elyx, lengths.elyx, numbers.elyx, fonts.elyx
      controls/   header-nav-item.elyx, icon-link.elyx, post-item.elyx
      blocks/     site-header.elyx, site-footer.elyx
      screens/    blog-top.elyx (light `blogTop` + dark `blogTopDark`)
      resources/  icons/ (SVG glyphs), images/ (avatar, ogimage)

- 'controls' contains buttons, toggles, text fields, and other small interface elements.
- 'blocks' contains larger reusable pieces such as dialogs, popovers, navigation bars, and panels.
- 'screens' contains the complete windows or pages that make up the product.
- 'flows' brings screens together to explain a journey or product behavior.

Start at `screens/blog-top.elyx` to see the top page; add new screens there and
instantiate `controls/` and `blocks/` in it.

## Working in this project

- Follow the patterns in existing `.elyx` files.
- Preserve the project's established design language and conventions.
- Keep this file current as the project evolves.
