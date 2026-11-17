import { readFile, writeFile, mkdir, readdir, unlink } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { site, copy, gallery } from './content.mjs';
import { renderGallery } from './gallery.mjs';
import { renderCompanion, renderContactCompanion } from './atelier.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const assets = path.join(publicDir, 'assets');
const report = JSON.parse(await readFile(path.join(root, 'asset-report.json'), 'utf8'));
const images = new Map(report.entries.map(entry => [entry.slug, entry]));
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>';
const diagonal = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg>';
const drawerHandle = '<span class="drawer-handle" aria-hidden="true"><svg viewBox="0 0 48 24"><circle cx="10" cy="8" r="2"/><circle cx="38" cy="8" r="2"/><path d="M10 8v5q14 10 28 0V8"/></svg></span>';
const logoBrush = '<svg class="logo-brush" viewBox="0 0 42 42" aria-hidden="true"><path d="m19 22 12-17q3-4 6-1t0 6L24 26Z" fill="#b58b61" stroke="#77573e"/><path d="m17 21 10 7-6 7-12-8Z" fill="#d4c4a5" stroke="#937c5e"/><path d="m10 28-5 5m9-3-5 6m9-3-5 6" stroke="#a78c68"/></svg>';
const phone = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 3 3 5-2 2c1.2 3 3 4.8 6 6l2-2 5 3c-.5 3-2 4-4 4C9 20 4 15 3 7c0-2 1-3.5 4-4Z"/></svg>';
const chat = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a9 9 0 0 1-13.4 7.9L3 21l1.6-4.6A9 9 0 1 1 21 11.5Z"/><path d="M8 9c1 3 2 4 5 5l2-1"/></svg>';
const pin = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/></svg>';
const chair = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M13 26V9h22v17M10 26h28v9H10zM13 35v8m22-8v8M19 10v15m10-15v15"/></svg>';
const wood = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M7 14h34v10H7zM11 24v19m26-19v19M8 7h32M18 14v10m13-10v10"/></svg>';
const restore = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M11 16a15 15 0 1 1-1 15M5 9l6 7 8-5M16 28l6 6 12-15"/></svg>';

