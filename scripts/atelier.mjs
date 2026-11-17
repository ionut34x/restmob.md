const chairPaths = `<path d="M29 54 26 18Q44 8 61 18L58 54 53 54 56 21Q43 15 31 21L34 54Z"/>
  <path d="m29 65-6 32h5l8-31m18-1 6 32h5l-4-33M31 79h27"/>
  <path d="M29 51 21 60l5 7h38l4-7-10-9Z"/>
  <path d="M21 60h47M28 66l-1 15m34-15 2 15M34 26v22m18-22v22"/>`;

const brush = `<g class="chair-brush" fill="#b78b59" stroke="#84603d"><path d="m70 38 9-19q2-3 4-1t0 4L74 40Z"/><path d="m69 37 7 4-4 7-8-4Z" fill="#d6c3a0"/><path d="m65 44-3 5m6-4-3 5m6-3-3 5"/></g>`;

function renderChairArtwork({ contact = false } = {}) {
  return `<ellipse class="chair-ground" cx="43" cy="101" rx="24" ry="3"/>
    <g class="chair-body">
      <g fill="#eadbc2" stroke="#8c7151">${chairPaths}</g>
      <g class="chair-polish" fill="#c49762" stroke="#7c5539">${chairPaths}</g>
      <path class="chair-cushion" d="m28 52-4 7q20 6 40 0l-7-7Z" fill="#677755" stroke="#4e6044"/>
      <path d="M43 25q-8 6 0 14 8-8 0-14Zm0 14v8" stroke="#94734b" fill="none"/>
      ${contact ? '' : brush}
    </g>
    ${contact ? brush : ''}
    <g class="chair-spark"><path d="M17 27v8m-4-4h8M68 62v7m-3-3h6"/></g>`;
}

export function renderCompanion({ t, esc }) {
  return `<a class="atelier-companion" data-atelier-companion href="#sus" aria-label="${esc(t.top)}" title="${esc(t.top)}" hidden>
    <svg class="atelier-chair" viewBox="0 0 88 112" aria-hidden="true" focusable="false">${renderChairArtwork()}</svg>
    <span class="atelier-companion-label" aria-hidden="true">${esc(t.top)}</span>
  </a>`;
}

export function renderContactCompanion() {
  return `<div class="contact-chair-scene" data-contact-chair aria-hidden="true">
    <svg class="contact-chair" viewBox="0 0 100 112" focusable="false">${renderChairArtwork({ contact: true })}</svg>
  </div>`;
}
