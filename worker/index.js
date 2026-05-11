const MARKDOWN_CONTENT_TYPE = 'text/markdown; charset=utf-8';

const isMarkdownAccepted = (request) =>
  request.headers
    .get('Accept')
    ?.split(',')
    .some(
      (acceptValue) =>
        acceptValue.trim().toLowerCase().split(';', 1)[0] === 'text/markdown',
    ) ?? false;

const getPostSlug = (url) =>
  url.pathname.match(/^\/posts\/([^/.][^/]*)\/?$/)?.[1] ?? null;

const createMarkdownAssetRequest = (request, slug) => {
  const markdownUrl = new URL(request.url);
  markdownUrl.pathname = `/posts/${slug}.md`;
  markdownUrl.search = '';

  return new Request(markdownUrl, request);
};

const withVaryAccept = (response) => {
  const headers = new Headers(response.headers);
  const vary = headers.get('Vary');

  if (!vary) {
    headers.set('Vary', 'Accept');
  } else if (
    !vary
      .split(',')
      .some((varyValue) => varyValue.trim().toLowerCase() === 'accept')
  ) {
    headers.set('Vary', `${vary}, Accept`);
  }

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const slug = getPostSlug(url);
    const canReturnMarkdown =
      slug &&
      (request.method === 'GET' || request.method === 'HEAD') &&
      isMarkdownAccepted(request);

    if (canReturnMarkdown) {
      const markdownResponse = await env.ASSETS.fetch(
        createMarkdownAssetRequest(request, slug),
      );

      if (markdownResponse.ok) {
        const headers = new Headers(markdownResponse.headers);
        headers.set('Content-Type', MARKDOWN_CONTENT_TYPE);

        return withVaryAccept(
          new Response(markdownResponse.body, {
            headers,
            status: markdownResponse.status,
            statusText: markdownResponse.statusText,
          }),
        );
      }
    }

    const assetResponse = await env.ASSETS.fetch(request);

    return slug ? withVaryAccept(assetResponse) : assetResponse;
  },
};