function image(slug, alt, { className = '', sizes = '(max-width: 640px) calc(100vw - 44px), (max-width: 960px) calc(50vw - 39px), (max-width: 1180px) calc(33.333vw - 43px), (max-width: 1352px) calc(33.333vw - 54px), 398px', eager = false } = {}) {
  const entry = images.get(slug);
  if (!entry) throw new Error(`Missing image: ${slug}`);
  return `<img${className ? ` class="${className}"` : ''} src="/assets/images/${slug}-900.webp" srcset="${entry.variants.map(v => `/assets/images/${v.file} ${v.width}w`).join(', ')}" sizes="${sizes}" width="${entry.source_width}" height="${entry.source_height}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

async function fingerprint(file, append = []) {
  const source = Buffer.from((await Promise.all([file, ...append].map(name => readFile(path.join(assets, name), 'utf8')))).join('\n'));
  const hash = createHash('sha256').update(source).digest('hex').slice(0, 10);
  const extension = path.extname(file);
  const name = `${path.basename(file, extension)}.${hash}${extension}`;
  await writeFile(path.join(assets, name), source);
  return `/assets/${name}`;
}

await mkdir(path.join(publicDir, 'ru'), { recursive: true });
const css = await fingerprint('style.css', ['classic.css', 'motion.css', 'gallery.css', 'atelier.css']);
const js = await fingerprint('main.js', ['atelier.js']);
for (const file of await readdir(assets)) {
  if (/^(style|main)\.[a-f0-9]{10}\.(css|js)$/.test(file) && ![path.basename(css), path.basename(js)].includes(file)) {
    await unlink(path.join(assets, file));
  }
}

function schema(lang, t, url) {
  const organization = `${site.url}/#organization`;
  const photoCaptions = new Map(gallery.map(([slug]) => [slug, t.gallery[slug]]));
  for (const [, title, , before, after] of t.comparison) {
    if (!photoCaptions.has(before)) photoCaptions.set(before, `${title} — ${t.before.toLowerCase()}`);
    if (!photoCaptions.has(after)) photoCaptions.set(after, `${title} — ${t.after.toLowerCase()}`);
  }
  const photoId = slug => `${site.url}/#image-${slug}`;
  const photographs = [...photoCaptions].map(([slug, caption]) => {
    const entry = images.get(slug);
    const full = entry.variants.at(-1);
    return { '@type': 'ImageObject', '@id': photoId(slug), contentUrl: `${site.url}/assets/images/${full.file}`, thumbnailUrl: `${site.url}/assets/images/${entry.variants[0].file}`, name: caption, caption, width: full.width, height: full.height, encodingFormat: 'image/webp', inLanguage: lang };
  });
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': organization, name: 'RESTMOB', url: `${site.url}/`, logo: `${site.url}/assets/logo.svg`, telephone: site.phone, areaServed: [{ '@type': 'City', name: 'Chișinău' }, { '@type': 'Country', name: 'Moldova' }], contactPoint: { '@type': 'ContactPoint', telephone: site.phone, contactType: 'customer service', availableLanguage: ['Romanian', 'Russian'] } },
      { '@type': 'WebSite', '@id': `${site.url}/#website`, url: `${site.url}/`, name: 'RESTMOB', inLanguage: ['ro', 'ru'], publisher: { '@id': organization } },
      { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: t.title, description: t.description, inLanguage: lang, isPartOf: { '@id': `${site.url}/#website` }, about: { '@id': organization }, primaryImageOfPage: { '@id': photoId('fotoliu-design') }, image: [...photoCaptions.keys()].map(slug => ({ '@id': photoId(slug) })), mentions: { '@id': `${url}#lucrari` } },
      ...t.services.map(([name, description], index) => ({ '@type': 'Service', '@id': `${url}#service-${index + 1}`, name, description, provider: { '@id': organization }, areaServed: { '@type': 'City', name: 'Chișinău' }, url: `${url}#servicii` })),
      { '@type': 'ItemList', '@id': `${url}#lucrari`, name: lang === 'ro' ? 'Fotografii din lucrările RESTMOB' : 'Фотографии работ RESTMOB', numberOfItems: gallery.length, itemListOrder: 'https://schema.org/ItemListUnordered', itemListElement: gallery.map(([slug], index) => ({ '@type': 'ListItem', position: index + 1, item: { '@id': photoId(slug) } })) },
      ...photographs,
    ],
  }).replace(/</g, '\\u003c');
}

function render(lang) {
  const t = copy[lang];
  const url = `${site.url}${lang === 'ro' ? '/' : '/ru/'}`;
  const ids = ['servicii', 'transformari', 'lucrari', 'despre', 'contact'];
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(t.title)}</title>
  <meta name="description" content="${esc(t.description)}">
  <meta name="theme-color" content="#f6f3ec">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${url}">
  <link rel="alternate" hreflang="ro" href="${site.url}/">
  <link rel="alternate" hreflang="ru" href="${site.url}/ru/">
  <link rel="alternate" hreflang="x-default" href="${site.url}/">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="RESTMOB">
  <meta property="og:title" content="${esc(t.title)}">
  <meta property="og:description" content="${esc(t.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:locale" content="${lang === 'ro' ? 'ro_MD' : 'ru_MD'}">
  <meta property="og:locale:alternate" content="${lang === 'ro' ? 'ru_MD' : 'ro_MD'}">
  <meta property="og:image" content="${site.url}/assets/images/og-cover.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="RESTMOB — ${esc(t.eyebrow)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(t.title)}">
  <meta name="twitter:description" content="${esc(t.description)}">
  <meta name="twitter:image" content="${site.url}/assets/images/og-cover.jpg">
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
  <link rel="stylesheet" href="${css}">
  <script type="application/ld+json">${schema(lang, t, url)}</script>
  <script src="${js}" defer></script>
  <script>window.si=window.si||function(){(window.siq=window.siq||[]).push(arguments);};</script>
  <script defer src="/_vercel/speed-insights/script.js"></script>
