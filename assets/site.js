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

// analytics: Clarity loads, and Google Analytics may set cookies, only after the visitor accepts
(() => {
  const KEY = 'yap-cookie-consent';
  const get = () => { try { return localStorage.getItem(KEY); } catch (_) { return null; } };
  const set = (v) => { try { localStorage.setItem(KEY, v); } catch (_) {} };
  const loadClarity = () => {
    if (window.clarity) return;
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "yw6fny47kl");
  };
  const clearClarityCookies = () => ['_clck', '_clsk', '_ga', '_ga_WH7ZEEDEK9'].forEach((n) => {
    document.cookie = n + '=; Max-Age=0; path=/';
    document.cookie = n + '=; Max-Age=0; path=/; domain=.' + location.hostname.replace(/^www\./, '');
  });

  let banner;
  const showBanner = () => {
    if (banner) return banner.querySelector('button').focus();
    banner = document.createElement('div');
    banner.className = 'consent';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML = '<p>We use cookies from Google Analytics and Microsoft Clarity to see how people use this site, so we can improve it. <a href="/privacy/">Privacy policy</a></p>' +
      '<div class="consent-actions"><button class="btn btn-ghost btn-sm" type="button" data-choice="denied">Decline</button>' +
      '<button class="btn btn-primary btn-sm" type="button" data-choice="granted">Accept</button></div>';
    banner.addEventListener('click', (e) => {
      const choice = e.target.closest('[data-choice]')?.dataset.choice;
      if (!choice) return;
      const was = get();
      set(choice);
      banner.remove(); banner = null;
      if (choice === 'granted') { loadClarity(); if (window.gtag) gtag('consent', 'update', { analytics_storage: 'granted' }); }
      else if (was === 'granted') { clearClarityCookies(); location.reload(); } // withdraw: stop the running script
    });
    document.body.append(banner);
  };

  if (get() === 'granted') loadClarity();
  else if (get() !== 'denied') showBanner();
  document.querySelectorAll('[data-cookie-settings]').forEach((b) => b.addEventListener('click', showBanner));
})();
