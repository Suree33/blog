const TOC_ROOT_SELECTOR = '[data-toc-root]';
const TOC_ITEM_SELECTOR = '[data-toc-item]';
const TOC_LINK_SELECTOR = '[data-toc-link]';

let isListening = false;

/**
 * TOC状態の再計算を1フレームに1回へ間引くスケジューラ。
 * スクロール・リサイズイベントが連続しても無駄な再計算を防ぐ。
 */
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

/** 現在ページに存在する TOC ルート要素を取得する。 */
const getTocRoots = (): HTMLElement[] =>
  Array.from(document.querySelectorAll<HTMLElement>(TOC_ROOT_SELECTOR));

/**
 * TOCに表示されている順序で見出しID配列を取得する。
 *
 * @param root TOCルート要素
 * @returns 表示順に並んだ見出しID配列
 */
const getHeadingOrder = (root: HTMLElement): string[] =>
  Array.from(root.querySelectorAll<HTMLElement>(TOC_ITEM_SELECTOR))
    .map((item) => item.dataset.tocId?.trim() ?? '')
    .filter((id) => id.length > 0);

/**
 * 見出しIDと実DOM要素を対応付ける。
 * DOM上に存在しない見出しは除外する。
 *
 * @param ids TOC順の見出しID配列
 * @returns 有効な見出し要素情報（ID・index・element）
 */
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

/**
 * 「現在見出し」を判定するための基準線（px）を算出する。
 * 見出しの scroll-margin-top の最大値を使用し、固定ヘッダー分を吸収する。
 *
 * @param headings 有効な見出し要素情報
 * @returns ビューポート上端からの判定ライン（px）
 */
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

/**
 * 現在位置に対応する見出しインデックスを求める。
 * 判定ラインより上に到達している最後の見出しを current とする。
 *
 * @param headings 有効な見出し要素情報
 * @param activationLine current判定ライン（px）
 * @param maxIndex 見出し配列の末尾インデックス
 * @returns current のインデックス
 */
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

/**
 * TOC項目に before/current/after を付与し、a要素の aria-current を更新する。
 *
 * @param roots TOCルート要素群（PC/モバイル両方）
 * @param currentIndex current とみなす項目のインデックス
 */
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

/** スクロール位置を基準に TOC 状態を再計算して反映する。 */
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

/**
 * ハッシュ変更時の再同期処理。
 * ブラウザによりスムーススクロール開始タイミングがずれるため、遅延再計算も行う。
 */
const syncTocStateByHash = () => {
  scheduleStateSync();
  // Smooth scroll starts asynchronously in some browsers.
  window.setTimeout(scheduleStateSync, 50);
};

/**
 * TOC状態同期の初期化エントリポイント。
 * イベントリスナーは1回だけ登録し、呼び出し時点で即座に初回同期する。
 */
export const initTableOfContentsState = () => {
  const roots = getTocRoots();
  if (roots.length === 0) return;

  if (!isListening) {
    isListening = true;

    window.addEventListener('scroll', scheduleStateSync, { passive: true });
    window.addEventListener('resize', scheduleStateSync);
    window.addEventListener('hashchange', syncTocStateByHash);
    window.addEventListener('load', scheduleStateSync);
  }

  syncTocStateByHash();
};