</head>
<body id="sus">
  <a class="skip-link" href="#continut">${t.skip}</a>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="${lang === 'ro' ? '/' : '/ru/'}" aria-label="RESTMOB ${lang === 'ro' ? 'prima pagină' : 'главная'}"><span class="brand-name brand-restored">RESTMOB<span class="brand-dot">.</span>${logoBrush}</span><span class="brand-tagline">${t.tagline}</span></a>
      <nav id="main-nav" aria-label="${lang === 'ro' ? 'Navigare principală' : 'Основная навигация'}">${t.nav.map((name, i) => `<a href="#${ids[i]}">${name}</a>`).join('')}</nav>
      <div class="header-actions">
        <div class="language-switch" aria-label="${lang === 'ro' ? 'Limba site-ului' : 'Язык сайта'}"><a href="/" lang="ro" hreflang="ro"${lang === 'ro' ? ' aria-current="page"' : ''}>RO</a><span aria-hidden="true">/</span><a href="/ru/" lang="ru" hreflang="ru"${lang === 'ru' ? ' aria-current="page"' : ''}>RU</a></div>
        <a class="header-call" href="tel:${site.phone}" aria-label="${esc(t.call)}: ${site.phoneDisplay}">${phone}<span>${t.call}</span></a>
        <button id="menu-toggle" type="button" aria-controls="main-nav" aria-expanded="false" aria-label="${t.menu}"><span></span><span></span></button>
      </div>
    </div>
  </header>
  <main id="continut">
    <section class="hero container" aria-labelledby="hero-title">
      <div class="hero-copy">
        <p class="eyebrow"><span class="tiny-line"></span>${t.eyebrow}</p>
        <h1 id="hero-title">${t.hero}</h1>
        <p class="hero-intro">${t.intro}</p>
        <a class="button button-primary button-stitch" href="#contact">${t.heroCta}${diagonal}</a>
        <a class="text-link hero-secondary" href="#transformari">${t.heroSecondary}${arrow}</a>
        <div class="hero-materials"><span>${t.heroFoot}</span><span class="separator" aria-hidden="true">✳</span><span>${t.heroFoot2}</span></div>
      </div>
      <figure class="hero-visual">
        ${image('fotoliu-design', t.heroAlt, { className: 'hero-image', sizes: '(max-width: 640px) calc(100vw - 44px), (max-width: 960px) calc(50vw - 47px), 48vw', eager: true })}
        <div class="hero-seal" aria-hidden="true"><span>RESTMOB</span><svg viewBox="0 0 32 32"><path d="M16 3v26M3 16h26M7 7l18 18M7 25 25 7"/></svg><span>CHIȘINĂU</span></div>
        <figcaption><span><small>${t.heroCaptionSmall}</small>${t.heroCaption}</span><a href="#lucrari" aria-label="${esc(t.nav[2])}">${diagonal}</a></figcaption>
      </figure>
    </section>
    <div class="trust-strip container">${t.strip.map(([title, text], i) => `<div><span class="strip-symbol" aria-hidden="true">${['✳', '◇', '↗'][i]}</span><span><strong>${title}</strong><small>${text}</small></span></div>`).join('')}</div>

    <section id="servicii" class="section services-section container" aria-labelledby="services-title">
      <div class="section-heading"><div><p class="eyebrow">${t.servicesLabel}</p><h2 id="services-title">${t.servicesHeading}</h2></div><p class="section-intro">${t.servicesIntro}</p></div>
      <div class="services-grid">${t.services.map(([title, description, tag], i) => `<article class="service-card" data-reveal><div class="service-top">${[wood, chair, restore][i]}<span>0${i + 1}</span></div><h3>${title}</h3><p>${description}</p><a href="#contact" class="service-link"><span>${tag}</span>${diagonal}<span class="sr-only"> — ${esc(t.call)}</span></a></article>`).join('')}</div>
    </section>

    <section id="transformari" class="section comparison-section" aria-labelledby="comparison-title"><div class="container">
      <div class="section-heading"><div><p class="eyebrow">${t.compareLabel}</p><h2 id="comparison-title">${t.compareHeading}</h2></div><p class="section-intro">${t.compareIntro}</p></div>
      <div class="comparison-tabs" data-comparison-tabs role="tablist" aria-label="${esc(t.nav[1])}" hidden>${t.comparison.map(([id, title], i) => `<button type="button" id="tab-${id}" role="tab" data-panel="${id}" aria-controls="comparison-${id}" aria-selected="${i === 0}">${title}</button>`).join('')}</div>
      ${t.comparison.map(([id, title, description, before, after], i) => `<div class="comparison-panel${id === 'table' ? ' comparison-panel--portrait' : ''}" id="comparison-${id}" role="tabpanel" aria-labelledby="tab-${id}"><div class="compare-frame compare-${id}">
        ${image(after, `${title} — ${t.after.toLowerCase()}`, { className: 'compare-after', sizes: id === 'table' ? '(max-width: 640px) calc(100vw - 44px), 430px' : id === 'sofa' ? '(max-width: 640px) calc(100vw - 44px), (max-width: 836px) calc(100vw - 56px), 780px' : '(max-width: 640px) calc(100vw - 44px), (max-width: 960px) calc(100vw - 56px), 1040px' })}
        ${image(before, `${title} — ${t.before.toLowerCase()}`, { className: 'compare-before', sizes: id === 'table' ? '(max-width: 640px) calc(100vw - 44px), 430px' : id === 'sofa' ? '(max-width: 640px) calc(100vw - 44px), (max-width: 836px) calc(100vw - 56px), 780px' : '(max-width: 640px) calc(100vw - 44px), (max-width: 960px) calc(100vw - 56px), 1040px' })}
        <span class="compare-label label-before">${t.before}</span><span class="compare-label label-after">${t.after}</span>
        <span class="compare-handle" aria-hidden="true"><span>‹<i></i>›</span></span>
        <input class="compare-range" type="range" min="0" max="100" value="50" aria-label="${esc(t.compareControl)} — ${esc(title)}">
      </div><div class="comparison-caption"><div><span class="work-index">0${i + 1}</span><h3>${title}</h3><p>${description}</p></div><span class="compare-instruction">↔ ${t.compareHint}</span></div></div>`).join('')}
    </div></section>

    <section id="lucrari" class="section gallery-section container" aria-labelledby="gallery-title">
      <div class="section-heading"><div><p class="eyebrow">${t.galleryLabel}</p><h2 id="gallery-title">${t.galleryHeading}</h2></div><p class="section-intro">${t.galleryIntro}</p></div>
      ${renderGallery({ lang, t, gallery, images, image, esc, diagonal })}
    </section>

    <section id="despre" class="section about-section" aria-labelledby="about-title"><div class="container about-grid">
      <div class="about-images" data-reveal>${image('scaun-alb', t.gallery['scaun-alb'], { className: 'about-main-image', sizes: '(max-width: 640px) 70vw, 32vw' })}<div class="about-detail">${image('ornament-restaurat', t.gallery['ornament-restaurat'], { sizes: '(max-width: 640px) 40vw, 20vw' })}<span>RESTMOB · ${lang === 'ro' ? 'DETALII CARE CONTEAZĂ' : 'ДЕТАЛИ ИМЕЮТ ЗНАЧЕНИЕ'}</span></div></div>
      <div class="about-copy"><p class="eyebrow">${t.aboutLabel}</p><h2 id="about-title">${t.aboutHeading}</h2><p>${t.aboutP}</p><p>${t.aboutP2}</p><div class="about-note"><span aria-hidden="true">✳</span><p>${t.aboutNote}</p></div></div>
    </div></section>

    <section class="section process-section container" aria-labelledby="process-title"><div class="section-heading"><div><p class="eyebrow">${t.processLabel}</p><h2 id="process-title">${t.processHeading}</h2></div><a class="text-link" href="${site.whatsapp}" target="_blank" rel="noopener noreferrer">${t.writeWhatsapp}${diagonal}</a></div><div class="process-grid">${t.steps.map(([title, text], i) => `<article data-reveal><span class="step-number">0${i + 1}</span><h3>${title}</h3><p>${text}</p></article>`).join('')}</div></section>

    <section class="section faq-section container" aria-labelledby="faq-title"><div class="faq-heading"><p class="eyebrow">${t.faqLabel}</p><h2 id="faq-title">${t.faqHeading}</h2></div><div class="faq-list">${t.faq.map(([question, answer]) => `<details class="faq-drawer"><summary>${question}${drawerHandle}</summary><div class="drawer-content"><p>${answer}</p></div></details>`).join('')}</div></section>

    <section id="contact" class="contact-section" aria-labelledby="contact-title"><div class="container contact-grid"><div><p class="eyebrow">${t.contactLabel}</p><h2 id="contact-title">${t.contactHeading}</h2><p class="contact-intro">${t.contactIntro}</p><div class="contact-buttons"><a class="button button-light" href="${site.whatsapp}" target="_blank" rel="noopener noreferrer">${chat}${t.writeWhatsapp}${diagonal}</a><a class="button button-contact-outline" href="${site.viber}">${t.writeViber}${diagonal}</a></div></div><div class="contact-details"><p class="eyebrow">${t.phoneLabel}</p><a class="phone-number" href="tel:${site.phone}">${site.phoneDisplay}</a><p class="contact-location">${pin}${t.location}</p><p class="contact-languages">${t.contactNote}</p>${renderContactCompanion()}</div></div></section>
  </main>
  <footer class="site-footer"><div class="container footer-top"><a class="brand" href="${lang === 'ro' ? '/' : '/ru/'}"><span class="brand-name">RESTMOB<span class="brand-dot">.</span></span><span class="footer-tagline">${t.footer}</span></a><a class="back-top" href="#sus">${t.top}<span aria-hidden="true">↑</span></a></div><div class="container footer-bottom"><small>© ${new Date().getUTCFullYear()} RESTMOB. ${t.rights}</small><div><a href="/" lang="ro" hreflang="ro">Română</a><span aria-hidden="true">/</span><a href="/ru/" lang="ru" hreflang="ru">Русский</a></div><small>Chișinău · Moldova</small></div></footer>
  ${renderCompanion({ t, esc })}
  <dialog id="lightbox" aria-labelledby="lightbox-caption"><div class="lightbox-inner"><div class="lightbox-toolbar"><span id="lightbox-count"></span><button type="button" data-lightbox-close aria-label="${t.close}">×</button></div><div class="lightbox-stage"><button class="lightbox-arrow" type="button" data-lightbox-prev aria-label="${t.previous}">‹</button><img id="lightbox-image" alt="" decoding="async"><button class="lightbox-arrow" type="button" data-lightbox-next aria-label="${t.next}">›</button></div><p id="lightbox-caption"></p></div></dialog>
