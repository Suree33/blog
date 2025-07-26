---
allowed-tools: Bash(cp:*), Read, Edit, MultiEdit, Write
description: Create a new blog post
---

## Context

This is an Astro blog with blog posts stored as Markdown files in `src/pages/posts/`. There's a template file at `src/pages/posts/template/_blog-post.md` that should be used as the base for new posts.

## Your Task

Create a new blog post for this Astro blog. Follow these steps:

1. **Generate slug**: If the user provides a title or content description, generate an appropriate slug based on that. If the user specifies a slug directly, use that instead.

2. **Copy template**: Use the `cp` command to copy the template file from `src/pages/posts/template/_blog-post.md` to `src/pages/posts/[slug].md` where [slug] is the generated or specified slug.

3. **Set pubDate**: Update the `pubDate` frontmatter field with today's date in ISO format (YYYY-MM-DD).

4. **Update frontmatter**: Unless the user specifies values for other frontmatter fields (title, description), leave them as they are in the template for the user to fill in later.

## Important Notes

- **Slug format**: Slugs should be lowercase, use hyphens instead of spaces, and be SEO-friendly (avoid special characters, keep it concise and descriptive).
- **Tags format**: Ensure tags are in list format (using hyphens) rather than array format.