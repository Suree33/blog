const TOC_ROOT_SELECTOR = '[data-toc-root]';
const TOC_ITEM_SELECTOR = '[data-toc-item]';
const TOC_LINK_SELECTOR = '[data-toc-link]';

let isListening = false;

const scheduleStateSync = (() => {
  let rafId = 0;

  return () => {
    if (rafId !== 0) return;

    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      syncTocStateByScrollPosition();
    });
  };
})();

const getTocRoots = (): HTMLElement[] =>
  Array.from(document.querySelectorAll<HTMLElement>(TOC_ROOT_SELECTOR));

const getHeadingOrder = (root: HTMLElement): string[] =>
  Array.from(root.querySelectorAll<HTMLElement>(TOC_ITEM_SELECTOR))
    .map((item) => item.dataset.tocId?.trim() ?? '')
    .filter((id) => id.length > 0);

const getHeadingElements = (ids: string[]) =>
  ids
    .map((id, index) => ({
      id,
      index,
      element: document.getElementById(id),
    }))
    .filter((item): item is { id: string; index: number; element: HTMLElement } =>
      Boolean(item.element),
    );

const getActivationLine = (headings: { element: HTMLElement }[]) => {
  const offset = headings.reduce((maxOffset, heading) => {
    const scrollMarginTop = Number.parseFloat(
      window.getComputedStyle(heading.element).scrollMarginTop,
    );
    if (Number.isNaN(scrollMarginTop)) return maxOffset;
    return Math.max(maxOffset, scrollMarginTop);
  }, 0);

  return offset + 1;
};

const getCurrentHeadingIndex = (
  headings: { index: number; element: HTMLElement }[],
  activationLine: number,
  maxIndex: number,
) => {
  const reached = headings.filter(
    (heading) => heading.element.getBoundingClientRect().top <= activationLine,
  );

  if (reached.length === 0) return 0;

  const lastReached = reached[reached.length - 1];
  let currentIndex = lastReached.index;

  const pageBottom = window.innerHeight + window.scrollY;
  const docHeight = document.documentElement.scrollHeight;
  if (pageBottom >= docHeight - 2) {
    currentIndex = maxIndex;
  }

  return currentIndex;
};

const applyStateByIndex = (roots: HTMLElement[], currentIndex: number) => {
  roots.forEach((root) => {
    const items = Array.from(root.querySelectorAll<HTMLElement>(TOC_ITEM_SELECTOR));
    const links = Array.from(root.querySelectorAll<HTMLAnchorElement>(TOC_LINK_SELECTOR));

    items.forEach((item, index) => {
      const state =
        index < currentIndex ? 'before' : index === currentIndex ? 'current' : 'after';
      item.dataset.targetState = state;
    });

    links.forEach((link, index) => {
      if (index === currentIndex) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  });
};

const syncTocStateByScrollPosition = () => {
  const roots = getTocRoots();
  if (roots.length === 0) return;

  const ids = getHeadingOrder(roots[0]);
  if (ids.length === 0) return;

  const headingElements = getHeadingElements(ids);
  if (headingElements.length === 0) return;

  const currentIndex = getCurrentHeadingIndex(
    headingElements,
    getActivationLine(headingElements),
    ids.length - 1,
  );

  applyStateByIndex(roots, currentIndex);
};

const syncTocStateById = (id: string) => {
  const roots = getTocRoots();
  if (roots.length === 0) return;

  const ids = getHeadingOrder(roots[0]);
  if (ids.length === 0) return;

  const currentIndex = ids.indexOf(id);
  if (currentIndex === -1) {
    syncTocStateByScrollPosition();
    return;
  }

  applyStateByIndex(roots, currentIndex);
};

const syncTocStateByHash = () => {
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash) {
    syncTocStateByScrollPosition();
    return;
  }

  syncTocStateById(decodeURIComponent(hash));
};

export const initTableOfContentsState = () => {
  const roots = getTocRoots();
  if (roots.length === 0) return;

  if (!isListening) {
    isListening = true;

    window.addEventListener('scroll', scheduleStateSync, { passive: true });
    window.addEventListener('resize', scheduleStateSync);
    window.addEventListener('hashchange', syncTocStateByHash);
    window.addEventListener('load', scheduleStateSync);

    document.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest<HTMLAnchorElement>(TOC_LINK_SELECTOR);
      if (!link) return;

      const id = link.dataset.tocId?.trim();
      if (!id) return;

      syncTocStateById(id);
    });
  }

  syncTocStateByHash();
  scheduleStateSync();
};
