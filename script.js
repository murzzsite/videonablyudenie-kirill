const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/6YBHFGY8AD';
(() => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const header = document.getElementById('header');
  const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  burger?.addEventListener('click', () => {
    const open = burger.classList.toggle('is-open');
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('is-open');
    nav.classList.remove('is-open');
  }));

  const form = document.getElementById('leadForm');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;

    const payload = {};
    new FormData(form).forEach((v, k) => { payload[k] = v; });

    if (payload._gotcha) return;
    if (!payload.name || !payload.contact) {
      alert('Заполните имя и контакт для связи');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Отправляем...';
    try {
      const resp = await fetch(LEAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      btn.textContent = 'Заявка отправлена';
      form.reset();
    } catch (err) {
      console.error(err);
      btn.textContent = 'Ошибка, попробуйте ещё раз';
    } finally {
      setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3000);
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href.length <= 1) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) {
    const drift = document.querySelectorAll('.hero__photo, .gallery img');
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      drift.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const k = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.translate = '0 ' + (k * -18).toFixed(1) + 'px';
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  document.documentElement.classList.add('js');
  const groups = ['.split__head > *', '.section__title, .section__sub', '.why li', '.srv', '.note--wide', '.gallery figure', '.price-group', '.step', '.faq__item', '.contact__info > *', '.form'];
  const scrollDriven = window.CSS && CSS.supports('animation-timeline', 'view()');
  const targets = new Set();
  groups.forEach(sel => document.querySelectorAll(sel).forEach((el, i) => {
    if (targets.has(el)) return;
    el.classList.add(scrollDriven ? 'sd' : 'reveal');
    el.style.setProperty('--d', Math.min(i, 6) * 70 + 'ms');
    targets.add(el);
  }));
  if (scrollDriven) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(el => io.observe(el));
})();
