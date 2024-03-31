document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const menu = document.querySelector('.hamburger-toggle');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      if (hamburger.classList.contains('start')) {
        hamburger.classList.remove('start');
        hamburger.classList.add('active');
      } else {
        hamburger.classList.toggle('active');
      }
      if (hamburger.classList.contains('active')) {
        menu.classList.add('active');
      } else {
        menu.classList.remove('active');
      }
    });
  }
});
