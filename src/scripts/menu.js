document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const menu = document.querySelectorAll('.hamburger-toggle');
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
      } else {
        menu.forEach((item) => item.classList.remove('active'));
      }
    });
  }
});
