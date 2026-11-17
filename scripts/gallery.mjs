/** A concise selection in complete HTML, enhanced with bounded gallery pages. */
export function renderGallery({ lang, t, gallery, images, image, esc, diagonal }) {
  const c = lang === 'ru' ? {
    filter: 'Выбрать фотографии', work: 'Фотография',
    total: 'Фотографии из портфолио', pages: 'Страницы галереи', previous: 'Назад', next: 'Далее',
    hint: 'Нажмите на фотографию, чтобы рассмотреть детали.',
  } : {
    filter: 'Alege fotografiile', work: 'Fotografia',
    total: 'Fotografii din portofoliu', pages: 'Paginile galeriei', previous: 'Înapoi', next: 'Înainte',
    hint: 'Deschide o fotografie pentru a vedea detaliile.',
  };
  return `<div class="work-gallery">
    <div class="gallery-toolbar" data-gallery-controls><div class="gallery-filters" data-gallery-filters role="group" aria-label="${esc(c.filter)}" hidden>${['all', 'soft', 'chairs', 'wood'].map((key, index) => `<button type="button" data-filter="${key}" aria-pressed="${index === 0}">${esc(t.filters[index])}</button>`).join('')}</div><p class="gallery-hint">${esc(c.hint)}</p></div>
    <div id="gallery-grid" class="gallery-grid">${gallery.map(([slug, category], index) => {
      const entry = images.get(slug);
      const full = entry.variants.at(-1);
      const title = t.gallery[slug];
      const type = t.filters[['all', 'soft', 'chairs', 'wood'].indexOf(category)];
      return `<article class="gallery-item" data-category="${category}">
        <a class="gallery-link" href="/assets/images/${full.file}" data-title="${esc(title)}" data-full-width="${full.width}" data-full-height="${full.height}" aria-label="${esc(t.openImage)}: ${esc(title)}">
          <figure class="gallery-figure"><div class="gallery-image-wrap gallery-photo">${image(slug, title, { sizes: '(max-width: 640px) calc((100vw - 56px) / 2), (max-width: 960px) calc((100vw - 72px) / 2), 410px' })}<span class="gallery-zoom" aria-hidden="true">${diagonal}</span></div>
          <figcaption class="gallery-caption"><div><p class="gallery-meta"><span class="gallery-category">${esc(type)}</span><span class="gallery-meta-line" aria-hidden="true"></span><span class="gallery-index"><span class="sr-only">${esc(c.work)} </span>${String(index + 1).padStart(2, '0')}</span></p><h3>${esc(t.galleryLabels?.[slug] || title)}</h3></div></figcaption></figure>
        </a>
      </article>`;
    }).join('')}</div>
    <div class="gallery-bottom" data-gallery-controls><p id="gallery-status" class="gallery-status" aria-live="polite" aria-atomic="true">${esc(c.total)}: ${gallery.length}</p><div class="gallery-pagination" data-gallery-pagination role="group" aria-label="${esc(c.pages)}" hidden><button type="button" data-gallery-prev aria-controls="gallery-grid"><span aria-hidden="true">←</span>${esc(c.previous)}</button><span id="gallery-page" class="gallery-page"></span><button type="button" data-gallery-next aria-controls="gallery-grid">${esc(c.next)}<span aria-hidden="true">→</span></button></div></div>
  </div>`;
}
