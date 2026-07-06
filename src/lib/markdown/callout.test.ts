import { markdownToHtml } from 'satteri';
import { describe, expect, test } from 'vitest';
import { createCalloutPlugin } from './callout';

async function render(markdown: string): Promise<string> {
  return (
    await markdownToHtml(markdown, {
      hastPlugins: [createCalloutPlugin()],
    })
  ).html;
}

describe('Callout', () => {
  test('INFO のタイトルと本文を意味的な Callout として表示する', async () => {
    const html = await render('> [!INFO]\n> 補足 **本文**');

    expect(html).toContain('<div');
    expect(html).toContain('class="callout callout-info"');
    expect(html).toContain('data-callout="info"');
    expect(html).toContain('aria-label="Info"');
    expect(html).toContain('<p class="callout-title">Info</p>');
    expect(html).toContain('<p>補足 <strong>本文</strong></p>');
    expect(html).not.toContain('[!INFO]');
  });

  test.each([
    { marker: 'NOTE', type: 'note', title: 'Note' },
    { marker: 'WARNING', type: 'warning', title: 'Warning' },
  ])(
    '$marker を $title Callout として表示する',
    async ({ marker, type, title }) => {
      const html = await render(`> [!${marker}]\n> 本文`);

      expect(html).toContain(`class="callout callout-${type}"`);
      expect(html).toContain(`data-callout="${type}"`);
      expect(html).toContain(`aria-label="${title}"`);
      expect(html).toContain(`<p class="callout-title">${title}</p>`);
      expect(html).toContain('<p>本文</p>');
      expect(html).not.toContain(`[!${marker}]`);
    },
  );

  test('複数段落を含む本文を欠落させない', async () => {
    const html = await render(
      '> [!NOTE]\n> 1つ目の段落\n>\n> [2つ目の段落](https://example.com)',
    );

    expect(html).toContain('<p>1つ目の段落</p>');
    expect(html).toContain(
      '<p><a href="https://example.com">2つ目の段落</a></p>',
    );
  });

  test.each([
    {
      name: '通常の blockquote',
      markdown: '> 通常の引用',
      content: '通常の引用',
    },
    {
      name: '未対応種類',
      markdown: '> [!CAUTION]\n> 未対応の引用',
      content: '[!CAUTION]',
    },
    {
      name: '折りたたみ記法',
      markdown: '> [!INFO]+\n> 折りたたみの引用',
      content: '[!INFO]+',
    },
  ])(
    '$name は内容を保った blockquote として表示する',
    async ({ markdown, content }) => {
      const html = await render(markdown);

      expect(html).toContain('<blockquote>');
      expect(html).toContain(content);
      expect(html).not.toContain('class="callout');
    },
  );
});
