// shared by every page: navbar, mobile menu, scroll-spy, scroll reveals
(() => {
  // nav: glass pill once the page scrolls or the menu is open
  const nav = document.getElementById('nav');
  const menu = document.getElementById('menu');
  const menuBtn = nav.querySelector('.menu-btn');
  let scrolled = false;
  const paint = () => nav.classList.toggle('solid', scrolled || !menu.hidden);
  const onScroll = () => {
    const next = scrolled ? scrollY > 16 : scrollY > 40; // hysteresis: no flicker at the edge
    if (next !== scrolled) { scrolled = next; paint(); }
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const setMenu = (open, refocus) => {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    paint();
    if (!open && refocus) menuBtn.focus();
  };
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false, true); });
  document.addEventListener('click', (e) => { if (!menu.hidden && !nav.contains(e.target)) setMenu(false); });
  addEventListener('resize', () => { if (innerWidth > 820 && !menu.hidden) setMenu(false); });

  // highlight the nav link for the section in view
  const links = [...document.querySelectorAll('.nav-links a:not(.btn)')].filter((a) => a.pathname === location.pathname);
  const spy = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) links.forEach((a) => a.hash === '#' + e.target.id ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'));
  }), { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach((sec) => spy.observe(sec));

  // scroll reveals
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
})();