</body>
</html>`;
}

await writeFile(path.join(publicDir, 'index.html'), render('ro'));
await writeFile(path.join(publicDir, 'ru', 'index.html'), render('ru'));
await writeFile(path.join(publicDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);
const sitemapPhotos = [...new Set([...gallery.map(([slug]) => slug), ...Object.values(copy).flatMap(t => t.comparison.flatMap(([, , , before, after]) => [before, after]))])];
await writeFile(path.join(publicDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${['/', '/ru/'].map(page => `<url><loc>${site.url}${page}</loc><xhtml:link rel="alternate" hreflang="ro" href="${site.url}/"/><xhtml:link rel="alternate" hreflang="ru" href="${site.url}/ru/"/><xhtml:link rel="alternate" hreflang="x-default" href="${site.url}/"/>${sitemapPhotos.map(slug => `<image:image><image:loc>${site.url}/assets/images/${images.get(slug).variants.at(-1).file}</image:loc></image:image>`).join('')}</url>`).join('\n')}
</urlset>\n`);
await writeFile(path.join(publicDir, '404.html'), `<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>404 — RESTMOB</title><link rel="icon" href="/assets/favicon.svg"><link rel="stylesheet" href="${css}"></head><body><main class="not-found container"><a class="brand" href="/"><span class="brand-name">RESTMOB.</span></a><p class="eyebrow">404</p><h1>${copy.ro.notFound}</h1><p lang="ru">${copy.ru.notFound}</p><a class="button button-primary" href="/">${copy.ro.backHome}${arrow}</a><a class="text-link" lang="ru" href="/ru/">${copy.ru.backHome}${arrow}</a></main></body></html>`);
console.log('Built: public/index.html, public/ru/index.html, 404.html, sitemap.xml, robots.txt.');
console.log(`Assets: ${css}, ${js}. No runtime dependencies.`);
