interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
}

const POSTS_PATH_PATTERN = /^\/posts\/[^/.]+\/?$/;

const acceptsMarkdown = (acceptHeader: string | null) =>
  acceptHeader?.split(',').some((mediaRange) => {
    const [mediaType, ...parameters] = mediaRange
      .split(';')
      .map((part) => part.trim().toLowerCase());
    const quality = parameters.find((parameter) => parameter.startsWith('q='));

    return mediaType === 'text/markdown' && quality !== 'q=0';
  }) ?? false;

const addVaryAccept = (response: Response) => {
  const headers = new Headers(response.headers);
  const vary = headers.get('Vary');

  if (!vary) {
    headers.set('Vary', 'Accept');
  } else if (
    !vary.split(',').some((value) => value.trim().toLowerCase() === 'accept')
  ) {
    headers.set('Vary', `${vary}, Accept`);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const shouldReturnMarkdown =
      (request.method === 'GET' || request.method === 'HEAD') &&
      POSTS_PATH_PATTERN.test(url.pathname) &&
      acceptsMarkdown(request.headers.get('Accept'));

    if (shouldReturnMarkdown) {
      const markdownUrl = new URL(request.url);
      markdownUrl.pathname = `${url.pathname.replace(/\/$/, '')}.md`;

      const response = await env.ASSETS.fetch(
        new Request(markdownUrl, request),
      );

      return addVaryAccept(response);
    }

    return env.ASSETS.fetch(request);
  },
};
