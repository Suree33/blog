export function formatDate(dateString) {
  if (!dateString) {
    return false;
  }
  const date = new Date(dateString);
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

function isValidDate(date) {
  return date instanceof Date && !isNaN(date.getTime());
}
