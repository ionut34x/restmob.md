/* A tiny wooden chair: scroll work is event-driven and sleeps when not needed. */
(() => {
  'use strict';
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const contactScene = document.querySelector('[data-contact-chair]');

  // The contact scene has its own place in the layout; the fixed chair still
  // steps aside for contact details. Each gesture runs only once per visit.
  if (contactScene && 'IntersectionObserver' in window) {
    let sceneVisible = false;
    let brushPlaced = false;
    const finishBrush = () => contactScene.classList.remove('is-setting-brush');
    const placeBrush = () => {
      const covered = document.hidden || document.body.classList.contains('menu-open') || document.body.classList.contains('lightbox-open');
      if (covered || preference.matches) finishBrush();
      if (preference.matches) contactScene.classList.remove('is-awaiting-brush');
      if (brushPlaced || !sceneVisible || covered) return;
      brushPlaced = true;
      contactScene.classList.remove('is-awaiting-brush');
      if (!preference.matches) contactScene.classList.add('is-setting-brush');
      sceneObserver.disconnect();
    };
    if (!preference.matches) contactScene.classList.add('is-awaiting-brush');
    const sceneObserver = new IntersectionObserver(entries => {
      sceneVisible = entries.some(entry => entry.isIntersecting);
      placeBrush();
    }, { threshold: .25 });
    sceneObserver.observe(contactScene);
    contactScene.addEventListener('animationend', finishBrush);
    document.addEventListener('visibilitychange', placeBrush);
    new MutationObserver(placeBrush).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    if (preference.addEventListener) preference.addEventListener('change', placeBrush);
    else preference.addListener(placeBrush);
  }

  const companion = document.querySelector('[data-atelier-companion]');
  if (!companion) return;
  const contact = document.getElementById('contact');
  let frame = 0;
  let idleTimer = 0;
  let maximumScroll = 1;
  let lastScroll = scrollY;
  let protectedAreaVisible = false;
  let listening = false;
  let measureNeeded = true;
  let greeted = false;
  let greetingVisible = false;
  let greetingObserver;
  let updateCorner = () => {};

  function isUnavailable() {
    return document.hidden || protectedAreaVisible || document.body.classList.contains('menu-open') || document.body.classList.contains('lightbox-open');
  }

  function settle() {
    clearTimeout(idleTimer);
    idleTimer = 0;
    companion.style.setProperty('--chair-angle', '0deg');
    companion.style.setProperty('--chair-lift', '0px');
    companion.classList.remove('is-travelling');
  }

  function greet() {
    if (greeted || !greetingVisible || companion.hidden || isUnavailable()) return;
    greeted = true;
    greetingObserver?.disconnect();
    if (!preference.matches) companion.classList.add('is-bowing');
  }

  function paint() {
    frame = 0;
    if (isUnavailable() || preference.matches) return;
    if (measureNeeded) {
      maximumScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      measureNeeded = false;
    }
    const position = scrollY;
    const progress = Math.max(0, Math.min(1, position / maximumScroll));
    const movement = Math.max(-3, Math.min(3, (position - lastScroll) * .09));
    lastScroll = position;
    companion.style.setProperty('--chair-unfinished', `${(100 - progress * 100).toFixed(2)}%`);
    companion.style.setProperty('--chair-progress', progress.toFixed(3));
    companion.style.setProperty('--chair-glow', Math.max(0, (progress - .55) / .45).toFixed(3));
    companion.style.setProperty('--chair-angle', `${movement.toFixed(2)}deg`);
    companion.style.setProperty('--chair-lift', `${(-Math.abs(movement) * .45).toFixed(2)}px`);
    if (Math.abs(movement) > .08) companion.classList.add('is-travelling');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(settle, 140);
  }

  function requestPaint() {
    if (!frame && !isUnavailable() && !preference.matches) frame = requestAnimationFrame(paint);
  }

  function measure() {
    measureNeeded = true;
    requestPaint();
  }

  function sync() {
    const unavailable = isUnavailable();
    // Keep a focused anchor stable; its blur will complete hiding it.
    companion.hidden = unavailable && document.activeElement !== companion;
    if (unavailable || preference.matches) companion.classList.remove('is-bowing');
    greet();
    if (!unavailable && !preference.matches) {
      if (!listening) {
        addEventListener('scroll', requestPaint, { passive: true });
        listening = true;
      }
      lastScroll = scrollY;
      measure();
    } else {
      if (listening) removeEventListener('scroll', requestPaint);
      listening = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      settle();
      if (preference.matches) {
        companion.style.setProperty('--chair-unfinished', '0%');
        companion.style.setProperty('--chair-progress', '1');
        companion.style.setProperty('--chair-glow', '.5');
      }
    }
  }

  if ('IntersectionObserver' in window) {
    const visibility = new Map();
    const updateVisibility = entries => {
      entries.forEach(entry => visibility.set(entry.target, entry.isIntersecting));
      protectedAreaVisible = [...visibility.values()].some(Boolean);
      sync();
    };
    if (contact) new IntersectionObserver(updateVisibility, { threshold: 0 }).observe(contact);
    const controls = [...document.querySelectorAll('[data-gallery-controls]')];
    let cornerObserver;
    let viewportKey = '';
    updateCorner = () => {
      const key = `${innerWidth}:${innerHeight}`;
      if (key === viewportKey) return;
      viewportKey = key;
      cornerObserver?.disconnect();
      controls.forEach(control => visibility.set(control, false));
      // Only step aside when a gallery control reaches the companion's corner.
      cornerObserver = new IntersectionObserver(updateVisibility, {
        rootMargin: `-${Math.max(0, innerHeight - 115)}px 0px 0px -${Math.max(0, innerWidth - 95)}px`, threshold: 0,
      });
      controls.forEach(control => cornerObserver.observe(control));
      updateVisibility([]);
    };
    updateCorner();
    greetingObserver = new IntersectionObserver(entries => {
      greetingVisible = entries.some(entry => entry.isIntersecting);
      greet();
    }, { threshold: .7 });
    greetingObserver.observe(companion);
  } else {
    greetingVisible = true;
  }
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.body);
  addEventListener('resize', () => { updateCorner(); measure(); }, { passive: true });
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', sync);
  companion.addEventListener('blur', sync);
  companion.addEventListener('animationend', event => {
    if (event.animationName === 'chair-greeting') companion.classList.remove('is-bowing');
  });
  if (preference.addEventListener) preference.addEventListener('change', sync);
  else preference.addListener(sync);
  sync();
})();
