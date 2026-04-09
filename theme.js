// Theme initialization - runs before page render to avoid flash
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
} else {
  document.documentElement.removeAttribute('data-theme');
}
