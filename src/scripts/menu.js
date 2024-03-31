document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      if (hamburger.classList.contains('start')) {
        hamburger.classList.remove('start');
        hamburger.classList.add('active');
      } else {
        hamburger.classList.toggle('active');
      }
    });
  }
});
