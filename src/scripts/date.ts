/**
 * 受け取った日付入力を日本語ロケール（ja-JP）の表示形式に整形する。
 * 無効な入力や日付として解釈できない値の場合は `false` を返す。
 */
export function formatDate(
  dateInput: string | number | Date | null | undefined
): string | false {
  if (
    dateInput === null ||
    dateInput === undefined ||
    (typeof dateInput === 'string' && dateInput.trim() === '')
  ) {
    return false;
  }

  const date = new Date(dateInput);

  if (isValidDate(date)) {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } else {
    return false;
  }
}

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}
