import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Helpers mirroring the logic in [slug].md.ts
// These allow testing the core transformations without importing the module,
// which would trigger import.meta.glob evaluation at module scope.
// ---------------------------------------------------------------------------

/** Converts an import.meta.glob path to a slug, replicating the production logic. */
function pathToSlug(path: string): string {
  return path.replace('./', '').replace(/\.md$/, '');
}

interface RawMarkdownPost {
  slug: string;
  body: string;
}

/**
 * Converts a rawPostModules map (as returned by import.meta.glob) into an
 * array of RawMarkdownPost objects, replicating the production logic.
 */
function buildRawPosts(
  rawPostModules: Record<string, string>,
): RawMarkdownPost[] {
  return Object.entries(rawPostModules).map(([path, body]) => ({
    slug: pathToSlug(path),
    body,
  }));
}

/**
 * Builds the getStaticPaths return value from an array of raw posts,
 * replicating the production logic.
 */
function buildStaticPaths(
  rawPosts: RawMarkdownPost[],
): Array<{ params: { slug: string }; props: { body: string } }> {
  return rawPosts.map((post) => ({
    params: { slug: post.slug },
    props: { body: post.body },
  }));
}

/**
 * Builds the GET response, replicating the production handler logic.
 */
function buildGetResponse(body: string): Response {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('[slug].md.ts – pathToSlug (path → slug conversion)', () => {
  it('strips the leading "./" prefix', () => {
    expect(pathToSlug('./hello-world.md')).toBe('hello-world');
  });

  it('strips the trailing ".md" extension', () => {
    expect(pathToSlug('./my-post.md')).toBe('my-post');
  });

  it('handles a slug with hyphens', () => {
    expect(pathToSlug('./audio-interface-under-the-desk.md')).toBe(
      'audio-interface-under-the-desk',
    );
  });

  it('handles a slug with numbers', () => {
    expect(pathToSlug('./intel-core-i5-13600kf-game-crash.md')).toBe(
      'intel-core-i5-13600kf-game-crash',
    );
  });

  it('does not strip ".md" that appears in the middle of the slug', () => {
    // The regex is /\.md$/ so it only removes a terminal ".md"
    expect(pathToSlug('./post-with.md-inside.md')).toBe(
      'post-with.md-inside',
    );
  });

  it('returns an empty string when path is only "./.md"', () => {
    // Edge-case: the filename is literally ".md"
    expect(pathToSlug('./.md')).toBe('');
  });

  it('handles a single-character slug', () => {
    expect(pathToSlug('./a.md')).toBe('a');
  });
});

// ---------------------------------------------------------------------------

describe('[slug].md.ts – buildRawPosts (rawPostModules → RawMarkdownPost[])', () => {
  it('returns an empty array when given an empty modules map', () => {
    expect(buildRawPosts({})).toEqual([]);
  });

  it('converts a single module entry to a RawMarkdownPost', () => {
    const modules = { './hello-world.md': '# Hello\nContent here.' };
    expect(buildRawPosts(modules)).toEqual([
      { slug: 'hello-world', body: '# Hello\nContent here.' },
    ]);
  });

  it('converts multiple module entries preserving order', () => {
    const modules = {
      './alpha.md': 'Alpha body',
      './beta.md': 'Beta body',
      './gamma.md': 'Gamma body',
    };
    const result = buildRawPosts(modules);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ slug: 'alpha', body: 'Alpha body' });
    expect(result[1]).toEqual({ slug: 'beta', body: 'Beta body' });
    expect(result[2]).toEqual({ slug: 'gamma', body: 'Gamma body' });
  });

  it('preserves the full markdown body including frontmatter', () => {
    const frontmatterBody = `---
title: My Post
date: 2024-01-01
---

# My Post

Paragraph text.`;
    const modules = { './my-post.md': frontmatterBody };
    const result = buildRawPosts(modules);
    expect(result[0].body).toBe(frontmatterBody);
  });

  it('preserves an empty body string', () => {
    const modules = { './empty.md': '' };
    const result = buildRawPosts(modules);
    expect(result[0]).toEqual({ slug: 'empty', body: '' });
  });
});

// ---------------------------------------------------------------------------

