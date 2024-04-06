/**
 * ハンバーガーメニューによるトグル機能をを提供する
 *
 * @function
 * @name toggleHamburgerMenu
 * @param {string} hamburgerSelector - ハンバーガーメニューの要素を指定するCSSセレクタ
 * @param {string} toggleTargetSelector - トグルする要素を指定するCSSセレクタ
 * @description
 * 指定されたハンバーガーメニューをクリックすると、ハンバーガーメニューとトグル対象の要素にactiveクラスを付与したり削除したりすることで、
 * メニューの開閉を行う。初回クリック時には'start'クラスを削除し、'active'クラスを追加する。
 * それ以降のクリックでは'active'クラスのトグルを行う。
 * 'active'クラスが付与されている場合、トグル対象の要素にも'active'クラスを付与し、
 * 'active'クラスが削除された場合はトグル対象の要素からも'active'クラスを削除する。
 *
 * @example
 * // HTMLでハンバーガーメニューとトグル対象の要素を定義
 * <button class="hamburger start"></button>
 * <nav class="hamburger-toggle"></nav>
 *
 * // CSSでハンバーガーメニューとトグル対象の要素のスタイルを定義
 * .hamburger {
 *   // ハンバーガーメニューのスタイル
 * }
 * .hamburger-toggle {
 *   // トグル対象の要素のスタイル
 * }
 *
 * // 関数を呼び出してハンバーガーメニューのトグル機能を有効化
 * import { toggleHamburgerMenu } from './hamburgerMenu.js';
 * toggleHamburgerMenu('.hamburger', '.hamburger-toggle');
 */
export const toggleHamburgerMenu = (
  hamburgerSelector,
  toggleTargetSelector,
) => {
  const hamburger = document.querySelector(hamburgerSelector);
  const menu = document.querySelectorAll(toggleTargetSelector);
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      if (hamburger.classList.contains('start')) {
        hamburger.classList.remove('start');
        hamburger.classList.add('active');
      } else {
        hamburger.classList.toggle('active');
      }
      if (hamburger.classList.contains('active')) {
        menu.forEach((item) => item.classList.add('active'));
        disableScroll();
      } else {
        menu.forEach((item) => item.classList.remove('active'));
        enableScroll();
      }
    });
  }
  function disableScroll() {
    document.body.style.overflow = 'hidden';
  }
  function enableScroll() {
    document.body.style.overflow = 'visible';
  }
};

/**
 * スクロールに応じてヘッダーを隠したり表示したりする
 *
 * @function
 * @name toggleHeaderOnScroll
 * @param {string} headerSelector - ヘッダーの要素を指定するCSSセレクタ
 * @param {Object} [options={}] - オプション設定
 * @param {number} [options.upThreshold=1500] - 上スクロールの速度しきい値（ピクセル/秒）
 * @param {number} [options.downThreshold=1000] - 下スクロールの速度しきい値（ピクセル/秒）
 * @param {string} hamburgerSelector - ハンバーガーメニューの要素を指定するCSSセレクタ
 * @description スクロールイベントを監視し、スクロール速度に応じてヘッダーを隠したり表示したりする。
 * 上にスクロールした場合、スクロール速度が上スクロールのしきい値を超えるとヘッダーを表示する。
 * 下にスクロールした場合、スクロール速度が下スクロールのしきい値を超えるとヘッダーを隠す。
 */
export const toggleHeaderOnScroll = (
  headerSelector,
  options = { upThreshold: 1500, downThreshold: 1000 },
  hamburgerSelector = null,
) => {
  const { upThreshold = 50, downThreshold = 50 } = options;
  let prevScrollpos = window.pageYOffset;
  let prevTime = Date.now();
  const header = document.querySelector(headerSelector);
  const hamburger = document.querySelector(hamburgerSelector);

  window.addEventListener('scroll', () => {
    if (!(hamburger && hamburger.classList.contains('active'))) {
      const currentScrollPos = window.pageYOffset;
      const currentTime = Date.now();
      const elapsedTime = currentTime - prevTime;

      // スクロール速度を計算（ピクセル/秒）
      const scrollSpeed =
        Math.abs(currentScrollPos - prevScrollpos) / (elapsedTime / 1000);

      if (prevScrollpos > currentScrollPos) {
        // 上にスクロールした場合
        if (scrollSpeed > upThreshold) {
          header.style.top = '0';
        }
      } else {
        // 下にスクロールした場合
        if (scrollSpeed > downThreshold) {
          header.style.top = `-${header.offsetHeight}px`;
        }
      }

      prevScrollpos = currentScrollPos;
      prevTime = currentTime;
    } else {
    }
  });
};
