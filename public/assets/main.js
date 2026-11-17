/* RESTMOB: small, dependency-free progressive enhancements. */
(() => {
  'use strict';

  const root = document.documentElement;
  const isRussian = root.lang.toLowerCase().startsWith('ru');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const listenToMedia = (query, listener) => {
    if (query.addEventListener) query.addEventListener('change', listener);
    else query.addListener(listener);
  };
  root.classList.add('js');
  root.classList.toggle('motion-ready', !reducedMotion.matches);
  if (reducedMotion.matches) root.classList.add('motion-intro-done');
  document.querySelectorAll('.service-top svg path, .service-top svg circle').forEach(outline => {
    outline.setAttribute('pathLength', '1');
  });

  const menuToggle = document.getElementById('menu-toggle');
  const navigation = document.getElementById('main-nav');

  if (menuToggle && navigation) {
    const setMenu = (open, restoreFocus = false) => {
      menuToggle.setAttribute('aria-expanded', String(open));
      navigation.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      if (restoreFocus) menuToggle.focus();
    };

    menuToggle.addEventListener('click', () => {
      setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
    });
    navigation.addEventListener('click', (event) => {
      if (event.target.closest('a')) setMenu(false);
    });
    document.addEventListener('click', (event) => {
      if (!navigation.contains(event.target) && !menuToggle.contains(event.target)) {
        setMenu(false);
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false, true);
      }
    });
    const desktop = window.matchMedia('(min-width: 961px)');
    const closeOnDesktop = () => {
      if (desktop.matches) setMenu(false);
    };
    listenToMedia(desktop, closeOnDesktop);
    closeOnDesktop();
  }

  const comparisonControls = new Map();
  let stopComparisonDemo = () => {};
  document.querySelectorAll('.compare-frame').forEach((frame) => {
    const range = frame.querySelector('.compare-range');
    if (!range) return;
    const updatePosition = () => {
      const before = Math.max(0, Math.min(100, Number(range.value) || 0));
      frame.style.setProperty('--position', `${before}%`);
      range.setAttribute('aria-valuetext', isRussian
        ? `До: ${before}%, после: ${100 - before}%`
        : `Înainte: ${before}%, după: ${100 - before}%`);
    };
    range.addEventListener('input', updatePosition);
    updatePosition();
    comparisonControls.set(frame, { frame, range, updatePosition });
  });

  const comparisonTabs = document.querySelector('[data-comparison-tabs]');
  if (comparisonTabs) {
    const tabs = Array.from(comparisonTabs.querySelectorAll('[role="tab"][data-panel]'));
    const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
    if (tabs.length && panels.every(Boolean)) {
      const activateTab = (index, focus = false) => {
        stopComparisonDemo();
        tabs.forEach((tab, tabIndex) => {
          const selected = tabIndex === index;
          tab.setAttribute('aria-selected', String(selected));
          tab.tabIndex = selected ? 0 : -1;
          panels[tabIndex].hidden = !selected;
        });
        if (focus) tabs[index].focus();
      };
      tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => activateTab(index));
        tab.addEventListener('keydown', (event) => {
          let next;
          if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
          if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
          if (event.key === 'Home') next = 0;
          if (event.key === 'End') next = tabs.length - 1;
          if (next === undefined) return;
          event.preventDefault();
          activateTab(next, true);
        });
      });
      activateTab(0);
      comparisonTabs.hidden = false;
    }
  }

  // One short guided comparison; any interaction immediately gives control back.
  const comparisonSection = document.getElementById('transformari');
  if (comparisonSection && comparisonControls.size && 'IntersectionObserver' in window && !reducedMotion.matches) {
    let animationFrame = 0;
    let activeControl = null;
    let originalStep = null;
    let demoUsed = false;
    const interactionEvents = ['pointerdown', 'touchstart', 'keydown', 'input', 'focusin'];
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.find(entry => entry.isIntersecting && entry.intersectionRatio >= 0.3
        && !entry.target.closest('.comparison-panel')?.hidden);
      if (!visible || demoUsed || reducedMotion.matches) return;
      demoUsed = true;
      observer.disconnect();
      activeControl = comparisonControls.get(visible.target);
      if (!activeControl) return;
      const control = activeControl;
      originalStep = control.range.getAttribute('step');
      control.range.step = '0.1';
      control.range.value = '50';
      control.updatePosition();
      control.frame.classList.add('is-demoing');
      let startedAt;
      const stops = [[0, 50], [0.28, 65], [0.67, 38], [1, 50]];
      const animate = timestamp => {
        animationFrame = 0;
        if (!activeControl) return;
        if (startedAt === undefined) startedAt = timestamp;
        const progress = Math.min((timestamp - startedAt) / 1800, 1);
        let segment = 1;
        while (segment < stops.length - 1 && progress > stops[segment][0]) segment++;
        const [fromTime, fromValue] = stops[segment - 1];
        const [toTime, toValue] = stops[segment];
        const fraction = (progress - fromTime) / (toTime - fromTime);
        const eased = fraction * fraction * (3 - 2 * fraction);
        control.range.value = (fromValue + (toValue - fromValue) * eased).toFixed(1);
        control.updatePosition();
        if (progress < 1) animationFrame = requestAnimationFrame(animate);
        else stopComparisonDemo();
      };
      animationFrame = requestAnimationFrame(animate);
      document.addEventListener('visibilitychange', stopWhenHidden);
    }, { threshold: [0, 0.3] });

    function stopWhenHidden() {
      if (document.hidden) stopComparisonDemo();
    }

    stopComparisonDemo = () => {
      demoUsed = true;
      observer.disconnect();
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      if (activeControl) {
        activeControl.frame.classList.remove('is-demoing');
        if (originalStep === null) activeControl.range.removeAttribute('step');
        else activeControl.range.setAttribute('step', originalStep);
        activeControl.updatePosition();
        activeControl = null;
      }
      interactionEvents.forEach(type => comparisonSection.removeEventListener(type, stopComparisonDemo, true));
      document.removeEventListener('visibilitychange', stopWhenHidden);
    };
    interactionEvents.forEach(type => comparisonSection.addEventListener(type, stopComparisonDemo, { capture: true, passive: true }));
    comparisonControls.forEach(control => observer.observe(control.frame));
  }

  const gallery = document.getElementById('gallery-grid');
  const filters = document.querySelector('[data-gallery-filters]');
  const galleryPagination = document.querySelector('[data-gallery-pagination]');
  const galleryPrevious = document.querySelector('[data-gallery-prev]');
  const galleryNext = document.querySelector('[data-gallery-next]');
  const galleryPage = document.getElementById('gallery-page');
  const galleryStatus = document.getElementById('gallery-status');
  const cards = gallery ? Array.from(gallery.querySelectorAll('.gallery-item')) : [];
  const galleryWall = gallery?.closest('.work-gallery');
  let category = 'all';
  const compactGallery = matchMedia('(max-width: 960px)');
  let pageSize = compactGallery.matches ? 4 : 6;
  let pageIndex = 0;
  const filteredCards = () => cards.filter(card => category === 'all' || card.dataset.category === category);
  const galleryObserver = cards.length && 'IntersectionObserver' in window && !reducedMotion.matches
    ? new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        galleryObserver.unobserve(entry.target);
      });
    }, { threshold: 0.06 })
    : null;
  const settleGalleryReveal = () => {
    galleryObserver?.disconnect();
    cards.forEach(card => card.classList.add('is-visible'));
  };

  const updateGallery = () => {
    const matching = filteredCards();
    const pageCount = Math.max(1, Math.ceil(matching.length / pageSize));
    pageIndex = Math.max(0, Math.min(pageIndex, pageCount - 1));
    const start = pageIndex * pageSize;
    const shown = new Set(matching.slice(start, start + pageSize));
    cards.forEach(card => {
      card.hidden = !shown.has(card);
      if (card.hidden) galleryObserver?.unobserve(card);
      else if (!galleryObserver || reducedMotion.matches) card.classList.add('is-visible');
      else if (!card.classList.contains('is-visible')) galleryObserver.observe(card);
    });
    if (filters) {
      filters.querySelectorAll('[data-filter]').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.filter === category));
      });
    }
    if (galleryPagination) galleryPagination.hidden = pageCount < 2;
    if (galleryPrevious) galleryPrevious.disabled = pageIndex === 0;
    if (galleryNext) galleryNext.disabled = pageIndex === pageCount - 1;
    if (galleryPage) galleryPage.textContent = `${pageIndex + 1} / ${pageCount}`;
    if (galleryStatus) {
      const end = Math.min(matching.length, start + pageSize);
      galleryStatus.textContent = isRussian
        ? `Фото ${start + 1}–${end} из ${matching.length}`
        : `Fotografiile ${start + 1}–${end} din ${matching.length}`;
    }
  };

  if (cards.length && filters && galleryPagination && galleryPrevious && galleryNext) {
    filters.addEventListener('click', event => {
      const button = event.target.closest('[data-filter]');
      if (!button || !filters.contains(button)) return;
      category = button.dataset.filter;
      pageIndex = 0;
      updateGallery();
    });
    const changeGalleryPage = (direction, button) => {
      const wasFocused = document.activeElement === button;
      pageIndex += direction;
      updateGallery();
      if (wasFocused && button.disabled) {
        (direction > 0 ? galleryPrevious : galleryNext).focus({ preventScroll: true });
      }
    };
    galleryPrevious.addEventListener('click', () => changeGalleryPage(-1, galleryPrevious));
    galleryNext.addEventListener('click', () => changeGalleryPage(1, galleryNext));
    listenToMedia(compactGallery, event => {
      const firstVisibleIndex = pageIndex * pageSize;
      const focusedCard = document.activeElement?.closest('.gallery-item');
      pageSize = event.matches ? 4 : 6;
      const focusIndex = focusedCard ? filteredCards().indexOf(focusedCard) : -1;
      pageIndex = Math.floor((focusIndex >= 0 ? focusIndex : firstVisibleIndex) / pageSize);
      updateGallery();
    });
    galleryWall?.classList.add('gallery-enhanced');
    filters.hidden = false;
    updateGallery();
  }

  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCount = document.getElementById('lightbox-count');
  const closeLightbox = lightbox?.querySelector('[data-lightbox-close]');
  const previousImage = lightbox?.querySelector('[data-lightbox-prev]');
  const nextImage = lightbox?.querySelector('[data-lightbox-next]');

  if (gallery && lightbox && typeof lightbox.showModal === 'function' && lightboxImage && closeLightbox) {
    let currentCard = null;
    let lastTrigger = null;
    let touchStart = null;

    const renderImage = (card) => {
      const link = card?.querySelector('.gallery-link');
      if (!link) return;
      currentCard = card;
      const matching = filteredCards();
      const title = link.dataset.title || link.querySelector('img')?.alt || '';
      lightboxImage.alt = title;
      for (const dimension of ['width', 'height']) {
        const value = Number(link.dataset[dimension === 'width' ? 'fullWidth' : 'fullHeight']);
        if (value > 0) lightboxImage.setAttribute(dimension, String(value));
        else lightboxImage.removeAttribute(dimension);
      }
      lightboxImage.src = link.href;
      if (lightboxCaption) lightboxCaption.textContent = title;
      if (lightboxCount) lightboxCount.textContent = `${matching.indexOf(card) + 1} / ${matching.length}`;
      if (previousImage) previousImage.disabled = matching.length < 2;
      if (nextImage) nextImage.disabled = matching.length < 2;
    };

    const stepImage = (direction) => {
      const matching = filteredCards();
      if (!matching.length) return;
      const index = matching.indexOf(currentCard);
      renderImage(matching[(index + direction + matching.length) % matching.length]);
    };

    gallery.addEventListener('click', (event) => {
      const link = event.target.closest('.gallery-link');
      if (!link || !gallery.contains(link) || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const card = link.closest('.gallery-item');
      if (!card) return;
      event.preventDefault();
      lastTrigger = link;
      renderImage(card);
      lightbox.showModal();
      document.body.classList.add('lightbox-open');
    });
    closeLightbox.addEventListener('click', () => lightbox.close());
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) lightbox.close();
    });
    lightbox.addEventListener('close', () => {
      document.body.classList.remove('lightbox-open');
      const triggerCard = lastTrigger?.closest('.gallery-item');
      if (triggerCard?.hidden) {
        const index = filteredCards().indexOf(triggerCard);
        if (index >= 0) {
          pageIndex = Math.floor(index / pageSize);
          updateGallery();
        }
      }
      if (lastTrigger?.isConnected && !triggerCard?.hidden) lastTrigger.focus({ preventScroll: true });
    });
    previousImage?.addEventListener('click', () => stepImage(-1));
    nextImage?.addEventListener('click', () => stepImage(1));
    lightbox.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      stepImage(event.key === 'ArrowLeft' ? -1 : 1);
    });
    lightboxImage.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'touch') touchStart = { x: event.clientX, y: event.clientY };
    }, { passive: true });
    lightboxImage.addEventListener('pointerup', (event) => {
      if (!touchStart) return;
      const dx = event.clientX - touchStart.x;
      const dy = event.clientY - touchStart.y;
      touchStart = null;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) stepImage(dx < 0 ? 1 : -1);
    }, { passive: true });
    lightboxImage.addEventListener('pointercancel', () => { touchStart = null; }, { passive: true });
  }

  const revealElements = document.querySelectorAll('[data-reveal]');
  let revealObserver;
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  }
  listenToMedia(reducedMotion, (event) => {
    // Changing the preference never replays the introductory reveal or the demo.
    root.classList.add('motion-intro-done');
    root.classList.toggle('motion-ready', !event.matches);
    if (!event.matches) return;
    stopComparisonDemo();
    settleGalleryReveal();
    revealObserver?.disconnect();
    revealElements.forEach(element => element.classList.add('is-visible'));
  });
})();