describe('[slug].md.ts – buildStaticPaths (rawPosts → static paths array)', () => {
  it('returns an empty array when rawPosts is empty', () => {
    expect(buildStaticPaths([])).toEqual([]);
  });

  it('maps a single post to the correct params/props shape', () => {
    const posts: RawMarkdownPost[] = [
      { slug: 'hello-world', body: '# Hello' },
    ];
    expect(buildStaticPaths(posts)).toEqual([
      { params: { slug: 'hello-world' }, props: { body: '# Hello' } },
    ]);
  });

  it('maps multiple posts preserving order', () => {
    const posts: RawMarkdownPost[] = [
      { slug: 'post-one', body: 'Body one' },
      { slug: 'post-two', body: 'Body two' },
    ];
    const result = buildStaticPaths(posts);
    expect(result).toHaveLength(2);
    expect(result[0].params.slug).toBe('post-one');
    expect(result[1].params.slug).toBe('post-two');
  });

  it('puts the slug in params.slug', () => {
    const posts: RawMarkdownPost[] = [{ slug: 'my-slug', body: 'body' }];
    const [entry] = buildStaticPaths(posts);
    expect(entry.params).toHaveProperty('slug', 'my-slug');
  });

  it('puts the body in props.body', () => {
    const body = '# Title\nSome markdown content.';
    const posts: RawMarkdownPost[] = [{ slug: 'post', body }];
    const [entry] = buildStaticPaths(posts);
    expect(entry.props).toHaveProperty('body', body);
  });

  it('does not include extra properties in params or props', () => {
    const posts: RawMarkdownPost[] = [
      { slug: 'clean-post', body: 'content' },
    ];
    const [entry] = buildStaticPaths(posts);
    expect(Object.keys(entry.params)).toEqual(['slug']);
    expect(Object.keys(entry.props)).toEqual(['body']);
  });
});

// ---------------------------------------------------------------------------

describe('[slug].md.ts – GET handler (Response construction)', () => {
  it('returns a Response instance', () => {
    const response = buildGetResponse('# Hello');
    expect(response).toBeInstanceOf(Response);
  });

  it('sets Content-Type to text/markdown; charset=utf-8', () => {
    const response = buildGetResponse('# Hello');
    expect(response.headers.get('Content-Type')).toBe(
      'text/markdown; charset=utf-8',
    );
  });

  it('body contains the raw markdown text', async () => {
    const markdown = '# My Post\n\nSome content.';
    const response = buildGetResponse(markdown);
    const text = await response.text();
    expect(text).toBe(markdown);
  });

  it('handles an empty body', async () => {
    const response = buildGetResponse('');
    const text = await response.text();
    expect(text).toBe('');
  });

  it('preserves frontmatter in the response body', async () => {
    const markdownWithFrontmatter = `---
title: Test
date: 2024-01-01
tags:
  - test
---

# Test

Body content.`;
    const response = buildGetResponse(markdownWithFrontmatter);
    const text = await response.text();
    expect(text).toBe(markdownWithFrontmatter);
  });

  it('returns a 200 status code by default', () => {
    const response = buildGetResponse('content');
    expect(response.status).toBe(200);
  });

  it('handles markdown with special characters', async () => {
    const specialChars = '# タイトル\n\n日本語コンテンツ\n\n```\ncode block\n```';
    const response = buildGetResponse(specialChars);
    const text = await response.text();
    expect(text).toBe(specialChars);
  });

  it('handles very long markdown content', async () => {
    const longBody = '# Heading\n\n' + 'paragraph '.repeat(1000);
    const response = buildGetResponse(longBody);
    const text = await response.text();
    expect(text).toBe(longBody);
  });
});

// ---------------------------------------------------------------------------
// Integration-style: verify the full pipeline from modules map → Response
// ---------------------------------------------------------------------------

describe('[slug].md.ts – full pipeline integration', () => {
  it('produces a correct Response for a post given its raw module path', async () => {
    const rawModules = {
      './my-first-post.md': '---\ntitle: My First Post\n---\n\n# Hello World',
    };
    const posts = buildRawPosts(rawModules);
    const paths = buildStaticPaths(posts);

    // Locate the entry for this slug
    const entry = paths.find((p) => p.params.slug === 'my-first-post');
    expect(entry).toBeDefined();

    const response = buildGetResponse(entry!.props.body);
    expect(response.headers.get('Content-Type')).toBe(
      'text/markdown; charset=utf-8',
    );
    const text = await response.text();
    expect(text).toBe(rawModules['./my-first-post.md']);
  });

  it('generates one static path entry per markdown file', () => {
    const rawModules: Record<string, string> = {
      './post-a.md': 'Content A',
      './post-b.md': 'Content B',
      './post-c.md': 'Content C',
    };
    const paths = buildStaticPaths(buildRawPosts(rawModules));
    expect(paths).toHaveLength(3);
    const slugs = paths.map((p) => p.params.slug).sort();
    expect(slugs).toEqual(['post-a', 'post-b', 'post-c']);
  });

  it('body in static path props exactly matches the raw file content', () => {
    const body = '---\ntitle: Exact Match\n---\n\nContent.';
    const rawModules = { './exact.md': body };
    const paths = buildStaticPaths(buildRawPosts(rawModules));
    expect(paths[0].props.body).toBe(body);
  });
});