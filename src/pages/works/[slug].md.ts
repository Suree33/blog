import type { APIRoute, GetStaticPaths } from 'astro';

const rawWorkModules = import.meta.glob<string>('./*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
});

interface RawMarkdownWork {
  slug: string;
  body: string;
}

const removeLayoutFrontmatter = (body: string) => {
  if (!body.startsWith('---\n')) {
    return body;
  }

  const frontmatterEndIndex = body.indexOf('\n---', 4);

  if (frontmatterEndIndex === -1) {
    return body;
  }

  const frontmatter = body.slice(4, frontmatterEndIndex);
  const rest = body.slice(frontmatterEndIndex);
  const frontmatterWithoutLayout = frontmatter.replace(
    /^layout:\s*[^\n]*\n?/m,
    '',
  );

  return `---\n${frontmatterWithoutLayout}${rest}`;
};

const rawWorks: RawMarkdownWork[] = Object.entries(rawWorkModules).map(
  ([path, body]) => ({
    slug: path.replace('./', '').replace(/\.md$/, ''),
    body: removeLayoutFrontmatter(body),
  }),
);

/**
 * Markdown 記事ごとの raw Markdown を返す `/works/[slug].md` エンドポイントを静的生成する。
 */
export const getStaticPaths = (() =>
  rawWorks.map((work) => ({
    params: { slug: work.slug },
    props: { body: work.body },
  }))) satisfies GetStaticPaths;

export const GET = (({ props }) => {
  const { body } = props as { body: string };

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}) satisfies APIRoute;
