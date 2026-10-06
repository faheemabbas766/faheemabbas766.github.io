const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
function closeMenu() { siteNav?.classList.remove('open'); menuToggle?.setAttribute('aria-expanded', 'false'); }
if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => { const open = siteNav.classList.toggle('open'); menuToggle.setAttribute('aria-expanded', String(open)); });
  siteNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && siteNav.classList.contains('open')) { closeMenu(); menuToggle.focus(); } });
}
const pages = { home:'index.html', projects:'projects.html', 'flutter-contributor':'flutter-contributors-pakistan.html', resume:'resume.html', contact:'contact.html' };
siteNav?.querySelectorAll('a').forEach(link => { if (link.getAttribute('href') === pages[document.body.dataset.page]) { link.classList.add('active'); link.setAttribute('aria-current','page'); } });
const filters = document.querySelectorAll('[data-filter]');
const cards = document.querySelectorAll('.work-browser .work-card');
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
  let visible = 0;
  cards.forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter; if (!card.hidden) visible++; });
  const count = document.getElementById('work-count'); if (count) count.textContent = `${visible} ${visible === 1 ? 'project' : 'projects'}`;
}));
